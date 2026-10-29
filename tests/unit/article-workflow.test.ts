import { describe, expect, it } from "vitest";
import { approveArticle, articleReviewQueue, ArticleWorkflowError, moveArticle } from "@/lib/content/article-workflow";
import { readCollection } from "@/lib/content/store";

const stored = await readCollection("articles");
const inReview = stored.find((item) => item.status === "review")!;
const { path: _path, ...envelope } = inReview;

describe("fluxo editorial dos artigos", () => {
  it("acervo: 4 publicados preservados e 8 em revisão", () => {
    expect(stored.filter((item) => item.status === "published")).toHaveLength(4);
    expect(articleReviewQueue(stored)).toHaveLength(8);
  });

  it("artigos em revisão não usam a assinatura pessoal dos artigos publicados", () => {
    const personal = new Set(stored.filter((item) => item.status === "published").map((item) => item.data.author));
    for (const { data } of articleReviewQueue(stored)) expect(personal.has(data.author), data.id).toBe(false);
  });

  it("publica só a partir da revisão e grava a data informada", () => {
    const published = approveArticle(envelope, "2026-11-02");
    expect(published.status).toBe("published");
    expect(published.data.date).toBe("2026-11-02");
    expect(() => approveArticle(published, "2026-11-02")).toThrow(ArticleWorkflowError);
    expect(() => approveArticle({ ...envelope, status: "draft" }, "2026-11-02")).toThrow(ArticleWorkflowError);
    expect(() => approveArticle(envelope, "02/11/2026")).toThrow(ArticleWorkflowError);
  });

  it("devolve para correção ou rejeita sem publicar", () => {
    expect(moveArticle(envelope, "draft").status).toBe("draft");
    expect(moveArticle(envelope, "archived").status).toBe("archived");
    expect(() => moveArticle(moveArticle(envelope, "archived"), "review")).toThrow(ArticleWorkflowError);
  });
});
