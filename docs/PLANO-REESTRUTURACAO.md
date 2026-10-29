# DataConstruction — Auditoria e plano de reestruturação

Data da auditoria: 28/10/2026 · Branch: `main` (commit `4ee3c00`)

## 1. Estado atual

### Stack
| Item | Situação |
|---|---|
| Framework | Next.js 16.3.5 (App Router, Turbopack), React 19.3 |
| Linguagem | TypeScript 5.5 (`strict`, `noUncheckedIndexedAccess`) |
| Estilo | Tailwind CSS 3.4, tema claro (slate + azul `#2563EB`), sem tokens semânticos |
| Fontes | Inter + JetBrains Mono via `next/font` |
| Dependências de runtime | Somente `next`, `react`, `react-dom` |
| Banco de dados | Nenhum |
| Autenticação | Nenhuma |
| Analytics | Nenhum |
| Testes / ESLint | Nenhum |
| Deploy | Vercel (sem `vercel.json`, sem cron) |
| Remoto | `github.com/GustavoBjonk/data_construction` |

`npm run typecheck` e `next build` passam: 118 páginas estáticas geradas.

### Rotas existentes (todas estáticas)
`/`, `/noticias`, `/noticias/[slug]` (97), `/artigos`, `/artigos/[slug]` (4), `/datasets`, `/trilhas`, `/trilhas/[slug]` (7), `/projetos`, `/doacoes`, `/sobre`. Redirect permanente `/projetos-sobre → /projetos`.

### Conteúdo (arquivos TypeScript em `data/`)
| Coleção | Itens | Observação |
|---|---|---|
| `news.ts` | 97 | 2022–2026; todas com `verifiedAt: 2026-09-18`; 6 em destaque; nenhuma imagem |
| `articles.ts` | 4 | Conteúdo em blocos de string (Markdown simplificado); referências ABNT; `id` é o slug |
| `datasets.ts` | 13 | Links externos (Kaggle, UCI, etc.) |
| `roadmaps.ts` | 7 | Trilhas com etapas e vínculos a cursos; `tracks.ts` é derivado |
| `courses.ts` | 19 | Preço e data de checagem de preço |
| `projects.ts` | 31 | Ideias de projeto (sem repositório/demo) |
| `donations.ts` | 5 | Organizações para doação |

### Código legado
`index.html`, `js/`, `css/` e `news_urls.txt` são o site estático anterior ("Radar de Dados"). Não são servidos pelo Next (não estão em `public/`). Candidatos à remoção, mediante confirmação.

## 2. Achados da auditoria

### Links (script `npm run audit:links`, 129 URLs)
- 111 OK, 7 redirecionados, 8 bloqueados para robôs (403/429 — precisam de checagem manual), 2 quebrados, 1 erro de rede.
- Quebrados: `power-bi-ignite-2022` e `gartner-mq-bi-2024` (blog antigo do Power BI agora retorna 400).
- Suspeito: `anpd-nota-tecnica-pl-ia-2023` redireciona para página de manutenção da FGV.
- Erro: dataset `imdb-reviews` (ai.stanford.edu falhou na conexão).

### Notícias
- Todas marcadas como verificadas na mesma data; não há histórico de revisão nem status editorial.
- As notícias de 2026 citam fontes secundárias (ex.: Axios) para anúncios de fabricantes; devem ser conferidas com a fonte primária.
- O modelo de dados não distingue data original × data de coleta × data de verificação por revisor.
- Recomendação: na migração para o banco, importar todas como `status = needs_review` (exceto as conferidas manualmente) e manter a página pública exibindo-as como "arquivo", não como "recentes".

### Técnicos
- Não há `sitemap.ts`, `robots.ts`, Open Graph nem URLs canônicas.
- JSON-LD em `app/noticias/[slug]/page.tsx` usa `JSON.stringify` sem escapar `<`; inofensivo com dados estáticos, mas precisa ser corrigido antes de o conteúdo vir do banco.
- `ArticleContent` renderiza Markdown próprio (apenas `##` e blocos de código). Um renderizador seguro (com sanitização) será necessário para o editor do admin.
- `.gitignore` não cobre `.env` (só `.env*.local`).
- O `CLAUDE.md` da pasta pai descreve outro produto (app de alarme). Regras gerais (acessibilidade, clareza, sem métricas inventadas) continuam valendo; `.claude/rules/*` citados não existem neste repositório.

## 3. Arquitetura proposta

Mantém Next.js + TypeScript + Tailwind. Acrescenta apenas o necessário:

| Necessidade | Escolha | Motivo |
|---|---|---|
| Banco + Auth + RLS | **Supabase** (Postgres) com `@supabase/ssr` | Auth com verificação de e-mail e recuperação nativas, RLS, plano gratuito compatível com Vercel Hobby |
| Validação | Zod | Validação no servidor (Server Actions / Route Handlers) |
| Markdown seguro | `react-markdown` + `rehype-sanitize` + realce de código no servidor | Sem HTML arbitrário vindo de usuários |
| Animações | CSS nativo + `motion` só onde houver ganho real; hero em Canvas 2D | Sem WebGL; fallback estático e `prefers-reduced-motion` |
| Rate limiting | Tabela no Postgres (janela deslizante) | Sem serviço pago adicional; trocar por Upstash se necessário |
| Notícias | RSS/Atom oficiais → fila de revisão | Cron diário (limite do Vercel Hobby) + botão manual no admin |
| Analytics | Vercel Analytics (tráfego) + tabela própria de eventos agregados | Painel lê agregados, não eventos brutos |
| Testes | Vitest (unidade/integração) + Playwright (fluxos e responsividade) | |
| Lint | ESLint flat config + `eslint-config-next` | |

### Estratégia de migração do conteúdo
1. Criar schema via migrações SQL versionadas em `supabase/migrations/` (incrementais, com rollback documentado).
2. Script de seed idempotente que importa `data/*.ts` preservando `id`/`slug` (URLs atuais continuam válidas).
3. Camada `lib/content/*` com a mesma interface para leitura; durante a transição ela lê do banco quando configurado e dos arquivos TS caso contrário. O site nunca fica fora do ar por falta de credenciais.
4. Só depois de validar a paridade os arquivos `data/*.ts` deixam de ser a fonte da verdade.

### Papéis
`superadmin > admin > editor | moderator > user`. Papel armazenado em tabela própria, alterável apenas por função SQL `security definer` checada no servidor; nunca pelo cliente.

## 4. Fases

| Fase | Entrega | Depende de |
|---|---|---|
| 1. Diagnóstico | Esta auditoria, script de links | — |
| 2. Design system | Tokens (paleta grafite/verde-água/cobre), tipografia, grid, componentes base | — |
| 3. Redesign público | Navbar, hero animado, home, páginas existentes no novo visual | Fase 2 |
| 4. Backend + auth | Schema, RLS, auth, perfis, papéis, seed | **Projeto Supabase** |
| 5. Comunidade | `/discussoes`, comentários, votos, recomendações de cursos/livros, denúncias | Fase 4 |
| 6. Notícias automáticas | Fontes RSS verificadas, coleta, deduplicação, revisão, cron | Fase 4 |
| 7. Admin | `/admin` com gestão editorial, moderação, usuários, sistema, auditoria | Fases 4–6 |
| 8. Monetização | `AdSlot`, consentimento (LGPD), configurações de anúncios, páginas legais | Fase 7 + **conta AdSense** |
| 9. Qualidade | SEO, acessibilidade, performance medida, testes E2E | Todas |

As fases 2 e 3 não dependem de credenciais e podem começar imediatamente.

## 5. Dependências externas (o que precisa do responsável pelo projeto)
- Projeto Supabase (URL, anon key, service role key) — necessário a partir da Fase 4.
- Plano da Vercel (Hobby limita cron a 1 execução diária).
- Publisher ID e ad units do AdSense; aprovação da conta é feita pelo Google.
- GA4 / Search Console / AdSense Management API: opcionais; o painel mostrará "Não configurado" enquanto não houver credenciais.
- Provedor de e-mail para autenticação em produção (o SMTP padrão do Supabase tem limite baixo).
- Revisão jurídica das páginas de Privacidade, Termos e Cookies.

## 6. Riscos
- Escopo muito grande: entregas por fase, cada uma com build e testes verdes.
- Notícias históricas com fontes secundárias ou quebradas: exigem revisão humana; não é possível verificar fatos automaticamente.
- Anúncios + comunidade: páginas sem moderação ficam sem anúncios por padrão.
- Animações do hero em aparelhos modestos: orçamento de frame, pausa fora da viewport, fallback estático.
