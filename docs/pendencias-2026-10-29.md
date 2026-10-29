# Pendências e conferências — 2026-10-29

Registro da rodada de finalização. Nada foi publicado, commitado ou enviado à Vercel.

## Backup

Cópia completa (código, conteúdo, `.git`, imagens originais `13.png`/`14.png` e
os JSON removidos da raiz) em
`C:\Users\Gustavo\Downloads\dataconstruction-backups\20261029-182454\`:

- `projeto/` — tudo, exceto `node_modules`, `.next` e `.env.local`;
- `segredos/.env.local` — separado; não compartilhe esta pasta;
- `git-diff-rastreados.patch`, `git-status.txt`, `nao-rastreados.txt`.

## Notícias em revisão (30): conferência técnica nas fontes

Cada resumo foi comparado com a página oficial citada em `sourceUrl`. Isto é
conferência técnica (`lastCheckedAt`), **não aprovação**: as 30 continuam em
`review`, fora do site, até `npm run news:review -- approve <id>`.

Sem divergências: anpd-sandbox-ia-3-relatorio, anthropic-agent-skills-aaif,
anthropic-claude-frontier-academy, anthropic-claude-opus-5-5,
anthropic-defesas-destilacao, anthropic-s1-ipo, aws-redshift-chatgpt-work,
databricks-ai-runtime-ga, databricks-unity-catalog-engines-externos,
gemini-api-armazenamento-padrao, google-gemini-4-carbon,
microsoft-fabcon-europe-2026, mongodb-9-0-atlas-infinite, pandas-3-1-lancado,
postgresql-19-rc1, python-3-15-lancado (o 3.15.2 de 25/10 foi confirmado na
página de release do python.org), snowflake-ai-data-cloud-oracle-oci.

Corrigidas (afirmação não encontrada na fonte foi removida ou reescrita):

| Notícia | Correção |
|---|---|
| apache-iceberg-1-12 | removida a retirada do Flink 2.0 (as notas citam Flink 2.2/2.3 "sem retirar o 2.1") |
| bigquery-timesfm-3 | removidos "apresentado em 31 de agosto" e "pesos no GitHub e Hugging Face" |
| dbt-v2-duckdb-integrado | título e resumo: a fonte confirma o lançamento do dbt 2.0.0 em 14/9, não que `pip install dbt` passou a instalar o v2 |
| duckdb-2-0-lts-lancado | modo para agentes: saída compacta e erros em JSON (não "Markdown") |
| ducklabs-junta-se-a-aws | removido "ritmo acelerado", que não está no anúncio |
| google-gemini-4-argon | migrações para Rust ainda em auditoria; os 300 TiB são economia prevista após a implantação |
| meta-muse-spark-open | 1 TB é a memória somada dos dois Mac Studio, não um requisito declarado |
| nvidia-adquire-hugging-face | removidos prazo de conclusão e aprovações regulatórias atribuídos "à imprensa" sem fonte |
| reflection-beam-pesos-abertos | removidos fundação/ex-DeepMind, data 16/10 e formatos dos pesos; contexto descrito como efetivo; comparação nomeada (GLM-5.2, Kimi K3) |
| snowflake-postgres-data-mirroring-ga | removida a frase sobre novos indicadores de monitoramento |
| stack-overflow-survey-2026 | removida a caracterização da amostra, ausente do post |

Conferência manual necessária:

- **openai-gpt-6-1-terra**: openai.com bloqueia robôs (HTTP 403). Preço US$ 1/US$ 5 e "metade do Sol" batem com várias fontes secundárias, mas confira na página oficial.
- **anthropic-claude-haiku-5-5**: a página oficial não traz as datas do Opus 5.5 (22/9, confirmada na página do Opus) e do Sonnet 5.5 (28/9, só em fontes secundárias).

## Acervo legado (97 publicadas)

Continuam com "Revisão editorial: Pendente". Nenhuma foi marcada como
verificada. Para revisar: `npm run news:review -- legacy` lista as pendentes;
depois de conferir a fonte, `npm run news:review -- verify <id>`. A auditoria
de links (`npm run audit:links`) aponta 2 links quebrados
(power-bi-ignite-2022, gartner-mq-bi-2024), 8 bloqueados para robôs e 7
redirecionamentos — URLs mantidas para não alterar conteúdo sem revisão.

## Configurações externas pendentes

1. `NEXT_PUBLIC_CONTACT_EMAIL`: vazio. Defina o e-mail real (local e na Vercel) antes de anúncios ou contas.
2. Variáveis na Vercel: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`, `NEXT_PUBLIC_AUTH_ENABLED=false`, `CONTENT_SOURCE=static`. Não foi possível ler o projeto pela conta Vercel conectada ao assistente.
3. Plano Vercel: Hobby não permite uso comercial. Os links de afiliado já estão ativos no código.
4. Amazon Associates: confirmar o domínio cadastrado para a tag `pautaliberdade-20`.
5. AdSense: Publisher ID, aprovação da conta e IDs de bloco em `content/settings/ads.json`. Nada ativado.
6. Capas: confirmar autorização de uso das 14 capas em `public/images/books/` (12 publicadas e 2 dos livros arquivados).

## Revisão jurídica

Os textos de `/privacidade`, `/termos` e `/cookies` descrevem só os serviços em
uso (hospedagem Vercel; Amazon Associates; AdSense e contas apenas quando
ligados). Não declaram conformidade legal. Dependem de revisão profissional:
bases legais da LGPD, identificação do controlador (nome/CNPJ ou pessoa física),
canal do encarregado, prazo de resposta a titulares e adequação do aviso de
afiliados às regras do CONAR e do Programa de Associados.

## Git: o que versionar

Versionar: `app/`, `components/`, `lib/`, `data/`, `content/`, `public/`,
`scripts/`, `tests/`, `supabase/migrations`, `supabase/seed.sql`, `docs/`,
`package.json`, `package-lock.json`, configs (`next.config.mjs`, `tsconfig.json`,
`tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.mts`, `proxy.ts`),
`.env.example`, `.gitignore`.

Fora do Git (já ignorados): `.env.local` e qualquer `.env.*` exceto o exemplo,
`node_modules/`, `.next/`, `*.tsbuildinfo`, `next-env.d.ts`, `.vercel/`, chaves
(`*.pem`, `*.key`, `*.p12`), `supabase/.temp`.

Decidir: `REFERENCIA.png` (912 KB, referência visual de design, não usada pelo
site) — mover para fora do repositório ou para `docs/`.

Branch de segurança sugerida, **a executar só com sua autorização**:

```bash
git switch -c backup/finalizacao-2026-10-29
git add -A
git status            # conferir que .env.local não aparece
git commit -m "chore: snapshot da reestruturação local"
```

## Preparação para publicação (2026-10-29, segunda rodada)

Nada foi commitado, enviado ou publicado.

- **Backup 2**: `C:\Users\Gustavo\Downloads\dataconstruction-backups\20261029-190315\`
  (projeto completo, `segredos/.env.local` separado e `repo.bundle`, um
  backup do histórico Git verificado com `git bundle verify`). Todos os
  arquivos modificados e não rastreados foram conferidos na cópia.
- **Branch de segurança**: `backup/preparacao-publicacao-2026-10-29`, criada a
  partir do último commit, sem trocar de branch (você continua em `main`). Ela
  só guarda as alterações locais depois de um commit, que depende da sua
  autorização (comandos na seção "Git" acima, trocando o nome da branch).
- **Livros**: cada card com link da Amazon mostra o selo discreto
  "Publicidade" ao lado do botão, e `/livros` exibe a declaração do Programa de
  Associados antes da lista. 12 publicados, 3 arquivados, nenhum arquivado
  visível.
- **Revisão editorial**: `npm run review:report` gera `revisao/relatorio.html`
  (fora do Git) com as 30 notícias e os 8 artigos, a nota da conferência nas
  fontes, o link original e os comandos. Artigos ganharam
  `npm run articles:review`. Nada foi aprovado.
- **Links quebrados corrigidos** (status e revisão editorial inalterados):
  - `power-bi-ignite-2022`: o post do blog do Power BI saiu do ar na migração
    para o fórum do Fabric. Fonte trocada pelo *Microsoft Ignite 2022 Book of
    News* (seção 7.1.6), oficial. O resumo passou a citar só o que essa fonte
    confirma (relatórios no OneDrive/SharePoint, em prévia; instalação
    automática para usuários do Office). "Edição de modelos no serviço" e
    "acessibilidade" saíram por não constarem na fonte.
  - `gartner-mq-bi-2024`: o endereço novo no fórum do Fabric também responde
    com erro. Fonte trocada pela cópia arquivada (Wayback Machine) do post
    oficial da Microsoft, que confirma o 17º ano consecutivo; o 12º ano do
    Tableau está no comunicado da Salesforce. A lista dos outros líderes saiu
    do resumo por não estar nessas fontes.
  - `supabase/seed.sql` foi regenerado a partir do conteúdo (arquivo local; o
    Supabase não foi acessado).
- **Auditoria de links**: 129 links, 0 quebrados. Restam 8 bloqueados para
  robôs (conferência manual), 7 redirecionamentos e 1 erro de conexão no
  dataset IMDB (`ai.stanford.edu` não respondeu em 30 s; é o endereço oficial
  do dataset, então foi mantido).
- **AdSense e comercial**: desligado. `NEXT_PUBLIC_ADSENSE_ENABLED=false`,
  Publisher ID vazio, os 6 blocos de `content/settings/ads.json` sem ID, e o
  código só liga anúncios com Publisher ID + `ENABLED=true` + deploy de
  Production. O build não contém o script do Google nem a metatag, e `/ads.txt`
  responde 404. **Os links de afiliado da Amazon estão ativos**, pois você
  pediu para manter os 12 livros com link e selo.

### Páginas legais — o que você precisa fornecer

1. **E-mail de contato** (obrigatório antes de anúncios ou contas):
   `NEXT_PUBLIC_CONTACT_EMAIL=seu-email@dominio` no `.env.local` e nas
   variáveis da Vercel (Production). Sem ele, Termos e Privacidade mostram
   "o canal de contato será publicado nesta página…".
2. Identificação do controlador dos dados (nome ou razão social; CNPJ se houver).
3. Encarregado (DPO) ou indicação de quem atende os titulares, e prazo de resposta.
4. Revisão jurídica dos três textos, incluindo o aviso de afiliados (Amazon, CONAR/CDC).

## Aprovação das notícias (2026-10-29)

Por decisão editorial do responsável pelo site, as 30 notícias coletadas em
2026-10-29 foram aprovadas com `npm run news:review -- approve <id> 2026-10-29`
(uma a uma, pelo fluxo oficial): `status: "published"`, `verification:
"verified"`, `verifiedAt: 2026-10-29`. O acervo tem 127 notícias publicadas:
30 com revisão editorial registrada e 97 legadas ainda pendentes
(`npm run news:review -- legacy`). `supabase/seed.sql` foi regenerado
(arquivo local). Entram no site no próximo deploy.
