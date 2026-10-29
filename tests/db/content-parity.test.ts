import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import {
  SELECTS,
  articleRow,
  courseRow,
  datasetRow,
  newsRow,
  organizationRow,
  projectRow,
  roadmapRow,
  toArticle,
  toCourse,
  toDataset,
  toNews,
  toOrganization,
  toProject,
  toRoadmap,
} from "@/lib/content/rows";
import { loadPublishedContent } from "@/lib/content/store";
import { SEED_PATH } from "../../scripts/generate-seed.mts";
import { createTestDb, type TestDb } from "./harness";

const {
  articles,
  courses,
  datasets,
  organizations,
  news,
  projects,
  roadmaps,
  roadmapProjectAreas: ROADMAP_PROJECT_AREAS,
} = await loadPublishedContent();

/**
 * Garante que trocar CONTENT_SOURCE para "supabase" não muda nada no site:
 * o caminho banco → Zod → mapeadores reproduz exatamente os dados estáticos.
 * As consultas rodam como visitante anônimo, igual ao cliente público.
 */
let t: TestDb;

/** Serializa via to_jsonb, como o PostgREST faz (datas como texto, numeric como número). */
async function selectAsAnon(table: keyof typeof SELECTS, order: string) {
  const result = await t.asAnon((db) =>
    db.query<{ row: unknown }>(
      `select to_jsonb(x) as row from (select ${SELECTS[table]} from public.${table} order by ${order}) x`,
    ),
  );
  return result.rows.map((r) => r.row);
}

/** Remove chaves com `undefined` (o banco não distingue ausente de vazio). */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

beforeAll(async () => {
  t = await createTestDb();
  await t.db.exec(await readFile(SEED_PATH, "utf8"));
});

describe("paridade banco ↔ data/*.ts", () => {
  it("artigos", async () => {
    const rows = articleRow.array().parse(await selectAsAnon("articles", "published_on desc"));
    expect(clean(rows.map(toArticle)).sort((a, b) => a.id.localeCompare(b.id))).toEqual(
      clean(articles).sort((a, b) => a.id.localeCompare(b.id)),
    );
  });

  it("notícias", async () => {
    const rows = newsRow.array().parse(await selectAsAnon("news", "id"));
    // No banco, a ausência de revisão vira explicitamente "unverified" — mesma exibição no site.
    // collectedAt e lastCheckedAt são controle editorial do acervo e não têm coluna no banco.
    const expected = news.map(({ collectedAt: _collectedAt, lastCheckedAt: _lastCheckedAt, ...n }) => ({
      ...n,
      featured: n.featured ?? false,
      related: n.related ?? {},
      verification: n.verification ?? "unverified",
    }));
    expect(clean(rows.map(toNews))).toEqual(clean(expected).sort((a, b) => a.id.localeCompare(b.id)));
  });

  it("datasets, cursos, projetos e organizações (na ordem original)", async () => {
    expect(clean(datasetRow.array().parse(await selectAsAnon("datasets", "sort_order")).map(toDataset))).toEqual(clean(datasets));
    expect(clean(courseRow.array().parse(await selectAsAnon("courses", "sort_order")).map(toCourse))).toEqual(clean(courses));
    expect(clean(projectRow.array().parse(await selectAsAnon("projects", "sort_order")).map(toProject))).toEqual(clean(projects));
    expect(
      clean(organizationRow.array().parse(await selectAsAnon("organizations", "sort_order")).map(toOrganization)),
    ).toEqual(clean(organizations));
  });

  it("trilhas com etapas e cursos vinculados", async () => {
    // Mesmo formato que o PostgREST devolve para o embed roadmap_steps(roadmap_step_courses(...)).
    const result = await t.asAnon((db) =>
      db.query(`
        select r.id, r.slug, r.title, r.description, r.level, r.estimated_duration, r.project_area,
          coalesce((
            select json_agg(json_build_object(
              'id', s.id, 'position', s.position, 'title', s.title, 'description', s.description,
              'topics', s.topics, 'technologies', s.technologies,
              'roadmap_step_courses', coalesce((
                select json_agg(json_build_object('course_id', c.course_id, 'position', c.position))
                from public.roadmap_step_courses c where c.step_id = s.id), '[]'::json)))
            from public.roadmap_steps s where s.roadmap_id = r.id), '[]'::json) as roadmap_steps
        from public.roadmaps r order by r.sort_order`),
    );
    const rows = roadmapRow.array().parse(result.rows);
    expect(clean(rows.map(toRoadmap))).toEqual(clean(roadmaps));
    expect(Object.fromEntries(rows.map((r) => [r.slug, r.project_area]))).toEqual(ROADMAP_PROJECT_AREAS);
  });
});
