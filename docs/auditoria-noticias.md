# Auditoria editorial das notícias

Gerado por `npm run audit:news` em 2026-10-28. Não edite à mão.

## Resumo

- Notícias no acervo: 97
- Erros de integridade (bloqueiam publicação): 0
- Links: blocked 8, ok 81, broken 2, redirect 6
- Fontes secundárias (confirmar na fonte primária): 23
- Com valores/percentuais a conferir: 36

Todas as notícias entram no banco como `unverified` e aparecem no site como **revisão editorial pendente**.
Nenhuma é removida ou despublicada automaticamente: URLs e conteúdo são preservados.

## Como revisar cada notícia

1. Abrir a fonte. Se o link estiver quebrado, procurar a publicação original (arquivo do site, Wayback Machine) e corrigir a URL.
2. Conferir título, data e cada número citado no resumo contra a fonte.
3. Fonte secundária: localizar o anúncio oficial (blog/press release da empresa ou órgão) e preferi-lo como fonte.
4. Resultado: `verified` (conferida), ou `flagged` com nota explicando o problema — notícias `flagged` saem do ar automaticamente.

## Fila de revisão (maior prioridade primeiro)

| # | Notícia | Data | Fonte | Achados |
|---|---|---|---|---|
| 1 | [ANPD publica nota técnica sobre o projeto de lei que regula a IA no Brasil](/noticias/anpd-nota-tecnica-pl-ia-2023) | 2023-10-24 | regulacaoemnumeros-direitorio.fgv.br | fonte secundária (regulacaoemnumeros-direitorio.fgv.br); confirmar na fonte primária; redireciona para outro domínio: manut.fgv.br |
| 2 | [União Europeia começa a fiscalizar o AI Act e exige transparência sobre conteúdo gerado por IA](/noticias/eu-ai-act-fiscalizacao-2026) | 2026-08-04 | helpnetsecurity.com | fonte secundária (helpnetsecurity.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 3 | [Databricks capta US$ 5 bilhões e atinge valuation de US$ 190 bilhões](/noticias/databricks-190bi-valuation) | 2026-07-17 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 4 | [Anthropic lança o Claude Opus 5, com desempenho próximo do topo por metade do preço](/noticias/anthropic-claude-opus-5) | 2026-07-24 | axios.com | fonte secundária (axios.com); confirmar na fonte primária; fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 5 | [OpenAI lança o GPT-5, unificando raciocínio e respostas rápidas em um único modelo](/noticias/openai-lanca-gpt-5) | 2025-08-07 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 6 | [Qantas confirma vazamento de dados de 5,7 milhões de clientes após ataque via plataforma Salesforce](/noticias/qantas-vazamento-salesforce-2025) | 2025-07-09 | cybersecuritydive.com | fonte secundária (cybersecuritydive.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 7 | [dbt Labs lança o motor Fusion, reescrito em Rust, para acelerar o desenvolvimento analítico](/noticias/dbt-labs-fusion-engine) | 2025-05-28 | prnewswire.com | fonte secundária (prnewswire.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 8 | [Ações da Nvidia caem 17% e perdem US$ 600 bilhões em valor de mercado após surpresa da DeepSeek](/noticias/deepseek-impacto-nvidia-2025) | 2025-01-27 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 9 | [Microsoft e Tableau são nomeados líderes no Gartner Magic Quadrant de BI 2024](/noticias/gartner-mq-bi-2024) | 2024-06-20 | powerbi.microsoft.com | link da fonte quebrado (HTTP 400) |
| 10 | [Databricks lança o DBRX, modelo de linguagem aberto de mistura de especialistas](/noticias/databricks-lanca-dbrx) | 2024-03-27 | prnewswire.com | fonte secundária (prnewswire.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 11 | [23andMe confirma que hackers acessaram dados de 6,9 milhões de usuários](/noticias/23andme-vazamento-2023) | 2023-12-04 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 12 | [Ataque em massa explorando falha no MOVEit expõe dados de milhões de pessoas](/noticias/moveit-vazamento-massivo-2023) | 2023-06-29 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 13 | [Microsoft leva novidades de BI corporativo ao Power BI no Ignite 2022](/noticias/power-bi-ignite-2022) | 2022-10-12 | powerbi.microsoft.com | link da fonte quebrado (HTTP 400) |
| 14 | [Uber sofre invasão que compromete sistemas internos após ataque de engenharia social](/noticias/uber-invasao-lapsus-2022) | 2022-09-16 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 15 | [Irlanda multa o Instagram em € 405 milhões por exposição de dados de menores](/noticias/irlanda-multa-instagram-gdpr) | 2022-09-05 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 16 | [Banco Central comunica vazamento de dados de 160,1 mil chaves Pix](/noticias/bc-vazamento-chaves-pix-2022) | 2022-01-21 | agenciabrasil.ebc.com.br | fonte secundária (agenciabrasil.ebc.com.br); confirmar na fonte primária; contém valores ou percentuais; conferir números na fonte |
| 17 | [OpenAI lança o GPT-6 (codinome "Astra"), seu modelo mais avançado até agora](/noticias/openai-lanca-gpt-6-astra) | 2026-09-03 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária |
| 18 | [Nvidia detalha plataforma Vera Rubin e novo chip Groq 3 LPU no GTC 2026](/noticias/nvidia-vera-rubin-gtc-2026) | 2026-03-16 | cnbc.com | fonte secundária (cnbc.com); confirmar na fonte primária |
| 19 | [Últimas obrigações do EU AI Act sobre modelos de IA de uso geral entram em vigor](/noticias/eu-ai-act-obrigacoes-gpai-2025) | 2025-08-07 | dlapiper.com | fonte secundária (dlapiper.com); confirmar na fonte primária; fonte bloqueia robôs (conferir manualmente) (HTTP 429) |
| 20 | [ANPD multa TikTok em R$ 153,7 milhões por uso indevido de dados de crianças e adolescentes](/noticias/anpd-multa-tiktok-2026) | 2026-08-25 | gov.br | contém valores ou percentuais; conferir números na fonte |
| 21 | [Fivetran e dbt Labs concluem fusão para criar infraestrutura de dados para agentes de IA](/noticias/fivetran-dbt-labs-fusao) | 2026-06-01 | fivetran.com | contém valores ou percentuais; conferir números na fonte |
| 22 | [Snowflake anuncia aquisição da Observe para observabilidade com IA](/noticias/snowflake-adquire-observe) | 2026-01-08 | snowflake.com | contém valores ou percentuais; conferir números na fonte |
| 23 | [Gartner prevê que 40% dos aplicativos corporativos terão agentes de IA específicos até 2026](/noticias/gartner-previsao-agentes-ia-2026) | 2025-08-26 | gartner.com | contém valores ou percentuais; conferir números na fonte; fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 24 | [MongoDB adquire a Voyage AI para reforçar busca vetorial e reduzir alucinações de IA](/noticias/mongodb-adquire-voyage-ai) | 2025-02-24 | prnewswire.com | fonte secundária (prnewswire.com); confirmar na fonte primária |
| 25 | [National Public Data confirma vazamento com bilhões de registros pessoais](/noticias/national-public-data-vazamento) | 2024-08-16 | bleepingcomputer.com | fonte secundária (bleepingcomputer.com); confirmar na fonte primária |
| 26 | [Vazamento via credenciais roubadas em contas Snowflake atinge AT&T, Ticketmaster e outras empresas](/noticias/snowflake-vazamento-credenciais-2024) | 2024-07-12 | cnbc.com | fonte secundária (cnbc.com); confirmar na fonte primária |
| 27 | [União Europeia fecha acordo político sobre o AI Act](/noticias/eu-ai-act-acordo-politico-2023) | 2023-12-09 | consilium.europa.eu | contém valores ou percentuais; conferir números na fonte; fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 28 | [Amazon Bedrock chega à disponibilidade geral na AWS](/noticias/amazon-bedrock-ga) | 2023-09-28 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária |
| 29 | [OpenAI lança o GPT-4, elevando o patamar dos modelos de linguagem multimodais](/noticias/openai-lanca-gpt-4) | 2023-03-14 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária |
| 30 | [OpenAI lança o ChatGPT ao público](/noticias/openai-lanca-chatgpt) | 2022-11-30 | openai.com | contém valores ou percentuais; conferir números na fonte; fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 31 | [Google Cloud lança o BigLake para unificar data warehouse e data lake](/noticias/google-cloud-lanca-biglake) | 2022-04-05 | techcrunch.com | fonte secundária (techcrunch.com); confirmar na fonte primária |
| 32 | [Microsoft apresenta o Fabric IQ, camada semântica para IA empresarial no Fabric](/noticias/microsoft-fabric-iq) | 2026-05-06 | community.fabric.microsoft.com | fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 33 | [Databricks levanta mais de US$ 4 bilhões em rodada Série L e atinge valuation de US$ 134 bilhões](/noticias/databricks-serie-l-2025) | 2025-12-16 | databricks.com | contém valores ou percentuais; conferir números na fonte |
| 34 | [Anthropic lança Claude Opus 4.5, seu modelo mais forte em codificação e uso de agentes](/noticias/anthropic-claude-opus-4-5) | 2025-11-24 | anthropic.com | contém valores ou percentuais; conferir números na fonte |
| 35 | [Meta lança a família Llama 4 com arquitetura mixture-of-experts e contexto de até 10 milhões de tokens](/noticias/meta-lanca-llama-4) | 2025-04-05 | ai.meta.com | contém valores ou percentuais; conferir números na fonte |
| 36 | [Google lança Gemini 2.5 Pro, seu modelo de "raciocínio" com janela de contexto de 1 milhão de tokens](/noticias/google-gemini-2-5-pro) | 2025-03-25 | blog.google | contém valores ou percentuais; conferir números na fonte |
| 37 | [Databricks capta US$ 10 bilhões em rodada Série J, atingindo valuation de US$ 62 bilhões](/noticias/databricks-serie-j-2024) | 2024-12-17 | databricks.com | contém valores ou percentuais; conferir números na fonte |
| 38 | [Databricks anuncia aquisição da Tabular, empresa dos criadores do Apache Iceberg](/noticias/databricks-adquire-tabular) | 2024-06-04 | databricks.com | contém valores ou percentuais; conferir números na fonte |
| 39 | [Meta lança o Llama 3, seu modelo de linguagem aberto mais capaz até então](/noticias/meta-lanca-llama-3) | 2024-04-18 | ai.meta.com | contém valores ou percentuais; conferir números na fonte |
| 40 | [MongoDB Atlas Vector Search chega à disponibilidade geral](/noticias/mongodb-atlas-vector-search-ga) | 2023-12-04 | mongodb.com | contém valores ou percentuais; conferir números na fonte |
| 41 | [Receita de data center da Nvidia salta 279% impulsionada pela demanda por GPUs de IA](/noticias/nvidia-receita-data-center-2023) | 2023-11-21 | nvidianews.nvidia.com | contém valores ou percentuais; conferir números na fonte |
| 42 | [PostgreSQL 16 é lançado com ganhos de performance em paralelismo e replicação](/noticias/postgresql-16-lancado) | 2023-09-14 | postgresql.org | contém valores ou percentuais; conferir números na fonte |
| 43 | [Anthropic lança o Claude 2, com janela de contexto de 100 mil tokens](/noticias/anthropic-lanca-claude-2) | 2023-07-11 | anthropic.com | contém valores ou percentuais; conferir números na fonte |
| 44 | [Databricks compra a MosaicML por US$ 1,3 bilhão para acelerar IA generativa própria](/noticias/databricks-compra-mosaicml) | 2023-06-26 | databricks.com | contém valores ou percentuais; conferir números na fonte |
| 45 | [Snowflake adquire a startup de busca Neeva por cerca de US$ 185 milhões](/noticias/snowflake-adquire-neeva) | 2023-05-24 | snowflake.com | contém valores ou percentuais; conferir números na fonte |
| 46 | [Pinecone capta US$ 100 milhões em rodada Série B para seu banco de dados vetorial](/noticias/pinecone-serie-b) | 2023-04-26 | pinecone.io | contém valores ou percentuais; conferir números na fonte |
| 47 | [Salesforce lança Einstein GPT, IA generativa integrada ao CRM](/noticias/salesforce-einstein-gpt) | 2023-03-07 | salesforce.com | contém valores ou percentuais; conferir números na fonte |
| 48 | [PostgreSQL 15 é lançado com o comando MERGE e melhorias de replicação lógica](/noticias/postgresql-15-lancado) | 2022-10-13 | postgresql.org | contém valores ou percentuais; conferir números na fonte |
| 49 | [Databricks abre o código completo do Delta Lake 2.0](/noticias/databricks-open-source-delta-lake-2) | 2022-06-30 | databricks.com | contém valores ou percentuais; conferir números na fonte |
| 50 | [dbt Labs capta US$ 222 milhões em rodada Série D](/noticias/dbt-labs-serie-d) | 2022-02-24 | getdbt.com | contém valores ou percentuais; conferir números na fonte |
| 51 | [DuckDB revela prévia da versão 2.0, com arquitetura cliente-servidor e novo parser SQL](/noticias/duckdb-2-0-preview) | 2026-08-17 | duckdb.org | — |
| 52 | [MongoDB libera Search e Vector Search para implantações auto-gerenciadas](/noticias/mongodb-search-self-managed) | 2026-07-01 | mongodb.com | — |
| 53 | [Databricks anuncia Governance Hub e novos recursos de segurança no Data + AI Summit 2026](/noticias/databricks-governance-hub-2026) | 2026-06-17 | databricks.com | — |
| 54 | [Snowflake anuncia intenção de adquirir a Natoma para gestão de acesso de agentes de IA](/noticias/snowflake-adquire-natoma) | 2026-05-27 | snowflake.com | — |
| 55 | [Apache Iceberg 1.11.0 é lançado com nova API de formato de arquivo e suporte geoespacial](/noticias/apache-iceberg-1-11) | 2026-05-19 | iceberg.apache.org | — |
| 56 | [Redis lança o Iris, motor de contexto e memória para agentes de IA](/noticias/redis-iris-agentes-ia) | 2026-05-18 | redis.io | — |
| 57 | [Apache Polaris se torna projeto de nível superior da Apache Software Foundation](/noticias/apache-polaris-top-level-project) | 2026-02-19 | polaris.apache.org | — |
| 58 | [pandas 3.0 é lançado com Copy-on-Write como padrão único e novo dtype de string](/noticias/pandas-3-0-lancado) | 2026-01-21 | pandas.pydata.org | — |
| 59 | [Google Cloud lança recurso que converte comentários em português/inglês em SQL no BigQuery](/noticias/bigquery-comments-to-sql) | 2026-01-14 | cloud.google.com | — |
| 60 | [Conselho da União Europeia dá aprovação final ao AI Act](/noticias/eu-ai-act-aprovacao-final-2024) | 2024-05-21 | consilium.europa.eu | fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 61 | [OpenAI apresenta o GPT-4o, modelo multimodal em tempo real](/noticias/openai-gpt-4o) | 2024-05-13 | openai.com | fonte bloqueia robôs (conferir manualmente) (HTTP 403) |
| 62 | [ANPD publica mapa de temas prioritários 2026-2027 e atualiza agenda regulatória da LGPD](/noticias/anpd-mapa-temas-prioritarios-2026-2027) | 2025-12-24 | gov.br | — |
| 63 | [DuckDB lança 1.4.2, segunda atualização da sua primeira versão LTS, com correções de segurança](/noticias/duckdb-142-lts) | 2025-11-12 | duckdb.org | — |
| 64 | [PostgreSQL 18 é lançado com novo subsistema de I/O assíncrono e ganhos de até 3x em leitura](/noticias/postgresql-18-lancado) | 2025-09-25 | postgresql.org | — |
| 65 | [Apache Iceberg 1.10 amadurece a especificação V3 e o REST Catalog para produção](/noticias/apache-iceberg-1-10) | 2025-09-24 | opensource.googleblog.com | — |
| 66 | [Microsoft Fabric anuncia recursos de Graph e Maps para dar contexto a agentes de IA na FabCon Vienna](/noticias/microsoft-fabric-fabcon-vienna-2025) | 2025-09-16 | microsoft.com | — |
| 67 | [Nvidia leva GPUs Blackwell para servidores empresariais mainstream com o RTX PRO 6000 Server Edition](/noticias/nvidia-rtx-pro-blackwell-servidores) | 2025-08-11 | nvidianews.nvidia.com | — |
| 68 | [Snowflake anuncia aquisição da Crunchy Data para levar PostgreSQL enterprise à nuvem de IA](/noticias/snowflake-adquire-crunchy-data) | 2025-06-02 | snowflake.com | — |
| 69 | [Apache Spark 4.0 é lançado com modo ANSI por padrão e novo tipo de dado VARIANT](/noticias/apache-spark-4-0-lancado) | 2025-05-28 | databricks.com | — |
| 70 | [Google amplia Conversational Analytics no Looker, permitindo consultas em linguagem natural com Gemini](/noticias/looker-conversational-analytics-2025) | 2025-04-29 | cloud.google.com | — |
| 71 | [AWS lança o Amazon S3 Tables, com suporte nativo a Apache Iceberg](/noticias/aws-s3-tables-iceberg) | 2024-12-03 | aws.amazon.com | — |
| 72 | [dbt Labs lança dbt Copilot e suporte a Iceberg na conferência Coalesce 2024](/noticias/dbt-labs-coalesce-2024) | 2024-10-08 | getdbt.com | — |
| 73 | [PostgreSQL 17 é lançado com melhorias de performance e memória](/noticias/postgresql-17-lancado) | 2024-09-26 | postgresql.org | — |
| 74 | [Confluent adquire a WarpStream para expandir streaming de dados "traga sua própria nuvem"](/noticias/confluent-adquire-warpstream) | 2024-09-09 | confluent.io | — |
| 75 | [Snowflake torna o Polaris Catalog open source sob licença Apache 2.0](/noticias/snowflake-polaris-catalog-open-source) | 2024-07-30 | snowflake.com | — |
| 76 | [ANPD determina suspensão cautelar do uso de dados pessoais pela Meta para treinar IA](/noticias/anpd-suspende-meta-ia-2024) | 2024-07-02 | gov.br | — |
| 77 | [Anthropic lança o Claude 3.5 Sonnet](/noticias/anthropic-claude-3-5-sonnet) | 2024-06-21 | anthropic.com | — |
| 78 | [DuckDB atinge a versão estável 1.0](/noticias/duckdb-1-0-estavel) | 2024-06-03 | duckdb.org | — |
| 79 | [pgvector 0.7 traz novos tipos de vetor e mais desempenho para busca vetorial no Postgres](/noticias/pgvector-07-lancado) | 2024-04-30 | postgresql.org | — |
| 80 | [Redis abandona a licença open source BSD e adota licenciamento "source-available"](/noticias/redis-licenciamento-source-available) | 2024-03-20 | redis.io | — |
| 81 | [Nvidia apresenta a arquitetura de GPUs Blackwell](/noticias/nvidia-blackwell-2024) | 2024-03-18 | nvidianews.nvidia.com | — |
| 82 | [Google apresenta o Gemini, seu modelo de IA multimodal mais avançado](/noticias/google-apresenta-gemini) | 2023-12-06 | blog.google | — |
| 83 | [Snowflake unifica suporte a tabelas Apache Iceberg em sua Data Cloud](/noticias/snowflake-unifica-iceberg-2023) | 2023-08-31 | snowflake.com | — |
| 84 | [Meta lança o Llama 2 em parceria com a Microsoft, liberando uso comercial](/noticias/meta-lanca-llama-2) | 2023-07-18 | ai.meta.com | — |
| 85 | [Microsoft anuncia o Microsoft Fabric, plataforma unificada de dados e analytics](/noticias/microsoft-anuncia-fabric) | 2023-05-23 | azure.microsoft.com | — |
| 86 | [Tableau anuncia recursos de IA generativa com Einstein GPT](/noticias/tableau-einstein-gpt) | 2023-03-15 | salesforce.com | — |
| 87 | [AWS anuncia integração Zero-ETL entre Aurora e Redshift no re:Invent 2022](/noticias/aws-reinvent-2022-zero-etl) | 2022-12-19 | aws.amazon.com | — |
| 88 | [Databricks é nomeada líder no Magic Quadrant de Bancos de Dados em Nuvem do Gartner](/noticias/databricks-lider-gartner-2022) | 2022-12-16 | databricks.com | — |
| 89 | [DuckDB 0.6.0 traz leitor CSV paralelo e melhorias de armazenamento](/noticias/duckdb-060-lancado) | 2022-11-14 | duckdb.org | — |
| 90 | [Google renomeia o Data Studio para Looker Studio](/noticias/google-data-studio-vira-looker-studio) | 2022-10-11 | cloud.google.com | — |
| 91 | [Apache Kafka 3.3 marca o modo KRaft como pronto para produção](/noticias/apache-kafka-33-kraft-producao) | 2022-10-03 | blogsarchive.apache.org | — |
| 92 | [Snowflake revela suporte nativo a tabelas Apache Iceberg](/noticias/snowflake-suporte-apache-iceberg) | 2022-06-22 | snowflake.com | — |
| 93 | [Snowflake anuncia o Unistore para unir dados transacionais e analíticos](/noticias/snowflake-anuncia-unistore) | 2022-06-14 | snowflake.com | — |
| 94 | [MongoDB lança a prévia da Queryable Encryption](/noticias/mongodb-queryable-encryption-preview) | 2022-06-07 | mongodb.com | — |
| 95 | [Redis 7.0 chega com Redis Functions e Sharded Pub/Sub](/noticias/redis-7-lancado) | 2022-04-27 | redis.io | — |
| 96 | [Nvidia anuncia a arquitetura Hopper e a GPU H100](/noticias/nvidia-anuncia-hopper-h100) | 2022-03-22 | nvidianews.nvidia.com | — |
| 97 | [ANPD aprova regras simplificadas de LGPD para agentes de pequeno porte](/noticias/anpd-regras-simplificadas-2022) | 2022-01-27 | gov.br | — |
