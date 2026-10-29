-- Emulação mínima do ambiente Supabase para testes locais com PGlite.
-- Reproduz o que importa para RLS: papéis, auth.uid() e os privilégios
-- padrão que o Supabase concede em `public` (ALL para anon/authenticated).

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- No Supabase, auth.uid() lê o "sub" do JWT da requisição.
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant execute on function auth.uid() to anon, authenticated, service_role;

-- Privilégios padrão do Supabase: é por isso que as migrações precisam de REVOKE.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
