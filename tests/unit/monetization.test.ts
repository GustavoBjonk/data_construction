import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findInlineSlotIndex } from "@/components/articles/ArticleContent";
import { buildAdsTxt, isAdFreeRoute, resolveAdsConfig } from "@/lib/monetization/ads";
import { ADS_SETTINGS, parseAdsSettings, resolvePlacement, selectPagePlacements } from "@/lib/monetization/placements";
import { getAffiliateTag, isValidIsbn13 } from "@/lib/monetization/affiliate";
import {
  BOOK_AFFILIATES,
  findBookAffiliateIssues,
  getBookOffers,
  isAmazonBrUrl,
  isbn13ToIsbn10,
  hasActiveAffiliateLinks,
  parseBookAffiliateSettings,
  resolveAffiliateUrl,
  resolveCover,
} from "@/lib/monetization/book-affiliates";
import { NEWS_CATEGORIES } from "@/data/news";
import { NEWS_CATEGORY_INFO } from "@/lib/news-categories";
import { isAuthEnabled } from "@/lib/supabase/env";
import { loadPublishedContent, readCollection } from "@/lib/content/store";

const { books } = await loadPublishedContent();

const VALID_CLIENT = "ca-pub-1234567890123456";

describe("livros", () => {
  it("todos têm ISBN-13 válido e únicos", () => {
    for (const book of books) expect(isValidIsbn13(book.isbn13), book.id).toBe(true);
    expect(new Set(books.map((b) => b.isbn13)).size).toBe(books.length);
    expect(new Set(books.map((b) => b.id)).size).toBe(books.length);
  });

  it("versões gratuitas usam HTTPS", () => {
    for (const book of books.filter((b) => b.freeOnlineUrl)) expect(book.freeOnlineUrl).toMatch(/^https:\/\//);
  });

  it("validação de ISBN rejeita dígito verificador errado", () => {
    expect(isValidIsbn13("9781449373320")).toBe(true);
    expect(isValidIsbn13("9781449373321")).toBe(false);
    expect(isValidIsbn13("123")).toBe(false);
  });
});

describe("links de afiliado (content/afiliados/livros.json)", () => {
  const entry = (affiliateUrl: string, active = true) => ({ cover: "/images/books/x.webp", affiliateUrl, active });
  const book = books.find((b) => b.id === "pense-em-python")!;

  it("links ativos cobrem exatamente os 12 livros publicados, sem inconsistências", () => {
    expect(books).toHaveLength(12);
    const active = Object.entries(BOOK_AFFILIATES.books).filter(([, config]) => config.active).map(([id]) => id);
    expect(active.sort()).toEqual(books.map((b) => b.id).sort());
    expect(findBookAffiliateIssues(BOOK_AFFILIATES, books)).toEqual([]);
  });

  it("links inativos só guardam livros arquivados, que não aparecem no site", async () => {
    const catalog = await readCollection("books");
    const archived = new Set(catalog.filter((item) => item.status === "archived").map((item) => item.data.id));
    expect([...archived].sort()).toEqual(["curso-intensivo-de-mysql", "python-fluente", "sql-guia-pratico"]);
    const inactive = Object.entries(BOOK_AFFILIATES.books).filter(([, config]) => !config.active).map(([id]) => id);
    expect(inactive.sort()).toEqual(["curso-intensivo-de-mysql", "sql-guia-pratico"]);
    for (const id of inactive) expect(resolveAffiliateUrl(BOOK_AFFILIATES.books[id])).toBeNull();
    expect(books.some((book) => archived.has(book.id))).toBe(false);
  });

  it("acusa link ativo para livro não publicado", () => {
    const settings = (active: boolean) => ({
      schemaVersion: 1 as const,
      books: { ...BOOK_AFFILIATES.books, "sql-guia-pratico": entry("https://www.amazon.com.br/dp/8575228315", active) },
    });
    expect(findBookAffiliateIssues(settings(false), books)).toEqual([]);
    expect(findBookAffiliateIssues(settings(true), books)).toHaveLength(1);
  });

  it("aviso de afiliados acompanha os links ativos, mesmo sem a tag no ambiente", () => {
    expect(hasActiveAffiliateLinks()).toBe(true);
    const inactive = Object.fromEntries(Object.entries(BOOK_AFFILIATES.books).map(([id, config]) => [id, { ...config, active: false }]));
    expect(hasActiveAffiliateLinks({ schemaVersion: 1, books: inactive })).toBe(false);
  });

  it("os 12 livros têm link ativo para a mesma edição do catálogo (ISBN-10 na URL)", () => {
    for (const book of books) {
      const config = BOOK_AFFILIATES.books[book.id];
      expect(config?.active, book.id).toBe(true);
      expect(config?.affiliateUrl, book.id).toBe(`https://www.amazon.com.br/dp/${isbn13ToIsbn10(book.isbn13)}?tag=pautaliberdade-20`);
    }
  });

  it("os 12 livros têm capa própria em public/images/books", () => {
    for (const book of books) {
      const config = BOOK_AFFILIATES.books[book.id];
      expect(config?.cover, book.id).toMatch(new RegExp(`^/images/books/${book.id}\\.(?:webp|avif|jpg|png)$`));
      expect(resolveCover(config), book.id).toBe(config?.cover);
    }
  });

  it("só exibe link ativo, preenchido e da Amazon Brasil em HTTPS", () => {
    const url = "https://www.amazon.com.br/dp/8575229273?tag=loja-20";
    expect(resolveAffiliateUrl(entry(url))).toBe(url);
    expect(resolveAffiliateUrl(entry(url, false))).toBeNull();
    expect(resolveAffiliateUrl(entry(""))).toBeNull();
    expect(resolveAffiliateUrl(undefined)).toBeNull();
    expect(isAmazonBrUrl("http://www.amazon.com.br/dp/8575229273")).toBe(false);
    expect(isAmazonBrUrl("https://www.amazon.com/dp/8575229273")).toBe(false);
    expect(isAmazonBrUrl("https://amazon.com.br.evil.example/dp/1")).toBe(false);
    expect(isAmazonBrUrl("https://user:pw@www.amazon.com.br/dp/1")).toBe(false);
    expect(isAmazonBrUrl("javascript:alert(1)")).toBe(false);
  });

  it("schema rejeita URL fora da Amazon Brasil, campo extra e capa fora da pasta", () => {
    const parse = (books: unknown) => () => parseBookAffiliateSettings({ schemaVersion: 1, books });
    expect(parse({ "pense-em-python": entry("https://exemplo.com/livro") })).toThrow();
    expect(parse({ "pense-em-python": { ...entry(""), price: "R$ 10" } })).toThrow();
    expect(parse({ "pense-em-python": { ...entry(""), cover: "../segredo.webp" } })).toThrow();
    expect(parse({ "pense-em-python": entry("") })).not.toThrow();
  });

  it("detecta link de outra edição pelo ISBN-10 na URL", () => {
    expect(isbn13ToIsbn10("9788575229279")).toBe("8575229273");
    expect(isbn13ToIsbn10("9781449373320")).toBe("1449373321");
    const settings = (url: string) => ({ ...BOOK_AFFILIATES, books: { ...BOOK_AFFILIATES.books, [book.id]: entry(url) } });
    expect(findBookAffiliateIssues(settings("https://www.amazon.com.br/dp/8575229273"), books)).toEqual([]);
    expect(findBookAffiliateIssues(settings("https://www.amazon.com.br/Python-Fluente/dp/1492056359/"), books)).toHaveLength(1);
    expect(() => getBookOffers(books, settings("https://www.amazon.com.br/dp/1492056359"))).toThrow(/inconsistente/);
  });

  it("acusa livro sem configuração e id desconhecido", () => {
    const { [book.id]: _removed, ...rest } = BOOK_AFFILIATES.books;
    expect(findBookAffiliateIssues({ schemaVersion: 1, books: { ...rest, inexistente: entry("") } }, books)).toHaveLength(2);
  });

  it("capa ausente usa o placeholder", () => {
    expect(resolveCover(entry(""), path.join(process.cwd(), "tests"))).toBeNull();
    expect(resolveCover(undefined)).toBeNull();
  });

  it("tags malformadas são ignoradas", () => {
    expect(getAffiliateTag("loja-20")).toBe("loja-20");
    expect(getAffiliateTag("x\" onclick=\"y")).toBeNull();
    expect(getAffiliateTag("a b")).toBeNull();
    expect(getAffiliateTag(undefined)).toBeNull();
  });
});

describe("configuração do AdSense", () => {
  const production = { nodeEnv: "production", vercelEnv: "production" };

  it("desligado por padrão", () => {
    expect(resolveAdsConfig({ ...production, client: VALID_CLIENT }).enabled).toBe(false);
  });

  it("liga só com flag, Publisher ID válido e deploy de produção", () => {
    expect(resolveAdsConfig({ ...production, enabled: "true", client: VALID_CLIENT }).enabled).toBe(true);
    expect(resolveAdsConfig({ ...production, enabled: "true", client: "ca-pub-123" }).enabled).toBe(false);
    expect(resolveAdsConfig({ nodeEnv: "production", vercelEnv: "preview", enabled: "true", client: VALID_CLIENT }).enabled).toBe(false);
    expect(resolveAdsConfig({ nodeEnv: "development", enabled: "true", client: VALID_CLIENT }).enabled).toBe(false);
  });

  it("anúncios automáticos exigem a veiculação ligada", () => {
    expect(resolveAdsConfig({ ...production, enabled: "true", autoAds: "true", client: VALID_CLIENT }).autoAds).toBe(true);
    expect(resolveAdsConfig({ ...production, enabled: "true", client: VALID_CLIENT }).autoAds).toBe(false);
    expect(resolveAdsConfig({ ...production, autoAds: "true", client: VALID_CLIENT }).autoAds).toBe(false);
  });

  it("verificação só precisa do Publisher ID, sem ligar anúncios", () => {
    const config = resolveAdsConfig({ ...production, client: VALID_CLIENT });
    expect(config.client).toBe(VALID_CLIENT);
    expect(config.enabled).toBe(false);
    expect(resolveAdsConfig({ ...production, client: "pub-1234567890123456" }).client).toBeNull();
  });

  it("pré-visualização nunca aparece em produção", () => {
    expect(resolveAdsConfig({ nodeEnv: "development", preview: "true" }).preview).toBe(true);
    expect(resolveAdsConfig({ ...production, preview: "true" }).preview).toBe(false);
  });

  it("rotas sem anúncio", () => {
    for (const path of ["/entrar", "/cadastro", "/conta/perfil", "/privacidade"]) expect(isAdFreeRoute(path)).toBe(true);
    for (const path of ["/", "/noticias/x", "/artigos/y", "/administracao-de-dados"]) expect(isAdFreeRoute(path)).toBe(false);
    expect(isAdFreeRoute("/busca", ["/busca"])).toBe(true);
  });

  it("ads.txt usa o Publisher ID sem o prefixo ca-", () => {
    expect(buildAdsTxt(VALID_CLIENT)).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
    expect(buildAdsTxt(null)).toBeNull();
  });
});

describe("posições de anúncio (content/settings/ads.json)", () => {
  const placement = (id: string, page: string, priority: number, slot: string | null = "1234567890") => ({
    id,
    name: id,
    page,
    slot,
    active: true,
    format: "auto",
    priority,
    devices: ["mobile", "desktop"],
  });
  const settings = parseAdsSettings({
    schemaVersion: 1,
    maxManualPerPage: 1,
    maxManualPerPageWithAutoAds: 0,
    autoAdsExcludedPaths: [],
    placements: [placement("news-list", "home", 2), placement("home-mid", "home", 1), placement("books-mid", "books", 1, null)],
  });

  it("arquivo do repositório é válido e não traz IDs de bloco inventados", () => {
    expect(ADS_SETTINGS.placements.length).toBeGreaterThan(0);
    for (const p of ADS_SETTINGS.placements) expect(p.slot, p.id).toBeNull();
  });

  it("arquivo no formato estável (diffs pequenos quando o painel gravar)", async () => {
    const raw = await readFile(path.join(process.cwd(), "content/settings/ads.json"), "utf8");
    expect(raw).toBe(`${JSON.stringify(parseAdsSettings(JSON.parse(raw)), null, 2)}
`);
  });

  it("limite por página respeita a prioridade", () => {
    expect(selectPagePlacements(settings, "home", false).map((p) => p.id)).toEqual(["home-mid"]);
    expect(resolvePlacement("news-list", settings, false)).toBeNull();
  });

  it("com anúncios automáticos, o limite de posições manuais é menor", () => {
    expect(resolvePlacement("home-mid", settings, true)).toBeNull();
  });

  it("posição sem slot ou inativa não é veiculada", () => {
    expect(resolvePlacement("books-mid", settings, false)).toBeNull();
    const inactive = parseAdsSettings({ ...settings, placements: [{ ...placement("home-mid", "home", 1), active: false }] });
    expect(resolvePlacement("home-mid", inactive, false)).toBeNull();
  });

  it("rejeita slot não numérico, IDs repetidos e campos desconhecidos", () => {
    const base = { ...settings, placements: [] };
    expect(() => parseAdsSettings({ ...base, placements: [placement("home-mid", "home", 1, "<x>")] })).toThrow();
    expect(() => parseAdsSettings({ ...base, placements: [placement("home-mid", "home", 1), placement("home-mid", "home", 2)] })).toThrow();
    expect(() => parseAdsSettings({ ...base, placements: [{ ...placement("home-mid", "home", 1), extra: true }] })).toThrow();
  });
});

describe("anúncio no meio do artigo", () => {
  const p = (n: number) => Array.from({ length: n }, (_, i) => `parágrafo ${i}`);

  it("textos curtos não recebem anúncio", () => {
    expect(findInlineSlotIndex(["## A", ...p(3)])).toBeNull();
  });

  it("entra antes do subtítulo mais próximo do meio, nunca no início", () => {
    const content = ["## Início", ...p(3), "## Meio", ...p(3), "## Fim", ...p(2)];
    expect(content[findInlineSlotIndex(content)!]).toBe("## Meio");
  });
});

describe("categorias de notícias", () => {
  it("cada categoria tem slug único e descrição", () => {
    expect(NEWS_CATEGORY_INFO).toHaveLength(NEWS_CATEGORIES.length);
    expect(new Set(NEWS_CATEGORY_INFO.map((c) => c.slug)).size).toBe(NEWS_CATEGORY_INFO.length);
    for (const info of NEWS_CATEGORY_INFO) expect(info.description.length).toBeGreaterThan(10);
  });
});

describe("autenticação desligada por padrão", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("chaves do Supabase sozinhas não ativam login", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://exemplo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "chave");
    vi.stubEnv("NEXT_PUBLIC_AUTH_ENABLED", "");
    expect(isAuthEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_AUTH_ENABLED", "true");
    expect(isAuthEnabled()).toBe(true);
  });
});
