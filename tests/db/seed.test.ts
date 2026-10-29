import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import { loadPublishedContent } from "@/lib/content/store";
import { SEED_PATH, buildSeed } from "../../scripts/generate-seed.mts";
import { createTestDb, type TestDb } from "./harness";

const { articles, courses, datasets, organizations, news, projects, roadmaps } = await loadPublishedContent();

let t: TestDb;
let seedSql: string;

async function count(table: string): Promise<number> {
  const result = await t.db.query<{ n: number }>(`select count(*)::int as n from public.${table}`);
  return result.rows[0]!.n;
}

beforeAll(async () => {
  t = await createTestDb();
  seedSql = await readFile(SEED_PATH, "utf8");
  await t.db.exec(seedSql);
});

describe("seed do conteúdo atual", () => {
  it("o arquivo versionado está atualizado com content/*.json", () => {
    expect(seedSql).toBe(buildSeed());
  });

  it("importa todos os itens, sem perdas", async () => {
    expect(await count("articles")).toBe(articles.length);
    expect(await count("news")).toBe(news.length);
    expect(await count("datasets")).toBe(datasets.length);
    expect(await count("courses")).toBe(courses.length);
    expect(await count("roadmaps")).toBe(roadmaps.length);
    expect(await count("roadmap_steps")).toBe(roadmaps.reduce((n, r) => n + r.steps.length, 0));
    expect(await count("roadmap_step_courses")).toBe(
      roadmaps.reduce((n, r) => n + r.steps.reduce((m, s) => m + s.courseIds.length, 0), 0),
    );
    expect(await count("projects")).toBe(projects.length);
    expect(await count("organizations")).toBe(organizations.length);
  });

  it("preserva ids e slugs (URLs atuais)", async () => {
    const newsSlugs = await t.db.query<{ slug: string }>("select slug from public.news order by slug");
    expect(newsSlugs.rows.map((r) => r.slug)).toEqual(news.map((n) => n.slug).sort());
    const articleIds = await t.db.query<{ id: string }>("select id from public.articles order by id");
    expect(articleIds.rows.map((r) => r.id)).toEqual(articles.map((a) => a.id).sort());
    const roadmapSlugs = await t.db.query<{ slug: string }>("select slug from public.roadmaps order by slug");
    expect(roadmapSlugs.rows.map((r) => r.slug)).toEqual(roadmaps.map((r) => r.slug).sort());
  });

  it("preserva o corpo dos artigos byte a byte", async () => {
    for (const article of articles) {
      const row = await t.db.query<{ body: string[]; citations: unknown }>(
        "select body, citations from public.articles where id = $1",
        [article.id],
      );
      expect(row.rows[0]?.body).toEqual(article.content);
      expect(row.rows[0]?.citations).toEqual(article.references);
    }
  });

  it("tudo importado fica visível ao público", async () => {
    const visible = await t.asAnon((db) => db.query<{ n: number }>("select count(*)::int as n from public.news"));
    expect(visible.rows[0]?.n).toBe(news.length);
  });

  it("verified_on só existe em notícia aprovada; a última conferência fica na nota", async () => {
    const rows = await t.db.query<{ verification: string; with_date: number; n: number }>(
      "select verification, count(verified_on)::int as with_date, count(*)::int as n from public.news group by verification",
    );
    const approved = news.filter((item) => item.verification === "verified").length;
    expect(rows.rows).toEqual(
      expect.arrayContaining([{ verification: "unverified", with_date: 0, n: news.length - approved }]),
    );
    const notes = await t.db.query<{ n: number }>(
      "select count(*)::int as n from public.news where verification_notes like '%Última conferência da fonte%'",
    );
    expect(notes.rows[0]?.n).toBe(news.filter((item) => item.lastCheckedAt).length);
  });

  it("é idempotente e não sobrescreve edições", async () => {
    await t.db.exec("update public.articles set title = 'Editado no painel' where id = 'window-functions-sql'");
    await t.db.exec(seedSql);
    expect(await count("articles")).toBe(articles.length);
    const title = await t.db.query<{ title: string }>("select title from public.articles where id = 'window-functions-sql'");
    expect(title.rows[0]?.title).toBe("Editado no painel");
  });
});
