import { describe, expect, it } from "vitest";
import { auditNews } from "@/lib/content/news-audit";
import { loadPublishedContent } from "@/lib/content/store";

const { news } = await loadPublishedContent();

const TODAY = new Date().toISOString().slice(0, 10);

describe("integridade do acervo de notícias", () => {
  const findings = auditNews(news, TODAY);

  it("não tem erros bloqueantes (URL, datas, duplicidade, marcação)", () => {
    expect(findings.filter((f) => f.severity === "error")).toEqual([]);
  });

  it("todas as fontes usam HTTPS", () => {
    expect(findings.filter((f) => f.code === "insecure_source_url")).toEqual([]);
  });

  it("detecta problemas quando existem (sanidade das regras)", () => {
    const base = news[0]!;
    const bad = [
      { ...base, id: "x1", slug: "Slug Ruim", sourceUrl: "javascript:alert(1)" },
      { ...base, id: "x2", slug: "x2", publishedAt: "2999-01-01", year: 2999, summary: "<script>alert(1)</script>" },
    ];
    const codes = auditNews(bad, TODAY).map((f) => f.code);
    expect(codes).toEqual(expect.arrayContaining(["invalid_slug", "invalid_source_url", "future_date", "markup_in_text"]));
  });
});
