# Monetização — AdSense e links de afiliado

Estado (2026-10-29): **AdSense pronto e desligado**; nada é carregado do Google até as variáveis abaixo serem definidas. **Links de afiliado da Amazon ativos** nos 12 livros publicados (tag `pautaliberdade-20`).

## Antes de ativar (bloqueios)

1. **Hospedagem**: o plano **Hobby da Vercel é só para uso não comercial**. Anúncios e links de afiliado são uso comercial — é preciso migrar para um plano compatível (ex.: Vercel Pro) antes de ativar anúncios em produção. Os links de afiliado já estão ativos no código: confirme o plano antes do próximo deploy ou desative-os (`active: false`). O plano atual não pôde ser conferido daqui (a conta Vercel conectada ao assistente não lista este projeto); confira no painel da Vercel.
5. **Amazon Associates**: confirme no painel do Programa de Associados que o domínio `dataconstruction.vercel.app` está cadastrado na conta da tag `pautaliberdade-20`.
2. **Contato**: defina `NEXT_PUBLIC_CONTACT_EMAIL`; as páginas de Privacidade e Termos exibem esse canal (exigência da LGPD).
3. **Revisão jurídica** das páginas `/privacidade`, `/cookies` e `/termos` (o texto descreve o funcionamento real do site, mas não substitui revisão profissional).
4. **Conta AdSense aprovada**: a aprovação é feita pelo Google após análise do site; a estrutura técnica não garante aprovação.

## Google AdSense

### Dois estados separados

| Estado | O que precisa | O que acontece |
|---|---|---|
| **Verificação** | `NEXT_PUBLIC_ADSENSE_CLIENT` | Metatag `google-adsense-account` em todas as páginas e `/ads.txt` com a linha do Google. Nenhum script de anúncio é carregado. |
| **Veiculação** | + `NEXT_PUBLIC_ADSENSE_ENABLED=true`, deploy de **Production** | Posições manuais com ID de bloco passam a pedir anúncios, depois da escolha de consentimento. |
| Anúncios automáticos (opcional) | + `NEXT_PUBLIC_ADSENSE_AUTO_ADS=true` e Auto ads ligados no painel | O script carrega em todas as páginas permitidas; o Google decide onde exibir. |

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Publisher ID, formato `ca-pub-` + 16 dígitos (painel do AdSense → Conta → Informações da conta) |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `true` somente após a aprovação do site e com hospedagem comercial |
| `NEXT_PUBLIC_ADSENSE_AUTO_ADS` | `true` para anúncios automáticos (padrão `false`) |
| `NEXT_PUBLIC_ADSENSE_PREVIEW` | `true` para ver as posições reservadas fora de Production, sem carregar anúncios |

### Posições manuais — `content/settings/ads.json`

Arquivo estático validado por Zod (`lib/monetization/placements.ts`), no mesmo formato estável dos demais arquivos de `content/`. Campos de cada posição: `id`, `name`, `page`, `slot` (ID numérico do bloco ou `null`), `active`, `format` (`auto`, `horizontal`, `rectangle`, `in-article`), `priority` (1 = mais importante), `devices` (`mobile`, `desktop`; breakpoint `lg`).

| id | Página | Local |
|---|---|---|
| `home-mid` | Home | Entre Notícias e Datasets (longe do Hero) |
| `news-list` | /noticias | Após os destaques |
| `news-detail` | /noticias/[slug] | Após o conteúdo |
| `article-inline` | /artigos/[slug] | Antes do subtítulo mais próximo do meio (só textos com 8+ blocos; nunca dentro de parágrafo ou código) |
| `datasets-mid` | /datasets | Entre os destaques e os pontos de partida |
| `books-mid` | /livros | Entre os temas IA e Python, separado dos links de compra/afiliado |

Limites globais no mesmo arquivo: `maxManualPerPage` (2) e `maxManualPerPageWithAutoAds` (1). Com anúncios automáticos ligados, só a posição de maior prioridade de cada página permanece. `autoAdsExcludedPaths` soma prefixos de rota sem anúncios automáticos.

Para desligar numa página específica: `<AdSlot placement="..." disabled />`.

### Comportamento garantido pelo código

(`lib/monetization/ads.ts`, `placements.ts`, `adsense-script.ts`; testado em `tests/unit/monetization.test.ts`)

- Veiculação só com `ENABLED=true`, Publisher ID válido e deploy de Production (nunca Preview ou local).
- Posição sem ID de bloco, inativa ou fora do limite por página não aparece. Nenhum ID é inventado (teste garante `slot: null` no repositório).
- Nada carrega antes da escolha de consentimento. Script oficial injetado uma única vez (ID fixo; o `<head>` persiste na navegação do App Router), e só quando uma posição se aproxima da tela ou com anúncios automáticos.
- Cada bloco é pedido uma vez (guarda própria + `data-adsbygoogle-status`); erros do AdSense/bloqueadores deixam o espaço vazio, sem quebrar a página.
- Espaço reservado por formato (ex.: 280px no celular, 250px no desktop), identificado como "Publicidade".
- Sem anúncios em: login/cadastro/recuperação de senha/conta, `/auth` e páginas legais.
- `/ads.txt` é gerado a partir do Publisher ID (404 enquanto não configurado). Fica numa rota (`app/ads.txt/route.ts`) e não em `public/`, para não haver ID escrito à mão no repositório.

### Passos no painel do AdSense
1. **Sites → Adicionar site** com o domínio de produção. Copiar o Publisher ID (`ca-pub-…`) para `NEXT_PUBLIC_ADSENSE_CLIENT` na Vercel (Production) e fazer o deploy. Escolher o método de verificação **metatag** (já publicada) ou **ads.txt** (já publicado).
2. Pedir a revisão e aguardar a aprovação.
3. Após aprovado: **Anúncios → Por bloco de anúncios → Anúncios de display**, criar um bloco responsivo para cada posição desejada (nome igual ao `name`), copiar o `data-ad-slot` numérico para o `slot` correspondente em `content/settings/ads.json`.
4. Definir `NEXT_PUBLIC_ADSENSE_ENABLED=true` e fazer o deploy.
5. **Anúncios automáticos**: manter desligados no painel. Se forem ligados: ligar também `NEXT_PUBLIC_ADSENSE_AUTO_ADS=true`, usar carga de anúncios baixa e, em **Configurações avançadas → Exclusões de páginas**, excluir `/entrar`, `/cadastro`, `/conta`, `/privacidade`, `/cookies` e `/termos` (a navegação sem recarregar a página não descarrega um script já carregado).
6. **Privacidade e mensagens**: configurar a mensagem de consentimento do Google para visitantes do EEE/Reino Unido/Suíça.

### Consentimento (LGPD)
- O aviso de cookies só aparece quando há anúncios ativos (ou em pré-visualização).
- Nenhum anúncio é carregado antes da escolha. "Aceitar" → anúncios personalizados; "Recusar" → anúncios **não personalizados** (`requestNonPersonalizedAds = 1`).
- Mudar a escolha com o script já carregado recarrega a página, para a nova escolha valer em todos os pedidos.
- A escolha fica no navegador (`localStorage`, chave `dc-consent-v1`) e pode ser revista pelo link "Preferências de cookies" no rodapé e em `/cookies`.
- Os textos de `/privacidade`, `/cookies` e `/termos` se ajustam ao estado real, mas **precisam de revisão jurídica** antes da ativação.

### Relatórios
Receita, impressões, cliques, RPM e CTR ficam no painel do AdSense. Nenhuma métrica é exibida ou estimada pelo site.

## Livros e links de afiliado

- Catálogo: `data/books.ts` (tipos) e `content/books/*.json` — 12 livros publicados de Dados, IA, Python e SQL, todos em edições brasileiras (português). Dados bibliográficos conferidos por ISBN em base pública (`npm run verify:books`).
- Arquivados (fora do site): `python-fluente` (substituído por `pense-em-python`; sem capa nem link) e, para publicação futura, `sql-guia-pratico` (Alice Zhao, Novatec, 4ª ed., ISBN 9788575228319) e `curso-intensivo-de-mysql` (Rick Silva, Novatec, ISBN 9788575228722). Os dois últimos têm link de afiliado guardado com `active: false` e capa em `public/images/books/` (antigos `13.png` e `14.png`). **Autorização de uso das capas não comprovada**: confirme com a editora antes de publicar. Para publicar: `status: "published"` no livro **e** `active: true` no link, no mesmo commit.
- Os antigos `livros-afiliados.json` e `livros-extras.json` da raiz não eram lidos pelo código; os dados foram conferidos em `content/afiliados/livros.json` e os arquivos removidos (cópia no backup local de 2026-10-29).
- Dados comerciais à parte, em `content/afiliados/livros.json`, indexados pelo id do livro (sem repetir título, autores ou descrição):

  ```json
  { "schemaVersion": 1, "books": { "pense-em-python": { "cover": "/images/books/pense-em-python.webp", "affiliateUrl": "https://www.amazon.com.br/dp/8575229273?tag=pautaliberdade-20", "active": true } } }
  ```

- Leitura e validação: `lib/monetization/book-affiliates.ts` (Zod, só no servidor). Testes em `tests/unit/monetization.test.ts`.

### Botão "Ver na Amazon"
- Aparece só com `active: true` **e** `affiliateUrl` preenchida com uma URL HTTPS de `amazon.com.br` (ou `www.amazon.com.br`). Sem isso, o livro fica sem botão. Os 12 livros têm link ativo, conferido na página da Amazon; um teste exige que cada URL seja `/dp/<ISBN-10 do catálogo>?tag=pautaliberdade-20`.
- URL fora da Amazon Brasil, campo desconhecido, capa fora de `/images/books/`, link **ativo** para livro não publicado ou livro publicado sem configuração **interrompem o build** com mensagem explícita. Link inativo de livro arquivado é permitido.
- Edição: se a URL tiver o código do produto (`/dp/…` ou `/gp/product/…`) em formato de ISBN-10, ele precisa corresponder ao ISBN-13 do catálogo; outro ISBN interrompe o build. Códigos de e-book (`B0…`) e links encurtados não podem ser conferidos automaticamente — revise a edição manualmente.
- Link: nova aba, `rel="sponsored noopener noreferrer"` e texto para leitor de tela ("link de afiliado, abre em nova aba"). Ao lado do botão, o selo discreto "Publicidade" (visual; o leitor de tela já ouve "link de afiliado"). A página /livros mostra a declaração do Programa de Associados (`AFFILIATE_DISCLOSURE`) antes da lista, só quando há link ativo. Recolocados a pedido em 2026-10-29, depois de terem sido removidos.
- Nada de preço, desconto ou avaliação: a página não exibe nenhum desses dados.
- Termos, Privacidade e Cookies exibem o aviso do Programa de Associados sempre que houver ao menos um link ativo (`hasActiveAffiliateLinks`) ou quando `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` estiver definida. Assim nenhum link comercial vai ao ar sem divulgação, mesmo se a variável faltar na Vercel. Termos identifica os botões "Ver na Amazon" como links de afiliado.

### Capas
- Arquivo em `public/images/books/<id>.webp` (também aceita `.avif`, `.jpg`, `.png`), no caminho indicado em `cover`.
- Exibidas com `next/image` (otimização e carregamento sob demanda), contidas num quadro 2:3: a proporção original é preservada, sem cortar nem esticar. Texto alternativo: "Capa do livro <título>".
- Arquivo ausente: placeholder tipográfico (tema e ano). A verificação ocorre no build — capa adicionada depois aparece no próximo deploy.
- **Direitos de uso**: a capa é obra protegida. Use imagens com autorização da editora (kits de imprensa costumam permitir divulgação). O Contrato Operacional do Programa de Associados não permite baixar imagens de produto da Amazon e hospedá-las no próprio site; a forma permitida é exibi-las a partir dos servidores da Amazon, via SiteStripe (link de imagem) ou pela API de produtos para associados, que exige um número mínimo de vendas qualificadas e atualização periódica dos dados. Isso exigiria aceitar imagens remotas da Amazon (`images.remotePatterns` e um campo de URL externa no schema) — não implementado. Confira as regras vigentes no Associates Central antes de escolher.

### Preparação para um painel futuro
O formato já comporta as operações previstas sem mudar o site: enviar ou substituir capa = gravar o arquivo em `public/images/books/` e atualizar `cover`; cadastrar link = `affiliateUrl`; divulgar ou ocultar = `active`. Qualquer gravação deve passar por `parseBookAffiliateSettings` e `findBookAffiliateIssues` antes de salvar. Em hospedagem sem disco gravável (Vercel), a gravação teria de ser um commit no repositório ou um armazenamento externo.

## Verificação

```bash
npm test               # inclui regras de anúncios, afiliados, ISBN e consentimento
npm run verify:books   # confere os livros em base pública (somente leitura)
```
