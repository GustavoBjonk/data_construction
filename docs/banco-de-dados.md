# Banco de dados e autenticação (Supabase) — runbook

Estado: **pronto para aplicar, ainda não aplicado** no projeto remoto.
Nenhuma etapa marcada com 🔒 deve ser executada sem autorização explícita.

---

## 1. Arquivos

| Caminho | Conteúdo |
|---|---|
| `supabase/migrations/20261028000100_profiles_roles_audit.sql` | Perfis, papéis, situação da conta, auditoria, `set_user_role` / `set_user_status`, gatilho de cadastro, proteção do último superadmin, backfill de contas existentes |
| `supabase/migrations/20261028000200_content.sql` | Conteúdo editorial com RLS, autoria/auditoria automáticas e ocultação de notícias `flagged` |
| `supabase/seed.sql` | Conteúdo de `data/*.ts` (`npm run db:seed:generate`) |
| `scripts/remote-security-check.mts` | Verificação real no projeto (🔒 `npm run db:check:remote -- --confirm-remote`) |
| `scripts/generate-db-types.mts` | Tipos TypeScript do schema real (`npm run db:types`) |
| `docs/auditoria-noticias.md` | Fila de revisão editorial (`npm run audit:news`) |

---

## 2. Revisão de riscos das migrações

| # | Risco | Situação |
|---|---|---|
| 1 | Supabase concede `ALL` em `public` para `anon`/`authenticated` por padrão | **Tratado**: toda tabela começa com `REVOKE ALL` + grants mínimos. Teste: stub reproduz os grants padrão. |
| 2 | Auto-elevação de papel (UPDATE direto, metadados de cadastro, RPC) | **Tratado**: sem grant de escrita em `user_roles`; RPC valida hierarquia. 15 testes. |
| 3 | Contas já existentes no Auth ficariam sem perfil/papel | **Corrigido nesta revisão**: backfill idempotente no fim da migração 0001. |
| 4 | Sistema ficar sem superadmin (rebaixar, suspender ou excluir o último — inclusive pelo painel do Supabase) | **Corrigido nesta revisão**: gatilho `protect_last_superadmin` bloqueia. |
| 5 | Desempenho de RLS (função avaliada por linha) | **Corrigido nesta revisão**: chamadas envolvidas em `(select ...)`, avaliadas uma vez por consulta. |
| 6 | Notícia com problema confirmado continuar pública | **Corrigido nesta revisão**: política *restrictive* oculta `verification = 'flagged'`. |
| 7 | Gatilho em `auth.users` falhar e bloquear cadastros | Mitigado: o gatilho só insere valores com fallback e `on conflict do nothing`. **Verificar** com o teste real (seção 6). |
| 8 | Reaplicar migração por engano | Mitigado: idempotente (testado reaplicando sobre dados existentes). |
| 9 | Excluir um curso usado por uma trilha | Intencionalmente bloqueado (`on delete restrict`). |
| 10 | Perfis são públicos | Por design (sem e-mail). Usuário suspenso ainda edita o próprio perfil — revisar na Fase 5. |
| 11 | Funções `SECURITY DEFINER` | Todas com `search_path = ''` e nomes qualificados; as do schema `private` não são expostas pela API. |
| 12 | Diferenças entre PGlite (testes) e Supabase real | Coberto pela verificação real (seção 6) após aplicar. |

Rodar `supabase db lint` (Supabase CLI) ou o **Security Advisor** do painel após aplicar (passo 8 do checklist).

---

## 3. Segurança das 97 notícias importadas

Verificado por `tests/unit/news-integrity.test.ts` (roda a cada `npm test`) e `npm run audit:news`:

- **0 erros bloqueantes**: todas as URLs são `http(s)` (todas HTTPS), sem datas futuras, sem duplicidade de id/slug/URL, sem HTML ou script nos textos, ano coerente com a data.
- O site renderiza tudo como texto (React escapa); o único HTML gerado é o JSON-LD, serializado com escape de `<`, `>` e `&`.
- **Exibição honesta**: o site agora mostra "Revisão editorial: **Pendente**" em vez de "Verificado em 18 set 2026", a contagem real "0 de 97" revisadas e um aviso para conferir dados na fonte. Nada foi removido; URLs preservadas.
- **Fila de revisão** em `docs/auditoria-noticias.md`: 2 links quebrados, 1 redirecionamento para página de manutenção, 23 fontes secundárias, 36 notícias com números a conferir, 8 fontes que bloqueiam robôs.
- Ao revisar: marcar `verified` (aparece "Verificada em …") ou `flagged` com nota (sai do ar automaticamente).

---

## 4. Checklist de aplicação segura 🔒

**Antes**
1. [ ] Autorização registrada para aplicar no projeto remoto.
2. [ ] `npm test`, `npm run typecheck` e `npm run build` passando no commit que será aplicado.
3. [ ] Backup: Database → Backups. No plano gratuito os backups automáticos são limitados; se o projeto já tiver dados importantes, exportar antes (`pg_dump` com a connection string do painel).
4. [ ] Confirmar o projeto certo no painel (nome e URL iguais a `NEXT_PUBLIC_SUPABASE_URL`).
5. [ ] Fazer as configurações de Auth da seção 5 **antes** de liberar cadastros.

**Aplicação**
6. [ ] SQL Editor → nova consulta → colar `20261028000100_profiles_roles_audit.sql` → Run. Esperado: "Success. No rows returned".
7. [ ] Repetir com `20261028000200_content.sql`.
8. [ ] Advisors → Security Advisor: nenhum alerta de "RLS disabled" ou "function search path" para estas tabelas/funções.
9. [ ] Colar `supabase/seed.sql` → Run (transação única: aplica tudo ou nada).
10. [ ] Conferir contagens:
    ```sql
    select 'articles' t, count(*) from public.articles union all
    select 'news', count(*) from public.news union all
    select 'datasets', count(*) from public.datasets union all
    select 'courses', count(*) from public.courses union all
    select 'roadmaps', count(*) from public.roadmaps union all
    select 'roadmap_steps', count(*) from public.roadmap_steps union all
    select 'roadmap_step_courses', count(*) from public.roadmap_step_courses union all
    select 'projects', count(*) from public.projects union all
    select 'organizations', count(*) from public.organizations;
    ```
    Esperado: articles 4, news 97, datasets 13, courses 19, roadmaps 7, roadmap_steps 55, roadmap_step_courses 47, projects 31, organizations 5.

**Depois**
11. [ ] `npm run db:types` → `npm run typecheck` (substitui os tipos provisórios).
12. [ ] 🔒 `npm run db:check:remote -- --confirm-remote` → todas as verificações "PASSOU".
13. [ ] Testes manuais de e-mail (seção 6.2).
14. [ ] Criar a sua conta pelo site, confirmar o e-mail e promover a superadmin (seção 7).
15. [ ] Abrir `/admin`: "Banco de dados: Conectado".
16. [ ] Só então, na Vercel: `CONTENT_SOURCE=supabase` (Preview primeiro, depois Production) e comparar páginas.

Se algo falhar nos passos 6–10: parar, não rodar o seed de novo à toa, e consultar a seção 9.

---

## 5. Configuração de Auth, SMTP e URLs

### 5.1 URLs (Authentication → URL Configuration)
- **Site URL**: `https://dataconstruction.vercel.app`
- **Redirect URLs** (uma por linha):
  - `https://dataconstruction.vercel.app/auth/confirm`
  - `http://localhost:3000/auth/confirm`
  - Previews da Vercel, se forem usados: `https://*-<sua-equipe>.vercel.app/auth/confirm`

O app só aceita redirecionamentos internos depois do login (`safeRedirectPath`), e o Supabase só envia links para URLs desta lista.

### 5.2 E-mail e senha (Authentication → Sign In / Providers → Email)
- Email provider: **ativado**
- **Confirm email: ativado** (obrigatório)
- Secure email change: ativado
- Minimum password length: **8**; Password requirements: **letras e dígitos** (o app já exige; o servidor passa a exigir também)
- Leaked password protection: ativar se o plano permitir

### 5.3 Templates (Authentication → Emails → Templates)
O app usa o fluxo SSR com `token_hash`. Trocar o link dos templates:

- **Confirm signup**
  ```html
  <h2>Confirme seu e-mail</h2>
  <p>Para ativar sua conta no DataConstruction, confirme seu e-mail:</p>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/conta">Confirmar e-mail</a></p>
  <p>Se você não criou esta conta, ignore esta mensagem.</p>
  ```
- **Reset password**
  ```html
  <h2>Redefinir senha</h2>
  <p>Recebemos um pedido para redefinir a senha da sua conta no DataConstruction.</p>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Criar nova senha</a></p>
  <p>Se não foi você, ignore esta mensagem; sua senha continua a mesma.</p>
  ```
- Assuntos sugeridos: "Confirme seu e-mail — DataConstruction" e "Redefinição de senha — DataConstruction".

### 5.4 SMTP próprio (Authentication → Emails → SMTP Settings)
O envio padrão do Supabase é para testes (limite muito baixo e só para membros da equipe). Antes de abrir cadastros:
1. Criar conta num provedor (ex.: Resend, Amazon SES, Postmark, Brevo).
2. Verificar o domínio de envio no provedor (registros **SPF**, **DKIM** e, idealmente, **DMARC** no DNS).
3. No Supabase, ativar *Custom SMTP* e preencher: host, porta (465 SSL ou 587 TLS), usuário, senha/API key, remetente (`nao-responda@seu-dominio`) e nome ("DataConstruction").
4. Ajustar **Authentication → Rate Limits → emails por hora** para o volume esperado.
5. Testar com o fluxo 6.2.

Sem domínio próprio não é possível configurar SPF/DKIM — e-mails tendem a cair no spam. Essa é uma dependência externa.

### 5.5 Limites (Authentication → Rate Limits)
Revisar: sign-ups/sign-ins por IP, verificações de token, e-mails por hora. O app já mostra mensagem amigável quando o limite é atingido (HTTP 429).

### 5.6 Chaves (Project Settings → API Keys)
- **Publishable key** (`sb_publishable_…`, ou a `anon` legada) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (local e Vercel).
- **Secret key** (`sb_secret_…`, ou `service_role` legada) → **apenas** no `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`, para o script de verificação. Não colocar na Vercel nesta fase.
- **Access token** pessoal (Account → Access Tokens) → `SUPABASE_ACCESS_TOKEN`, só para `npm run db:types`.

---

## 6. Testes reais

### 6.1 Automatizado — permissões e RLS 🔒
`npm run db:check:remote -- --confirm-remote`

Cria 4 contas temporárias confirmadas pela Admin API (nenhum e-mail enviado), testa 21 cenários pela API pública e **remove tudo** ao final (inclusive em caso de erro):
cadastro → papel `user`; metadado `role` ignorado; visitante sem acesso a tabelas privadas e sem escrita/RPC; 97 notícias públicas; usuário sem auto-elevação nem edição de perfil alheio; editor cria rascunho invisível ao público e não exclui; admin promove até editor, não concede admin, não altera o próprio papel; auditoria registrada; admin exclui.

### 6.2 Manual — fluxos de e-mail (após SMTP)
Usar um e-mail real seu (ex.: `voce+teste1@gmail.com`).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | `/cadastro` com nome, e-mail e senha válidos | Mensagem neutra "Se este e-mail puder ser cadastrado…" |
| 2 | Abrir o e-mail e clicar no link | Cai em `/conta`, logado, papel "Usuário" |
| 3 | Clicar no mesmo link de novo | `/entrar?erro=link` ("link inválido ou expirou") |
| 4 | Sair; `/entrar` com senha errada | "E-mail ou senha incorretos." (sem revelar se a conta existe) |
| 5 | `/entrar` antes de confirmar outro cadastro | "Confirme seu e-mail…" |
| 6 | `/recuperar-senha` com e-mail existente e com inexistente | Mesma mensagem nos dois casos |
| 7 | Link de recuperação → `/redefinir-senha` → nova senha | Volta para `/conta` com "Senha atualizada" |
| 8 | Entrar com a senha antiga | Recusado |
| 9 | Logado como usuário comum, abrir `/admin` | Página 404 |
| 10 | Deslogado, abrir `/admin` | Redireciona para `/entrar?next=/admin` |
| 11 | `/entrar?next=https://exemplo.com` e logar | Vai para `/conta`, nunca para fora |
| 12 | Superadmin suspende a conta de teste em `/admin/usuarios` | Conta de teste perde acesso ao painel; registro no log |

Ao final, excluir as contas de teste em Authentication → Users.

---

## 7. Primeiro superadmin 🔒

Único passo manual de elevação. Depois de criar e confirmar a sua conta pelo site, no SQL Editor:

```sql
update public.user_roles set role = 'superadmin'
where user_id = (select id from auth.users where email = 'SEU-EMAIL');
```

Recomendado: ter **dois** superadmins (o gatilho impede remover o último, então o segundo garante acesso se uma conta for perdida).

---

## 8. Observabilidade

- Eventos operacionais vão para o log como JSON de uma linha com `"source":"dataconstruction"` (Vercel → Logs, filtrar por `dataconstruction`).
  - `content.fallback`: site servindo `data/*.ts` porque o banco falhou;
  - `db.health_failed`: verificação de saúde falhou (inclui "migrações não aplicadas");
  - `auth.role_lookup_failed`: não foi possível ler o papel (acesso ao painel negado por segurança).
- `/admin` mostra: conexão com o banco (com latência), origem do conteúdo **efetiva** (alerta quando o fallback está ativo), notícias aguardando revisão e os últimos eventos da instância.
- Se o banco cair, o painel exibe "Painel indisponível" com orientação, em vez de um 404 silencioso; o site público continua no ar.

---

## 9. Rollback (manual, destrutivo) 🔒

Apaga as tabelas **e os dados**. Fazer backup antes. Com `CONTENT_SOURCE=static`, o site público continua funcionando a partir de `content/*.json`.

```sql
begin;
-- 0002: conteúdo
drop table if exists public.roadmap_step_courses, public.roadmap_steps, public.roadmaps,
  public.articles, public.news, public.datasets, public.courses, public.projects, public.organizations cascade;
drop function if exists private.stamp_content_row(), private.audit_content_change(),
  private.is_publicly_visible(public.content_status, timestamptz);
drop type if exists public.content_status, public.verification_status;
-- 0001: perfis, papéis e auditoria
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.set_user_role(uuid, public.app_role), public.set_user_status(uuid, public.account_status);
drop table if exists public.audit_log, public.user_roles, public.profiles cascade;
drop function if exists private.handle_new_user(), private.touch_updated_at(), private.is_admin(),
  private.can_moderate(), private.can_edit_content(), private.has_any_role(public.app_role[]),
  private.protect_last_superadmin();
drop type if exists public.app_role, public.account_status;
drop schema if exists private;
commit;
```

Rollback parcial (só o conteúdo, mantendo contas): executar apenas o bloco "0002".

---

## 10. Testes locais

```bash
npm test            # segurança/RLS, migração em projeto já em uso, seed, paridade, integridade das notícias
npm run typecheck
npm run build
npm run audit:news  # relatório editorial + links (somente leitura)
```

Os testes usam PGlite (Postgres em WebAssembly) com um stub do schema `auth` e dos grants padrão do Supabase (`tests/db/supabase-stub.sql`).
