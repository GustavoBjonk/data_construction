-- =============================================================================
-- DataConstruction — 0002: conteúdo editorial
--
-- Não destrutiva. Os ids textuais existentes em data/*.ts são preservados como
-- chave primária, mantendo as URLs atuais (/artigos/<id>, /noticias/<slug>...).
--
-- Visibilidade pública: status = 'published', ou 'scheduled' com data já
-- alcançada (agendamento funciona sem job). Escrita: editor, admin, superadmin.
-- Exclusão: apenas admin/superadmin. Toda escrita gera registro em audit_log.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status' and typnamespace = 'public'::regnamespace) then
    create type public.content_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'verification_status' and typnamespace = 'public'::regnamespace) then
    -- unverified: ainda não conferida por revisor; verified: conferida; flagged: problema encontrado.
    create type public.verification_status as enum ('unverified', 'verified', 'flagged');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

create table if not exists public.articles (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 500),
  category text not null,
  -- Blocos no formato atual: parágrafo, "## Título" ou bloco de código cercado.
  body text[] not null default '{}',
  citations jsonb not null default '[]'::jsonb check (jsonb_typeof(citations) = 'array'),
  author_name text not null,
  author_bio text not null default '',
  reading_time_minutes integer not null check (reading_time_minutes between 1 and 240),
  published_on date,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint articles_schedule_check check (status <> 'scheduled' or scheduled_for is not null),
  -- Artigo visível ao público sempre tem data de publicação real.
  constraint articles_published_on_check check (status not in ('published', 'scheduled') or published_on is not null)
);

create table if not exists public.news (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 250),
  summary text not null,
  relevance text not null default '',
  published_on date not null,          -- data original da publicação na fonte
  collected_at timestamptz not null default now(),
  verified_on date,                    -- última verificação editorial declarada
  verification public.verification_status not null default 'unverified',
  verification_notes text,
  categories text[] not null check (cardinality(categories) >= 1),
  tags text[] not null default '{}',
  source_name text not null,
  source_url text not null check (source_url ~ '^https?://'),
  image_url text check (image_url is null or image_url ~ '^https://'),
  featured boolean not null default false,
  related jsonb not null default '{}'::jsonb check (jsonb_typeof(related) = 'object'),
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint news_schedule_check check (status <> 'scheduled' or scheduled_for is not null)
);

-- A mesma URL de origem não pode ser importada duas vezes (deduplicação).
create unique index if not exists news_source_url_key on public.news (lower(source_url));
create index if not exists news_published_on_idx on public.news (published_on desc);

create table if not exists public.datasets (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null,
  category text not null,
  difficulty text not null check (difficulty in ('Iniciante', 'Intermediário', 'Avançado')),
  size_label text,
  format text,
  topics text[] not null default '{}',
  technologies text[] not null default '{}',
  ideal_for text[] not null default '{}',
  source_name text not null,
  source_url text not null check (source_url ~ '^https?://'),
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.courses (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  platform text not null,
  area text not null,
  course_type text not null check (course_type in ('free', 'paid')),
  price numeric(10, 2) check (price is null or price >= 0),
  currency char(3) not null default 'BRL',
  price_checked_on date,
  duration text,
  level text not null check (level in ('Iniciante', 'Intermediário', 'Avançado')),
  description text not null,
  skills text[] not null default '{}',
  url text not null check (url ~ '^https?://'),
  -- Links patrocinados/afiliados precisam ser sinalizados na interface.
  is_sponsored boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.roadmaps (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null,
  level text not null,
  estimated_duration text not null,
  -- Área de projetos relacionada (ver ROADMAP_PROJECT_AREAS).
  project_area text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.roadmap_steps (
  id text primary key,
  roadmap_id text not null references public.roadmaps (id) on delete cascade,
  position integer not null check (position >= 1),
  title text not null,
  description text not null,
  topics text[] not null default '{}',
  technologies text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roadmap_id, position) deferrable initially deferred
);

create table if not exists public.roadmap_step_courses (
  step_id text not null references public.roadmap_steps (id) on delete cascade,
  course_id text not null references public.courses (id) on delete restrict,
  position integer not null default 0,
  primary key (step_id, course_id)
);

create table if not exists public.projects (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null,
  area text not null,
  difficulty text not null check (difficulty in ('Iniciante', 'Intermediário', 'Avançado')),
  technologies text[] not null default '{}',
  skills text[] not null default '{}',
  estimated_time text not null,
  objective text not null,
  repository_url text check (repository_url is null or repository_url ~ '^https://'),
  demo_url text check (demo_url is null or demo_url ~ '^https://'),
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.organizations (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null,
  category text not null,
  official_site_url text not null check (official_site_url ~ '^https://'),
  donation_url text not null check (donation_url ~ '^https://'),
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create index if not exists roadmap_steps_roadmap_idx on public.roadmap_steps (roadmap_id, position);
create index if not exists roadmap_step_courses_course_idx on public.roadmap_step_courses (course_id);

-- -----------------------------------------------------------------------------
-- Funções de gatilho
-- -----------------------------------------------------------------------------

create or replace function private.is_publicly_visible(status public.content_status, scheduled_for timestamptz)
returns boolean language sql stable set search_path = ''
as $$
  select status = 'published' or (status = 'scheduled' and scheduled_for is not null and scheduled_for <= now());
$$;

grant execute on function private.is_publicly_visible(public.content_status, timestamptz) to anon, authenticated, service_role;

-- Autoria e datas são definidas pelo servidor; o cliente não consegue forjá-las.
create or replace function private.stamp_content_row()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := auth.uid();
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create or replace function private.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id text := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
  details jsonb := '{}'::jsonb;
begin
  if tg_op = 'UPDATE' and (to_jsonb(old) ->> 'status') is distinct from (to_jsonb(new) ->> 'status') then
    details := jsonb_build_object('status_from', to_jsonb(old) ->> 'status', 'status_to', to_jsonb(new) ->> 'status');
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'content.' || lower(tg_op), tg_table_name, row_id, details);

  return coalesce(new, old);
end;
$$;

revoke all on function private.stamp_content_row() from public;
revoke all on function private.audit_content_change() from public;

-- -----------------------------------------------------------------------------
-- Permissões, RLS e gatilhos das tabelas principais
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['articles', 'news', 'datasets', 'courses', 'roadmaps', 'projects', 'organizations']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (private.is_publicly_visible(status, scheduled_for))',
      t || '_public_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_editor_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.can_edit_content()))',
      t || '_editor_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_editor_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.can_edit_content()))',
      t || '_editor_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_editor_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.can_edit_content())) with check ((select private.can_edit_content()))',
      t || '_editor_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_admin_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_admin()))',
      t || '_admin_delete', t);

    execute format(
      'create or replace trigger %I before insert or update on public.%I for each row execute function private.stamp_content_row()',
      t || '_stamp', t);
    execute format(
      'create or replace trigger %I after insert or update or delete on public.%I for each row execute function private.audit_content_change()',
      t || '_audit', t);
  end loop;
end
$$;

-- Etapas e vínculos de trilhas herdam a visibilidade da trilha.
do $$
declare
  t text;
begin
  foreach t in array array['roadmap_steps', 'roadmap_step_courses']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);

    execute format('drop policy if exists %I on public.%I', t || '_editor_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.can_edit_content())) with check ((select private.can_edit_content()))',
      t || '_editor_write', t);
  end loop;
end
$$;

drop policy if exists roadmap_steps_public_read on public.roadmap_steps;
create policy roadmap_steps_public_read on public.roadmap_steps
  for select to anon, authenticated
  using (exists (select 1 from public.roadmaps r where r.id = roadmap_id));

drop policy if exists roadmap_step_courses_public_read on public.roadmap_step_courses;
create policy roadmap_step_courses_public_read on public.roadmap_step_courses
  for select to anon, authenticated
  using (exists (select 1 from public.roadmap_steps s where s.id = step_id));

create or replace trigger roadmap_steps_touch_updated_at
  before update on public.roadmap_steps
  for each row execute function private.touch_updated_at();

-- Rede de segurança editorial: notícia com problema confirmado ('flagged')
-- some da visão pública mesmo que continue com status 'published'.
-- RESTRICTIVE: combina com AND às demais políticas de leitura.
drop policy if exists news_hide_flagged on public.news;
create policy news_hide_flagged on public.news
  as restrictive
  for select to anon, authenticated
  using (verification <> 'flagged' or (select private.can_edit_content()));
