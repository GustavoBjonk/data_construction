import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditNews } from "@/lib/content/news-audit";
import {
  approveNews,
  canTransition,
  findNewsWorkflowIssues,
  moveNews,
  newsReviewQueue,
  NewsWorkflowError,
  unverifiedPublishedNews,
  verifyPublishedNews,
  type NewsEnvelope,
} from "@/lib/content/news-workflow";
import { newsSchema } from "@/lib/content/schemas";
import { loadPublishedContent, readCollection, writeContentItem } from "@/lib/content/store";

const stored = await readCollection("news");
const { news: published } = await loadPublishedContent();
const TODAY = new Date().toISOString().slice(0, 10);

// Amostra do fluxo: uma notícia coletada, devolvida ao estado "em revisão"
// (sem aprovação), para os testes não dependerem de haver fila no acervo real.
const sample = stored.find((item) => item.data.collectedAt !== undefined)!;
const { path: samplePath, ...sampleEnvelope } = sample;
const { verification: _verification, verifiedAt: _verifiedAt, ...pendingData } = sampleEnvelope.data;
const reviewEnvelope: NewsEnvelope = { ...sampleEnvelope, status: "review", data: pendingData };

describe("acervo de notícias e fluxo editorial", () => {
  it("preserva o acervo: 127 notícias publicadas; as 30 coletadas em 2026-10-29 têm aprovação editorial", () => {
    expect(stored).toHaveLength(127);
    expect(published).toHaveLength(127);
    const collected = stored.filter((item) => item.data.collectedAt !== undefined);
    expect(collected).toHaveLength(30);
    for (const { data } of collected) expect(data.verification, data.id).toBe("verified");
  });

  it("artigos em revisão não chegam ao site", async () => {
    const articles = await readCollection("articles");
    const { articles: publicArticles } = await loadPublishedContent();
    expect(articles.length).toBeGreaterThanOrEqual(12);
    const pending = articles.filter((item) => item.status !== "published").map((item) => item.data.id);
    for (const id of pending) expect(publicArticles.some((article) => article.id === id), id).toBe(false);
  });

  it("respeita as regras do fluxo em todos os status", () => {
    expect(findNewsWorkflowIssues(stored)).toEqual([]);
  });

  it("notícias fora de published não chegam ao site (páginas, busca, sitemap e feed leem loadPublishedContent)", async () => {
    const publicIds = new Set(published.map((item) => item.id));
    for (const item of stored.filter((entry) => entry.status !== "published")) expect(publicIds.has(item.data.id)).toBe(false);

    // Acervo copiado com uma notícia devolvida à revisão: ela some do conteúdo público.
    const root = await mkdtemp(path.join(tmpdir(), "dc-public-"));
    try {
      await cp(path.join(process.cwd(), "content"), path.join(root, "content"), { recursive: true });
      await writeContentItem("news", reviewEnvelope, root);
      const { news } = await loadPublishedContent(root);
      expect(news).toHaveLength(published.length - 1);
      expect(news.some((item) => item.id === reviewEnvelope.data.id)).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("itens em revisão também passam pela auditoria de integridade", () => {
    const errors = auditNews(
      stored.map((item) => item.data),
      TODAY,
    ).filter((finding) => finding.severity === "error");
    expect(errors).toEqual([]);
  });

  it("verifiedAt só aparece em notícia aprovada", () => {
    for (const { data } of stored) expect(data.verifiedAt !== undefined).toBe(data.verification === "verified");
  });

  it("monta a fila de revisão da mais recente para a mais antiga", () => {
    const queue = newsReviewQueue(stored);
    expect(queue.every((item) => item.status === "review")).toBe(true);
    const dates = queue.map((item) => item.data.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("transições", () => {
  it("só publica a partir da revisão", () => {
    expect(canTransition("review", "published")).toBe(true);
    expect(canTransition("draft", "published")).toBe(false);
    expect(canTransition("archived", "published")).toBe(false);
  });

  it("aprovar registra a verificação editorial e publica", () => {
    const approved = approveNews(reviewEnvelope, TODAY);
    expect(approved.status).toBe("published");
    expect(approved.data.verification).toBe("verified");
    expect(approved.data.verifiedAt).toBe(TODAY);
    expect(approved.data.collectedAt).toBe(reviewEnvelope.data.collectedAt);
    expect(findNewsWorkflowIssues([{ ...approved, path: samplePath }])).toEqual([]);
  });

  it("recusa aprovar fora da revisão, com data inválida ou anterior à publicação", () => {
    const draft: NewsEnvelope = { ...reviewEnvelope, status: "draft" };
    expect(() => approveNews(draft, TODAY)).toThrow(NewsWorkflowError);
    expect(() => approveNews(reviewEnvelope, "29/10/2026")).toThrow(NewsWorkflowError);
    expect(() => approveNews(reviewEnvelope, "2000-01-01")).toThrow(NewsWorkflowError);
  });

  it("registra a revisão de uma notícia legada sem mudar o status", () => {
    const [legacy] = unverifiedPublishedNews(stored);
    if (!legacy) throw new Error("acervo legado sem notícia pendente de revisão");
    const { path: _legacyPath, ...legacyEnvelope } = legacy;
    const verified = verifyPublishedNews(legacyEnvelope, TODAY);
    expect(verified.status).toBe("published");
    expect(verified.data.verification).toBe("verified");
    expect(verified.data.verifiedAt).toBe(TODAY);
    expect(() => verifyPublishedNews(verified, TODAY)).toThrow(NewsWorkflowError);
    expect(() => verifyPublishedNews(reviewEnvelope, TODAY)).toThrow(NewsWorkflowError);
  });

  it("voltar ao rascunho descarta a aprovação anterior", () => {
    const archived = moveNews(approveNews(reviewEnvelope, TODAY), "archived");
    const draft = moveNews(archived, "draft");
    expect(draft.status).toBe("draft");
    expect(draft.data.verification).toBeUndefined();
    expect(draft.data.verifiedAt).toBeUndefined();
    expect(() => moveNews(draft, "archived")).not.toThrow();
    expect(() => moveNews(reviewEnvelope, "review")).toThrow(NewsWorkflowError);
  });

  it("aponta notícia nova publicada sem aprovação e rascunho marcado como verificado", () => {
    const issues = findNewsWorkflowIssues([
      { ...reviewEnvelope, status: "published", path: "content/news/a.json" },
      {
        ...reviewEnvelope,
        status: "draft",
        data: { ...reviewEnvelope.data, slug: "outro", verification: "verified", verifiedAt: TODAY },
        path: "content/news/b.json",
      },
    ]);
    expect(issues).toHaveLength(2);
  });
});

describe("schema", () => {
  it("rejeita verifiedAt sem verificação registrada, e o inverso", () => {
    const base = reviewEnvelope.data;
    expect(newsSchema.safeParse({ ...base, verifiedAt: TODAY }).success).toBe(false);
    expect(newsSchema.safeParse({ ...base, verification: "verified" }).success).toBe(false);
    expect(newsSchema.safeParse({ ...base, verification: "verified", verifiedAt: TODAY }).success).toBe(true);
  });
});

describe("gravação", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "dc-workflow-"));
    await mkdir(path.join(root, "content", "news"), { recursive: true });
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  it("grava a aprovação no formato canônico e o item passa a ser público", async () => {
    const file = await writeContentItem("news", approveNews(reviewEnvelope, TODAY), root);
    expect(file).toBe(samplePath);
    const raw = await readFile(path.join(root, file), "utf8");
    const [reread] = await readCollection("news", root);
    expect(reread?.status).toBe("published");
    expect(reread?.data.verifiedAt).toBe(TODAY);
    const { path: _rereadPath, ...envelope } = reread!;
    expect(raw).toBe(`${JSON.stringify(envelope, null, 2)}\n`);
  });

  it("não grava item inválido", async () => {
    const invalid: NewsEnvelope = { ...reviewEnvelope, data: { ...reviewEnvelope.data, verifiedAt: TODAY } };
    await expect(writeContentItem("news", invalid, root)).rejects.toThrow();
  });
});
