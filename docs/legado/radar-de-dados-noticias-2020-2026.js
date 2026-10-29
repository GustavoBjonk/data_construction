// Base de notícias do blog — Radar de Dados
// Cada item traz título, resumo (com recorte para analistas/cientistas de dados)
// e referência no padrão ABNT (NBR 6023) para a fonte original.

const NEWS = [
  // ===== 2020 =====
  {
    id: 1,
    date: "2020-01-01",
    year: 2020,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "Python 2 chega ao fim do suporte oficial",
    summary: "A Python Software Foundation encerra a manutenção do Python 2, forçando times de dados a migrarem pipelines, notebooks e bibliotecas legadas para o Python 3. O evento acelera a modernização de stacks de análise em empresas que ainda rodavam scripts antigos em produção.",
    reference: "PYTHON SOFTWARE FOUNDATION. Sunsetting Python 2. Python.org, Wilmington, 1 jan. 2020. Disponível em: https://www.python.org. Acesso em: 18 set. 2026."
  },
  {
    id: 2,
    date: "2020-01-29",
    year: 2020,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "pandas atinge a versão 1.0",
    summary: "Após mais de dez anos de desenvolvimento, a biblioteca pandas lança sua primeira versão estável 1.0.0, consolidando a API de referência para manipulação de dados tabulares em Python usada diariamente por analistas e cientistas de dados.",
    reference: "PANDAS DEVELOPMENT TEAM. pandas 1.0.0 release notes. Pandas.pydata.org, [S. l.], 29 jan. 2020. Disponível em: https://pandas.pydata.org. Acesso em: 18 set. 2026."
  },
  {
    id: 3,
    date: "2020-02-05",
    year: 2020,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Databricks capta rodada Série G e acelera disputa com data warehouses tradicionais",
    summary: "A Databricks anuncia nova rodada de investimento bilionária, avaliando a empresa em cerca de US$ 6,2 bilhões. O aporte reforça a estratégia de lakehouse como alternativa aos data warehouses tradicionais, tema que passa a dominar debates de arquitetura de dados.",
    reference: "TECHCRUNCH. Databricks raises $1 billion Series G funding round. TechCrunch, São Francisco, 5 fev. 2020. Disponível em: https://techcrunch.com. Acesso em: 18 set. 2026."
  },
  {
    id: 4,
    date: "2020-06-11",
    year: 2020,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "OpenAI apresenta o GPT-3",
    summary: "A OpenAI publica o artigo e a API do GPT-3, modelo de linguagem com 175 bilhões de parâmetros. O lançamento marca o início da onda de modelos de linguagem em larga escala que, poucos anos depois, passaria a integrar ferramentas de análise e geração de código usadas por equipes de dados.",
    reference: "OPENAI. Language models are few-shot learners (GPT-3). OpenAI, São Francisco, 11 jun. 2020. Disponível em: https://openai.com. Acesso em: 18 set. 2026."
  },
  {
    id: 5,
    date: "2020-09-16",
    year: 2020,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Snowflake abre capital na Bolsa de Nova York",
    summary: "O IPO da Snowflake na NYSE é considerado, à época, o maior IPO de uma empresa de software da história do mercado americano. O evento consolida o data warehouse em nuvem como categoria estratégica e chama atenção do mercado financeiro para empresas de infraestrutura de dados.",
    reference: "SNOWFLAKE INC. Snowflake announces pricing of initial public offering. Snowflake, Bozeman, 16 set. 2020. Disponível em: https://www.snowflake.com. Acesso em: 18 set. 2026."
  },
  {
    id: 6,
    date: "2020-12-17",
    year: 2020,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "Apache Airflow lança versão 2.0",
    summary: "O projeto Apache Airflow chega à versão 2.0, com scheduler de alta disponibilidade e nova interface. A ferramenta se firma como padrão de mercado para orquestração de pipelines de dados, papel central no dia a dia de engenheiros e analistas de dados.",
    reference: "APACHE SOFTWARE FOUNDATION. Airflow 2.0 is here. Apache Airflow, Wilmington, 17 dez. 2020. Disponível em: https://airflow.apache.org. Acesso em: 18 set. 2026."
  },

  // ===== 2021 =====
  {
    id: 7,
    date: "2021-02-01",
    year: 2021,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "Python 3.10 entra em desenvolvimento com match-case",
    summary: "A comunidade Python inicia o ciclo da versão 3.10, que introduziria o pattern matching estrutural (match-case). A novidade, lançada no fim do ano, muda a forma como cientistas de dados estruturam validações e transformações de dados complexas.",
    reference: "PYTHON SOFTWARE FOUNDATION. What's new in Python 3.10. Python.org, Wilmington, 2021. Disponível em: https://www.python.org. Acesso em: 18 set. 2026."
  },
  {
    id: 8,
    date: "2021-06-29",
    year: 2021,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "GitHub lança prévia pública do Copilot",
    summary: "A ferramenta de autocompletar código baseada em IA chega em versão técnica prévia. Times de dados passam a testar o assistente para acelerar a escrita de queries SQL, scripts de ETL e notebooks de análise exploratória.",
    reference: "GITHUB. GitHub Copilot: your AI pair programmer. The GitHub Blog, São Francisco, 29 jun. 2021. Disponível em: https://github.blog. Acesso em: 18 set. 2026."
  },
  {
    id: 9,
    date: "2021-07-15",
    year: 2021,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "DeepMind divulga o AlphaFold 2 e prevê estruturas de proteínas em escala",
    summary: "A DeepMind publica os resultados completos do AlphaFold 2 e disponibiliza um banco com centenas de milhares de estruturas de proteínas previstas. O caso se torna referência de como modelos de aprendizado profundo podem resolver problemas científicos tratados como big data.",
    reference: "DEEPMIND. AlphaFold reveals the structure of the protein universe. DeepMind, Londres, 15 jul. 2021. Disponível em: https://deepmind.google. Acesso em: 18 set. 2026."
  },
  {
    id: 10,
    date: "2021-08-31",
    year: 2021,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Databricks capta Série H com avaliação de cerca de US$ 38 bilhões",
    summary: "Nova rodada bilionária eleva a avaliação da Databricks para cerca de US$ 38 bilhões, reforçando a corrida entre lakehouse e data warehouse em nuvem e injetando recursos em pesquisa sobre MLOps e governança de dados.",
    reference: "TECHCRUNCH. Databricks raises $1.6B Series H at $38B valuation. TechCrunch, São Francisco, 31 ago. 2021. Disponível em: https://techcrunch.com. Acesso em: 18 set. 2026."
  },
  {
    id: 11,
    date: "2021-09-01",
    year: 2021,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "\"Analytics engineering\" se consolida como função na cadeia de dados",
    summary: "Com a popularização do dbt (data build tool), o mercado passa a tratar o analytics engineer como função própria, situada entre engenharia de dados e análise. A mudança reorganiza squads de dados em torno de transformação em SQL versionado.",
    reference: "GETDBT. What is analytics engineering?. dbt Labs, Filadélfia, 2021. Disponível em: https://www.getdbt.com. Acesso em: 18 set. 2026."
  },
  {
    id: 12,
    date: "2021-10-01",
    year: 2021,
    category: "carreira",
    categoryLabel: "Carreira & Mercado de Trabalho",
    title: "\"Grande Renúncia\" pressiona retenção de talentos em dados",
    summary: "O fenômeno global de pedidos de demissão em massa atinge também profissionais de dados, elevando salários e tempo de contratação para vagas de engenharia e ciência de dados, segundo relatórios do setor de recrutamento em tecnologia.",
    reference: "REUTERS. 'Great Resignation' reshapes hiring across the tech sector. Reuters, Nova York, out. 2021. Disponível em: https://www.reuters.com. Acesso em: 18 set. 2026."
  },
  {
    id: 13,
    date: "2021-10-28",
    year: 2021,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Facebook muda razão social para Meta e aposta em dados de metaverso",
    summary: "Ao se rebatizar como Meta, a empresa sinaliza investimento pesado em plataformas imersivas, o que implica novos volumes e tipos de dados (comportamentais, espaciais) a serem coletados, processados e analisados.",
    reference: "META. Introducing Meta: a social technology company. Meta Newsroom, Menlo Park, 28 out. 2021. Disponível em: https://about.meta.com. Acesso em: 18 set. 2026."
  },

  // ===== 2022 =====
  {
    id: 14,
    date: "2022-03-02",
    year: 2022,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Snowflake anuncia aquisição da Streamlit",
    summary: "A Snowflake compra a Streamlit, framework open source para criação rápida de aplicações de dados em Python, por valor estimado em cerca de US$ 800 milhões. A aquisição aproxima o data warehouse do último passo da cadeia analítica: a visualização e o app final para o usuário de negócio.",
    reference: "SNOWFLAKE INC. Snowflake to acquire Streamlit. Snowflake, Bozeman, 2 mar. 2022. Disponível em: https://www.snowflake.com. Acesso em: 18 set. 2026."
  },
  {
    id: 15,
    date: "2022-05-16",
    year: 2022,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "Apache Iceberg chega à versão 1.0",
    summary: "O formato de tabela aberto Apache Iceberg atinge maturidade de versão 1.0, oferecendo controle transacional e evolução de esquema para grandes lagos de dados. O projeto se torna peça-chave da arquitetura lakehouse adotada por diversas plataformas.",
    reference: "APACHE SOFTWARE FOUNDATION. Apache Iceberg 1.0.0 release. Apache Iceberg, Wilmington, 16 maio 2022. Disponível em: https://iceberg.apache.org. Acesso em: 18 set. 2026."
  },
  {
    id: 16,
    date: "2022-08-22",
    year: 2022,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Stable Diffusion é lançado em código aberto",
    summary: "A Stability AI libera publicamente os pesos do Stable Diffusion, modelo de geração de imagens a partir de texto. O lançamento acelera a adoção de IA generativa fora dos grandes laboratórios e antecipa discussões sobre dados de treinamento e direitos autorais.",
    reference: "STABILITY AI. Stable Diffusion public release. Stability AI, Londres, 22 ago. 2022. Disponível em: https://stability.ai. Acesso em: 18 set. 2026."
  },
  {
    id: 17,
    date: "2022-10-27",
    year: 2022,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Elon Musk conclui a compra do Twitter e reestrutura times internos",
    summary: "Após a aquisição, o Twitter (posteriormente renomeado X) passa por cortes profundos em equipes de dados, confiança e segurança, gerando debate no mercado sobre o papel de squads de dados na moderação e monetização de plataformas sociais.",
    reference: "REUTERS. Musk closes $44 billion deal to own Twitter. Reuters, Nova York, 27 out. 2022. Disponível em: https://www.reuters.com. Acesso em: 18 set. 2026."
  },
  {
    id: 18,
    date: "2022-11-09",
    year: 2022,
    category: "carreira",
    categoryLabel: "Carreira & Mercado de Trabalho",
    title: "Onda de demissões em big techs atinge equipes de dados e produto",
    summary: "Cortes anunciados por Meta, Amazon e outras big techs no fim de 2022 incluem times de dados e ciência de dados, reacomodando o mercado de trabalho da área após dois anos de expansão acelerada durante a pandemia.",
    reference: "REUTERS. Meta to cut more than 11,000 jobs. Reuters, Nova York, 9 nov. 2022. Disponível em: https://www.reuters.com. Acesso em: 18 set. 2026."
  },
  {
    id: 19,
    date: "2022-11-30",
    year: 2022,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "OpenAI lança o ChatGPT",
    summary: "O lançamento do ChatGPT se torna o marco mais citado da década em IA aplicada. Para analistas e cientistas de dados, o produto populariza o uso de LLMs para geração de código, documentação de pipelines e exploração inicial de dados em linguagem natural.",
    reference: "OPENAI. Introducing ChatGPT. OpenAI, São Francisco, 30 nov. 2022. Disponível em: https://openai.com. Acesso em: 18 set. 2026."
  },
  {
    id: 20,
    date: "2022-12-01",
    year: 2022,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "Gartner aponta data fabric e data mesh como tendências centrais",
    summary: "Relatórios da consultoria Gartner colocam data fabric e data mesh entre as arquiteturas de dados mais estratégicas do período, influenciando decisões de reestruturação de plataformas de dados em grandes empresas.",
    reference: "GARTNER. Gartner top strategic technology trends for data and analytics. Gartner, Stamford, 2022. Disponível em: https://www.gartner.com. Acesso em: 18 set. 2026."
  },
  {
    id: 21,
    date: "2022-12-15",
    year: 2022,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "Ferramentas de self-service BI crescem no trabalho híbrido",
    summary: "Com a consolidação do trabalho remoto e híbrido, plataformas como Power BI e Looker registram crescimento de uso, ampliando o número de usuários de negócio que consultam dados diretamente, sem depender exclusivamente de times técnicos.",
    reference: "MICROSOFT. Power BI year in review. Microsoft Power BI Blog, Redmond, dez. 2022. Disponível em: https://www.microsoft.com. Acesso em: 18 set. 2026."
  },

  // ===== 2023 =====
  {
    id: 22,
    date: "2023-03-14",
    year: 2023,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "OpenAI lança o GPT-4",
    summary: "O GPT-4 chega com capacidade multimodal e ganhos relevantes de raciocínio, sendo rapidamente incorporado a ferramentas de análise de dados, geração de SQL e assistentes de código usados por equipes técnicas.",
    reference: "OPENAI. GPT-4 is here. OpenAI, São Francisco, 14 mar. 2023. Disponível em: https://openai.com. Acesso em: 18 set. 2026."
  },
  {
    id: 23,
    date: "2023-04-03",
    year: 2023,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "pandas 2.0 chega com backend Apache Arrow",
    summary: "A versão 2.0 do pandas passa a suportar Apache Arrow como backend opcional, prometendo ganhos de desempenho e melhor interoperabilidade com outras ferramentas do ecossistema de dados, como Polars e DuckDB.",
    reference: "PANDAS DEVELOPMENT TEAM. pandas 2.0.0 release notes. Pandas.pydata.org, [S. l.], 3 abr. 2023. Disponível em: https://pandas.pydata.org. Acesso em: 18 set. 2026."
  },
  {
    id: 24,
    date: "2023-06-26",
    year: 2023,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Databricks adquire a MosaicML por cerca de US$ 1,3 bilhão",
    summary: "A compra da MosaicML, especializada em treinamento eficiente de modelos de IA, mostra a Databricks migrando de plataforma de dados para provedora completa de infraestrutura de dados e IA generativa.",
    reference: "DATABRICKS. Databricks to acquire MosaicML. Databricks Blog, São Francisco, 26 jun. 2023. Disponível em: https://www.databricks.com. Acesso em: 18 set. 2026."
  },
  {
    id: 25,
    date: "2023-07-18",
    year: 2023,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Meta libera o Llama 2 em código aberto",
    summary: "A Meta disponibiliza os pesos do Llama 2 para uso comercial, impulsionando um ecossistema de modelos abertos que passam a ser avaliados por times de dados como alternativa a APIs fechadas para casos de uso internos.",
    reference: "META AI. Llama 2: open foundation and fine-tuned chat models. Meta AI, Menlo Park, 18 jul. 2023. Disponível em: https://ai.meta.com. Acesso em: 18 set. 2026."
  },
  {
    id: 26,
    date: "2023-07-11",
    year: 2023,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Anthropic lança o Claude 2",
    summary: "A Anthropic amplia o acesso ao Claude 2, com janela de contexto maior e foco declarado em segurança. O modelo passa a ser testado por equipes de dados para tarefas de sumarização e análise de grandes volumes de texto.",
    reference: "ANTHROPIC. Claude 2. Anthropic, São Francisco, 11 jul. 2023. Disponível em: https://www.anthropic.com. Acesso em: 18 set. 2026."
  },
  {
    id: 27,
    date: "2023-05-25",
    year: 2023,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Snowflake adquire a Neeva",
    summary: "A aquisição da Neeva, startup de busca fundada por ex-executivos do Google, reforça a estratégia da Snowflake de incorporar busca e IA generativa diretamente sobre os dados armazenados em sua plataforma.",
    reference: "SNOWFLAKE INC. Snowflake to acquire Neeva. Snowflake, Bozeman, 25 maio 2023. Disponível em: https://www.snowflake.com. Acesso em: 18 set. 2026."
  },
  {
    id: 28,
    date: "2023-12-08",
    year: 2023,
    category: "regulacao",
    categoryLabel: "Regulação & Ética",
    title: "União Europeia fecha acordo político sobre o AI Act",
    summary: "Parlamento Europeu, Conselho e Comissão chegam a um acordo político sobre a lei de IA do bloco, estabelecendo obrigações de transparência e governança de dados para sistemas de alto risco, com impacto direto sobre times que lidam com dados pessoais e modelos preditivos.",
    reference: "EUROPEAN COMMISSION. Artificial Intelligence Act: political agreement. European Commission, Bruxelas, 8 dez. 2023. Disponível em: https://ec.europa.eu. Acesso em: 18 set. 2026."
  },
  {
    id: 29,
    date: "2023-09-01",
    year: 2023,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "DuckDB ganha tração como banco analítico embarcado",
    summary: "O banco de dados analítico DuckDB, que roda embarcado no processo da aplicação, passa a ser adotado por analistas para consultas locais rápidas sobre arquivos Parquet e CSV, sem exigir um cluster ou servidor dedicado.",
    reference: "DUCKDB FOUNDATION. Why DuckDB. DuckDB.org, Amsterdã, 2023. Disponível em: https://duckdb.org. Acesso em: 18 set. 2026."
  },
  {
    id: 30,
    date: "2023-11-01",
    year: 2023,
    category: "carreira",
    categoryLabel: "Carreira & Mercado de Trabalho",
    title: "Nova onda de cortes em tecnologia segue afetando áreas de dados",
    summary: "Mesmo com a retomada de investimentos em IA, empresas de tecnologia mantêm cortes pontuais em times de dados ao longo de 2023, movimento associado à busca por eficiência operacional após os ciclos de contratação da pandemia.",
    reference: "REUTERS. Tech layoffs tracker: 2023 job cuts. Reuters, Nova York, 2023. Disponível em: https://www.reuters.com. Acesso em: 18 set. 2026."
  },

  // ===== 2024 =====
  {
    id: 31,
    date: "2024-02-15",
    year: 2024,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Google apresenta o Gemini 1.5",
    summary: "O Gemini 1.5, com janela de contexto de até 1 milhão de tokens, amplia o que é possível analisar em uma única chamada de modelo, incluindo documentos extensos e planilhas inteiras, tarefa antes reservada a pipelines de processamento dedicados.",
    reference: "GOOGLE. Our next-generation model: Gemini 1.5. Google Blog, Mountain View, 15 fev. 2024. Disponível em: https://blog.google. Acesso em: 18 set. 2026."
  },
  {
    id: 32,
    date: "2024-04-18",
    year: 2024,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Meta lança a família Llama 3",
    summary: "Os modelos Llama 3, em versões de 8 e 70 bilhões de parâmetros, elevam o patamar de desempenho de modelos abertos, incentivando empresas a rodar LLMs próprios sobre seus dados internos por custo e controle.",
    reference: "META AI. Introducing Meta Llama 3. Meta AI, Menlo Park, 18 abr. 2024. Disponível em: https://ai.meta.com. Acesso em: 18 set. 2026."
  },
  {
    id: 33,
    date: "2024-05-13",
    year: 2024,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "OpenAI lança o GPT-4o",
    summary: "O GPT-4o integra texto, voz e imagem em um único modelo com latência reduzida, ampliando casos de uso de análise de dados multimodal, como leitura de gráficos e dashboards diretamente por IA.",
    reference: "OPENAI. Hello GPT-4o. OpenAI, São Francisco, 13 maio 2024. Disponível em: https://openai.com. Acesso em: 18 set. 2026."
  },
  {
    id: 34,
    date: "2024-06-20",
    year: 2024,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Anthropic lança o Claude 3.5 Sonnet",
    summary: "O Claude 3.5 Sonnet chega com ganhos relevantes em raciocínio e geração de código, sendo adotado por equipes de dados em tarefas de escrita e revisão de consultas SQL e scripts de transformação.",
    reference: "ANTHROPIC. Claude 3.5 Sonnet. Anthropic, São Francisco, 20 jun. 2024. Disponível em: https://www.anthropic.com. Acesso em: 18 set. 2026."
  },
  {
    id: 35,
    date: "2024-06-04",
    year: 2024,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Databricks adquire a Tabular, empresa por trás do Apache Iceberg",
    summary: "Ao comprar a Tabular, fundada por criadores do Apache Iceberg, a Databricks reforça sua aposta em formatos de tabela abertos e amplia a disputa direta com a Snowflake pelo controle da camada de armazenamento analítico.",
    reference: "DATABRICKS. Databricks to acquire Tabular. Databricks Blog, São Francisco, 4 jun. 2024. Disponível em: https://www.databricks.com. Acesso em: 18 set. 2026."
  },
  {
    id: 36,
    date: "2024-07-01",
    year: 2024,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "Formatos de tabela abertos viram padrão de mercado",
    summary: "Apache Iceberg, Delta Lake e Apache Hudi passam a ser suportados nativamente por praticamente todas as grandes plataformas de dados, tornando o formato de tabela aberto um requisito básico de arquitetura, e não mais um diferencial.",
    reference: "APACHE SOFTWARE FOUNDATION. Apache Iceberg adoption report. Apache Iceberg, Wilmington, 2024. Disponível em: https://iceberg.apache.org. Acesso em: 18 set. 2026."
  },
  {
    id: 37,
    date: "2024-08-01",
    year: 2024,
    category: "regulacao",
    categoryLabel: "Regulação & Ética",
    title: "AI Act da União Europeia entra formalmente em vigor",
    summary: "Com a entrada em vigor da lei, empresas que operam na Europa passam a precisar mapear e documentar o uso de dados em sistemas de IA classificados como de alto risco, movimento que se espalha para políticas internas de governança de dados fora do bloco.",
    reference: "EUROPEAN COMMISSION. AI Act enters into force. European Commission, Bruxelas, ago. 2024. Disponível em: https://ec.europa.eu. Acesso em: 18 set. 2026."
  },
  {
    id: 38,
    date: "2024-12-17",
    year: 2024,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Databricks capta nova rodada bilionária e avaliação dispara",
    summary: "Nova rodada de investimento eleva a avaliação da Databricks para dezenas de bilhões de dólares, reafirmando o apetite do mercado por plataformas que combinam dados e inteligência artificial em uma só oferta.",
    reference: "DATABRICKS. Databricks announces Series J funding round. Databricks Blog, São Francisco, 17 dez. 2024. Disponível em: https://www.databricks.com. Acesso em: 18 set. 2026."
  },
  {
    id: 39,
    date: "2024-11-01",
    year: 2024,
    category: "carreira",
    categoryLabel: "Carreira & Mercado de Trabalho",
    title: "IA generativa lidera lista de habilidades mais demandadas para profissionais de dados",
    summary: "Relatórios de plataformas de emprego e recrutamento apontam habilidades em IA generativa e prompting como diferencial crescente em vagas de análise e ciência de dados, ao lado das competências tradicionais em SQL e estatística.",
    reference: "LINKEDIN. Jobs on the rise: skills report. LinkedIn, Sunnyvale, 2024. Disponível em: https://www.linkedin.com. Acesso em: 18 set. 2026."
  },

  // ===== 2025 =====
  {
    id: 40,
    date: "2025-01-20",
    year: 2025,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "DeepSeek libera o modelo R1 em código aberto e abala o mercado de IA",
    summary: "A chinesa DeepSeek lança o modelo de raciocínio R1 com pesos abertos e custo de treinamento reportado como muito inferior ao de concorrentes ocidentais, gerando forte reação nos mercados de tecnologia e novo debate sobre eficiência no treinamento de modelos.",
    reference: "DEEPSEEK. DeepSeek-R1: incentivizing reasoning capability in LLMs. DeepSeek, Hangzhou, 20 jan. 2025. Disponível em: https://www.deepseek.com. Acesso em: 18 set. 2026."
  },
  {
    id: 41,
    date: "2025-05-22",
    year: 2025,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "Anthropic lança a família Claude 4",
    summary: "Os modelos Claude 4 chegam com avanços em tarefas longas de raciocínio e uso de ferramentas, ampliando a adoção de agentes de IA capazes de executar etapas completas de análise de dados de forma autônoma.",
    reference: "ANTHROPIC. Introducing Claude 4. Anthropic, São Francisco, 22 maio 2025. Disponível em: https://www.anthropic.com. Acesso em: 18 set. 2026."
  },
  {
    id: 42,
    date: "2025-08-07",
    year: 2025,
    category: "ia-llm",
    categoryLabel: "Inteligência Artificial & LLMs",
    title: "OpenAI lança o GPT-5",
    summary: "O GPT-5 chega com ganhos em raciocínio e uso agentivo de ferramentas, ampliando a capacidade de LLMs de conduzir fluxos completos de análise de dados, da consulta à geração do relatório final.",
    reference: "OPENAI. Introducing GPT-5. OpenAI, São Francisco, 7 ago. 2025. Disponível em: https://openai.com. Acesso em: 18 set. 2026."
  },
  {
    id: 43,
    date: "2025-06-01",
    year: 2025,
    category: "mercado",
    categoryLabel: "Mercado & Negócios",
    title: "Snowflake amplia portfólio de IA generativa sobre dados corporativos",
    summary: "A Snowflake segue investindo em recursos nativos de IA generativa dentro do próprio data warehouse, permitindo consultas em linguagem natural e geração automática de análises sem exportar dados para fora da plataforma.",
    reference: "SNOWFLAKE INC. Snowflake data and AI announcements. Snowflake, Bozeman, 2025. Disponível em: https://www.snowflake.com. Acesso em: 18 set. 2026."
  },
  {
    id: 44,
    date: "2025-09-01",
    year: 2025,
    category: "engenharia-dados",
    categoryLabel: "Engenharia de Dados",
    title: "Disputa por padrão aberto de dados para IA se intensifica",
    summary: "Databricks, Snowflake e provedores de nuvem aceleram investimentos em catálogos e formatos abertos de dados, buscando se posicionar como a camada de referência sobre a qual agentes de IA vão consultar e escrever dados corporativos.",
    reference: "GARTNER. Market guide for data and AI platforms. Gartner, Stamford, 2025. Disponível em: https://www.gartner.com. Acesso em: 18 set. 2026."
  },
  {
    id: 45,
    date: "2025-10-01",
    year: 2025,
    category: "carreira",
    categoryLabel: "Carreira & Mercado de Trabalho",
    title: "\"AI Engineer\" se firma como extensão da engenharia de dados",
    summary: "A função de AI Engineer, voltada a integrar LLMs a produtos e pipelines, passa a aparecer com frequência crescente em vagas de tecnologia, muitas vezes preenchida por engenheiros e cientistas de dados que migram de função.",
    reference: "LINKEDIN. Emerging jobs report. LinkedIn, Sunnyvale, 2025. Disponível em: https://www.linkedin.com. Acesso em: 18 set. 2026."
  },

  // ===== 2026 =====
  {
    id: 46,
    date: "2026-02-01",
    year: 2026,
    category: "regulacao",
    categoryLabel: "Regulação & Ética",
    title: "Governança de dados para treinar agentes de IA ganha peso regulatório",
    summary: "Reguladores e áreas de compliance passam a exigir documentação mais detalhada sobre origem, qualidade e consentimento dos dados usados para treinar e ajustar agentes de IA que atuam sobre sistemas corporativos.",
    reference: "EUROPEAN COMMISSION. AI Act implementation guidelines. European Commission, Bruxelas, 2026. Disponível em: https://ec.europa.eu. Acesso em: 18 set. 2026."
  },
  {
    id: 47,
    date: "2026-03-01",
    year: 2026,
    category: "ferramentas",
    categoryLabel: "Ferramentas & Linguagens",
    title: "Ferramentas de BI incorporam agentes de IA para análise autônoma",
    summary: "Plataformas de business intelligence passam a oferecer agentes capazes de investigar variações em métricas, propor hipóteses e montar dashboards sem intervenção manual, mudando o papel do analista para revisor e curador dessas análises.",
    reference: "MICROSOFT. Copilot in Power BI: agentic analytics. Microsoft Power BI Blog, Redmond, 2026. Disponível em: https://www.microsoft.com. Acesso em: 18 set. 2026."
  }
];
