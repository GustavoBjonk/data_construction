/**
 * Gera `supabase/seed.sql` a partir dos arquivos JSON de `content/`.
 *
 * Uso: npm run db:seed:generate
 *
 * O seed é idempotente e não destrutivo: cada INSERT usa
 * `ON CONFLICT (id) DO NOTHING`, então rodá-lo de novo nunca sobrescreve
 * edições feitas no banco. Ids e slugs atuais são preservados.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPublishedContent } from "../lib/content/store.ts";

const {
  articles,
  courses,
  datasets,
  organizations,
  news,
  projects,
  roadmaps,
  roadmapProjectAreas: ROADMAP_PROJECT_AREAS,
} = await loadPublishedContent(path.resolve(import.meta.dirname, ".."));

type SqlValue = string | number | boolean | null | undefined | SqlRaw;

/** Trecho SQL já montado (arrays, jsonb, casts) que não deve ser escapado de novo. */
class SqlRaw {
  readonly sql: string;
  constructor(sql: string) {
    this.sql = sql;
  }
}

function text(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function literal(value: SqlValue): string {
  if (value === null || value === undefined) return "null";
  if (value instanceof SqlRaw) return value.sql;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Número inválido: ${value}`);
    return String(value);
  }
  return text(value);
}

const textArray = (values: readonly string[]) =>
  new SqlRaw(values.length === 0 ? "'{}'::text[]" : `array[${values.map(text).join(", ")}]::text[]`);
const jsonb = (value: unknown) => new SqlRaw(`${text(JSON.stringify(value))}::jsonb`);
const date = (value: string | undefined) => (value ? new SqlRaw(`${text(value)}::date`) : null);

function insert(table: string, rows: Record<string, SqlValue>[], conflictKey = "id"): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]!);
  const values = rows.map((row) => `  (${columns.map((column) => literal(row[column])).join(", ")})`).join(",\n");
  return `insert into public.${table} (${columns.join(", ")})\nvalues\n${values}\non conflict (${conflictKey}) do nothing;\n`;
}

const PUBLISHED = "published";

function build(): string {
  const parts: string[] = [
    "-- Gerado por scripts/generate-seed.mts a partir de data/*.ts. Não edite à mão.",
    "-- Idempotente: ON CONFLICT DO NOTHING preserva qualquer edição já feita no banco.",
    "begin;",
    "",
  ];

  parts.push(
    insert(
      "articles",
      articles.map((a) => ({
        id: a.id,
        slug: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        body: textArray(a.content),
        citations: jsonb(a.references),
        author_name: a.author,
        author_bio: a.authorBio,
        reading_time_minutes: a.readingTime,
        published_on: date(a.date),
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "news",
      news.map((n) => ({
        id: n.id,
        slug: n.slug,
        title: n.title,
        summary: n.summary,
        relevance: n.relevance,
        published_on: date(n.publishedAt),
        // Só a aprovação editorial vira verified_on; a última conferência técnica
        // (lastCheckedAt) não tem coluna no banco e fica registrada na nota.
        verified_on: n.verifiedAt ? date(n.verifiedAt) : null,
        verification: n.verification ?? "unverified",
        verification_notes: n.lastCheckedAt
          ? `Importada de content/news. Última conferência da fonte: ${n.lastCheckedAt}.`
          : "Importada de content/news.",
        categories: textArray(n.category),
        tags: textArray(n.tags),
        source_name: n.source,
        source_url: n.sourceUrl,
        image_url: n.imageUrl,
        featured: n.featured ?? false,
        related: jsonb(n.related ?? {}),
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "datasets",
      datasets.map((d, index) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        difficulty: d.difficulty,
        size_label: d.size,
        format: d.format,
        topics: textArray(d.topics),
        technologies: textArray(d.technologies),
        ideal_for: textArray(d.idealFor),
        source_name: d.source,
        source_url: d.sourceUrl,
        sort_order: index,
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "courses",
      courses.map((c, index) => ({
        id: c.id,
        title: c.title,
        platform: c.platform,
        area: c.area,
        course_type: c.type,
        price: c.price,
        currency: c.currency,
        price_checked_on: date(c.priceCheckedAt),
        duration: c.duration,
        level: c.level,
        description: c.description,
        skills: textArray(c.skills),
        url: c.url,
        sort_order: index,
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "roadmaps",
      roadmaps.map((r, index) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        level: r.level,
        estimated_duration: r.estimatedDuration,
        project_area: ROADMAP_PROJECT_AREAS[r.slug] ?? null,
        sort_order: index,
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "roadmap_steps",
      roadmaps.flatMap((r) =>
        r.steps.map((s) => ({
          id: s.id,
          roadmap_id: r.id,
          position: s.order,
          title: s.title,
          description: s.description,
          topics: textArray(s.topics),
          technologies: textArray(s.technologies),
        })),
      ),
    ),
  );

  parts.push(
    insert(
      "roadmap_step_courses",
      roadmaps.flatMap((r) =>
        r.steps.flatMap((s) => s.courseIds.map((courseId, index) => ({ step_id: s.id, course_id: courseId, position: index }))),
      ),
      "step_id, course_id",
    ),
  );

  parts.push(
    insert(
      "projects",
      projects.map((p, index) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        area: p.area,
        difficulty: p.difficulty,
        technologies: textArray(p.technologies),
        skills: textArray(p.skills),
        estimated_time: p.estimatedTime,
        objective: p.objective,
        sort_order: index,
        status: PUBLISHED,
      })),
    ),
  );

  parts.push(
    insert(
      "organizations",
      organizations.map((o, index) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        category: o.category,
        official_site_url: o.officialSiteUrl,
        donation_url: o.donationUrl,
        sort_order: index,
        status: PUBLISHED,
      })),
    ),
  );

  parts.push("commit;", "");
  return parts.join("\n");
}

export const SEED_PATH = path.resolve(import.meta.dirname, "../supabase/seed.sql");
export const buildSeed = build;

// Executado diretamente (não quando importado pelos testes).
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  await writeFile(SEED_PATH, build(), "utf8");
  console.log(`Seed gerado em ${path.relative(process.cwd(), SEED_PATH)}`);
}
