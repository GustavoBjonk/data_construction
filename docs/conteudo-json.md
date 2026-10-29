# Conteúdo em JSON

O conteúdo editorial do site fica em arquivos JSON versionados em `content/`,
validados por Zod na leitura. Migrado de `data/*.ts` em 2026-10-28 sem perda
de dados. (O painel administrativo planejado sobre esse formato foi removido
em 2026-10-29.)

## Estrutura

```
content/
  articles/       12 arquivos (4 publicados, 8 em revisão)
  books/         13
  courses/       19
  datasets/      13
  news/         127   (97 publicadas + 30 em revisão)
  organizations/  5
  projects/      31
  roadmaps/       7
```

Um arquivo por item: `content/<coleção>/<id>.json`. O nome do arquivo é o `id`
(para notícias e trilhas, `id` e `slug` são iguais no acervo atual). Um arquivo
por item permite histórico e reversão por item (`git log -- <arquivo>`),
detecção de conflito por arquivo e diffs pequenos.

Cada arquivo é um envelope:

```json
{
  "schemaVersion": 1,
  "status": "published",
  "sortOrder": 10,
  "data": { "id": "titanic", "name": "Titanic", "...": "..." }
}
```

| Campo           | Uso                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `schemaVersion` | Versão do formato. Mudança incompatível = nova versão + script de migração. Campo opcional novo não muda a versão. |
| `status`        | `draft` (rascunho), `review` (aguardando aprovação), `published` (no site) ou `archived` (fora do site, mantido no repositório). Só `published` aparece em páginas, busca, sitemap e feed. |
| `sortOrder`     | Ordem original das listas (múltiplos de 10, para inserir itens no meio sem renumerar tudo).           |
| `data`          | O item, exatamente no formato dos tipos de `data/*.ts`.                                               |

A trilha guarda também `projectArea` dentro de `data` (antes era o mapa
`ROADMAP_PROJECT_AREAS`); o loader separa os dois.

Formato canônico: chaves na ordem do schema, indentação de 2 espaços e quebra de
linha no fim. Um teste garante isso em todos os arquivos, para que cada edição
gere diffs mínimos e revisáveis.

## Fluxo editorial das notícias

```
draft ──► review ──► published ──► archived
  ▲         │                          │
  └─────────┴──────────────────────────┘ (volta ao rascunho)
```

- Notícia nova entra em `review`. Só a aprovação (`approveNews`) leva de
  `review` para `published`; não há outro caminho para publicar.
- Aprovar grava `verification: "verified"` e `verifiedAt` (data da aprovação).
- Voltar ao rascunho apaga a aprovação anterior: o texto pode mudar e precisará
  de nova revisão.
- Notícia com `collectedAt` (coletada pelo fluxo atual) não pode estar
  `published` sem aprovação. O acervo legado (97 notícias, sem `collectedAt`)
  segue publicado com "Revisão editorial: Pendente" até ser aprovado.

Datas de uma notícia:

| Campo           | Significado                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `publishedAt`   | Data do acontecimento na fonte original.                                                     |
| `collectedAt`   | Quando entrou no acervo. Ausente no legado (a data de coleta não foi registrada).            |
| `lastCheckedAt` | Última conferência técnica da fonte (link e dados). Não é aprovação.                         |
| `verifiedAt`    | Data da aprovação editorial. Existe se, e somente se, `verification` é `"verified"`.        |

Em 2026-10-29 o antigo `verifiedAt` das 97 notícias legadas, que registrava a
checagem do acervo (nenhuma tinha revisão editorial), passou para
`lastCheckedAt`, com o mesmo valor.

Enquanto não há painel, a fila é operada por linha de comando:

```
npm run news:review                           # fila: título, fonte, data, resumo, situação e link
npm run news:review -- show <id>              # notícia completa
npm run news:review -- approve <id> [data]    # aprova e publica
npm run news:review -- return <id>            # devolve para correção (rascunho)
npm run news:review -- reject <id>            # rejeita (arquiva)
npm run news:review -- legacy                 # publicadas sem revisão registrada (acervo legado)
npm run news:review -- verify <id> [data]     # registra a revisão de uma legada já publicada
```

`draft` e `archive` seguem aceitos como sinônimos de `return` e `reject`.

Artigos têm comandos equivalentes (`lib/content/article-workflow.ts`):
`npm run articles:review` (fila), `-- approve <id> [data]`, `-- return <id>` e
`-- reject <id>`. Para ler tudo antes de decidir, `npm run review:report` gera
`revisao/relatorio.html` (fora do Git) com notícias e artigos pendentes, a nota
da conferência nas fontes (`docs/revisao/conferencia-2026-10-29.json`), o link
original e os comandos de cada ação. O relatório não aprova nada.
Não há aprovação em lote: cada `approve`/`verify` é uma decisão humana.

Depois de aprovar, rode `npm run db:seed:generate` e os testes. Um painel
futuro deve usar as mesmas funções: `lib/content/news-workflow.ts` (regras e
transições, sem disco) e `writeContentItem` em `lib/content/store.ts`
(gravação validada no formato canônico).

## Código

| Arquivo                      | Papel                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `lib/content/schemas.ts`     | Schemas Zod estritos de cada coleção, envelope, registro de coleções e asserções de tipo (schema ⇄ `data/*.ts`). |
| `lib/content/paths.ts`       | Única fonte dos caminhos permitidos (`contentFilePath`, `parseContentFilePath`).                               |
| `lib/content/store.ts`       | Lê e valida as coleções; `loadPublishedContent()`; regras entre arquivos (`findContentIntegrityIssues`); gravação validada (`writeContentItem`). |
| `lib/content/news-workflow.ts` | Fluxo editorial das notícias: transições, aprovação, fila de revisão e regras entre status.                   |
| `lib/content/index.ts`       | Camada usada pelas páginas (inalterada para elas); agora lê `content/` em vez dos arrays de `data/*.ts`.       |
| `data/*.ts`                  | Somente tipos e constantes (categorias, níveis). Os arrays de conteúdo foram removidos.                         |

Regras de validação relevantes para segurança:

- objetos estritos: campo desconhecido é erro;
- URLs só `http`/`https` com domínio válido (bloqueia `javascript:`, `data:`);
- texto puro sem tags HTML e sem caracteres de controle; o corpo dos artigos
  aceita `<` porque contém código, e é sempre renderizado como texto escapado;
- slugs `a-z0-9` com hífens, até 120 caracteres; datas `AAAA-MM-DD`;
- limites de tamanho em todos os textos e listas;
- o `id` dentro do arquivo precisa ser igual ao nome do arquivo;
- referências entre coleções (cursos das trilhas, itens relacionados das
  notícias) precisam existir.

Arquivo inválido interrompe a leitura com erro explícito: o build falha em vez
de publicar uma página quebrada.

## Migração e compatibilidade

A migração foi feita por um script único (não versionado) que gerou os JSON a
partir dos arrays de `data/*.ts` e comparou o resultado carregado com os arrays
originais. Resultado: as 8 coleções e o mapa de áreas das trilhas ficaram
**idênticos** (IDs, slugs, datas, textos, ordem), sem nenhum problema de
integridade. A única diferença de texto foi a ordem das chaves de `related` em 5
notícias (agora na ordem do schema), o que mudou uma linha de
`supabase/seed.sql` sem mudar dados.

No Next, a leitura via `fs` é marcada com `turbopackIgnore` e os JSON entram nas
funções do servidor por `outputFileTracingIncludes` (`next.config.mjs`). Em
produção o conteúdo é lido uma vez por processo; em desenvolvimento, a cada
requisição.

`CONTENT_SOURCE=static` continua sendo o padrão e agora significa "arquivos de
`content/`". O código do Supabase (`lib/supabase`, migrações, seed, testes com
PGlite) segue no repositório, desligado, e os testes dele passam a usar os JSON.
A remoção desse código é uma decisão pendente (ver [Decisões pendentes](#decisões-pendentes)).

## Artigos: rascunho e revisão

Artigos usam o mesmo envelope: só `published` aparece no site, no sitemap e na
busca. O campo opcional `data.tags` (até 12) vira `keywords` nos metadados e no
JSON-LD. Categorias: `ARTICLE_CATEGORIES` em `data/articles.ts`; a página
`/artigos` só mostra filtros de categorias com artigo publicado.

Os 8 artigos de 2026-10-29 (Python/pandas, SQL JOIN e janelas, introdução a ML,
classificação vs. regressão, engenharia de dados, Power BI, estatística, IA
generativa) estão em `review`, assinados como "Redação DataConstruction" e com
a indicação de apoio de IA na bio. Antes de publicar: revisar o texto, rodar os
exemplos de código, conferir as referências, ajustar `author`/`authorBio` e
`date` e mudar `status` para `published`.
