-- =============================================================================
-- DataConstruction — 0001: perfis, papéis e auditoria
--
-- Não destrutiva: apenas cria objetos. Rollback manual em docs/banco-de-dados.md.
--
-- Princípios de segurança:
--   * O papel do usuário fica em `user_roles`, tabela SEM permissão de escrita
--     para clientes. A única forma de alterá-lo é `public.set_user_role`, que
--     valida quem está pedindo.
--   * Metadados enviados no cadastro (raw_user_meta_data) são controlados pelo
--     usuário e NUNCA definem papel.
--   * O Supabase concede por padrão ALL em tabelas de `public` para anon e
--     authenticated; por isso cada tabela começa com REVOKE ALL e recebe só o
--     mínimo necessário.
--   * Funções auxiliares ficam no schema `private`, que não é exposto pela API.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace) then
    create type public.app_role as enum ('user', 'moderator', 'editor', 'admin', 'superadmin');
  end if;
  if not exists (select 1 from pg_type where typname = 'account_status' and typnamespace = 'public'::regnamespace) then
    create type public.account_status as enum ('active', 'suspended');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

-- Perfil público. Não contém e-mail nem outros dados privados.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  username text unique check (username ~ '^[a-z0-9_]{3,30}$'),
  avatar_url text check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 500)),
  bio text check (bio is null or char_length(bio) <= 280),
  interests text[] not null default '{}' check (cardinality(interests) <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  status public.account_status not null default 'active',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id);
create index if not exists user_roles_role_idx on public.user_roles (role) where role <> 'user';

-- -----------------------------------------------------------------------------
-- Funções auxiliares (usadas pelas políticas RLS)
-- -----------------------------------------------------------------------------

-- SECURITY DEFINER para ler user_roles sem recursão de RLS. Só revela o papel
-- de quem chama.
create or replace function private.has_any_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'active'
      and ur.role = any (roles)
  );
$$;

create or replace function private.can_edit_content()
returns boolean language sql stable set search_path = ''
as $$ select private.has_any_role(array['editor', 'admin', 'superadmin']::public.app_role[]); $$;

create or replace function private.can_moderate()
returns boolean language sql stable set search_path = ''
as $$ select private.has_any_role(array['moderator', 'admin', 'superadmin']::public.app_role[]); $$;

create or replace function private.is_admin()
returns boolean language sql stable set search_path = ''
as $$ select private.has_any_role(array['admin', 'superadmin']::public.app_role[]); $$;

revoke all on all functions in schema private from public;
grant execute on function private.has_any_role(public.app_role[]) to anon, authenticated, service_role;
grant execute on function private.can_edit_content() to anon, authenticated, service_role;
grant execute on function private.can_moderate() to anon, authenticated, service_role;
grant execute on function private.is_admin() to anon, authenticated, service_role;

-- Mantém updated_at coerente sem depender do cliente.
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Cadastro: cria perfil e papel 'user' para cada novo usuário do Auth
-- -----------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  -- O nome pedido no cadastro é aceito; qualquer outro metadado (inclusive
  -- "role") é ignorado. Sem nome, usa um rótulo neutro — nunca parte do e-mail.
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(requested_name, ''), 'Pessoa usuária'), 60))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function private.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Alteração de papel e situação da conta (única via de escrita em user_roles)
-- -----------------------------------------------------------------------------

-- Regras:
--   * só admin/superadmin ativos podem chamar;
--   * ninguém altera o próprio papel (evita auto-elevação e perda do último superadmin);
--   * somente superadmin concede ou retira os papéis admin e superadmin;
--   * toda alteração é registrada em audit_log.
create or replace function public.set_user_role(target_user uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  caller_role public.app_role;
  previous_role public.app_role;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select role into caller_role
  from public.user_roles
  where user_id = caller and status = 'active';

  if caller_role is null or caller_role not in ('admin', 'superadmin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if target_user = caller then
    raise exception 'cannot_change_own_role' using errcode = '42501';
  end if;

  select role into previous_role
  from public.user_roles
  where user_id = target_user
  for update;

  if previous_role is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  if caller_role <> 'superadmin'
     and (new_role in ('admin', 'superadmin') or previous_role in ('admin', 'superadmin')) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if previous_role = new_role then
    return;
  end if;

  update public.user_roles
  set role = new_role, updated_at = now(), updated_by = caller
  where user_id = target_user;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values (caller, 'user.role_changed', 'user', target_user::text,
          jsonb_build_object('from', previous_role, 'to', new_role));
end;
$$;

-- Mesmas regras de hierarquia para suspender/reativar contas.
create or replace function public.set_user_status(target_user uuid, new_status public.account_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  caller_role public.app_role;
  target_role public.app_role;
  previous_status public.account_status;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select role into caller_role
  from public.user_roles
  where user_id = caller and status = 'active';

  if caller_role is null or caller_role not in ('admin', 'superadmin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if target_user = caller then
    raise exception 'cannot_change_own_status' using errcode = '42501';
  end if;

  select role, status into target_role, previous_status
  from public.user_roles
  where user_id = target_user
  for update;

  if target_role is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  if caller_role <> 'superadmin' and target_role in ('admin', 'superadmin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if previous_status = new_status then
    return;
  end if;

  update public.user_roles
  set status = new_status, updated_at = now(), updated_by = caller
  where user_id = target_user;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values (caller, 'user.status_changed', 'user', target_user::text,
          jsonb_build_object('from', previous_status, 'to', new_status));
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
revoke all on function public.set_user_status(uuid, public.account_status) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
grant execute on function public.set_user_status(uuid, public.account_status) to authenticated;

-- -----------------------------------------------------------------------------
-- Permissões e RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.audit_log from anon, authenticated;

-- profiles: leitura pública; cada pessoa edita apenas os campos do próprio perfil.
grant select on table public.profiles to anon, authenticated;
grant update (display_name, username, avatar_url, bio, interests) on table public.profiles to authenticated;

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon, authenticated
  using (true);

-- Nas políticas, `(select ...)` faz o Postgres avaliar a função uma vez por
-- consulta, e não uma vez por linha (recomendação do Supabase para RLS).

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- user_roles: somente leitura (o próprio papel, ou todos para administradores).
grant select on table public.user_roles to authenticated;

drop policy if exists user_roles_read on public.user_roles;
create policy user_roles_read on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- audit_log: somente administradores leem; escrita apenas por funções/gatilhos.
grant select on table public.audit_log to authenticated;

drop policy if exists audit_log_admin_read on public.audit_log;
create policy audit_log_admin_read on public.audit_log
  for select to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Proteção do último superadmin
-- -----------------------------------------------------------------------------

-- Impede que o sistema fique sem superadmin ativo — inclusive por ações feitas
-- diretamente no painel do Supabase (excluir o usuário cascateia para cá).
create or replace function private.protect_last_superadmin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'superadmin' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'superadmin' or new.status <> 'active')
     and not exists (
       select 1 from public.user_roles
       where role = 'superadmin' and status = 'active' and user_id <> old.user_id
     ) then
    raise exception 'last_superadmin' using errcode = '42501',
      hint = 'Promova outro superadmin antes de remover ou rebaixar este.';
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function private.protect_last_superadmin() from public;

create or replace trigger user_roles_protect_last_superadmin
  before update or delete on public.user_roles
  for each row execute function private.protect_last_superadmin();

-- -----------------------------------------------------------------------------
-- Backfill: contas que já existiam no Auth antes desta migração
-- -----------------------------------------------------------------------------

insert into public.profiles (id, display_name)
select u.id, left(coalesce(nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''), 'Pessoa usuária'), 60)
from auth.users u
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'user'
from auth.users u
on conflict (user_id) do nothing;
