import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { contentFilePath, parseContentFilePath } from "@/lib/content/paths";
import { COLLECTIONS, COLLECTION_NAMES, envelopeSchema, newsSchema } from "@/lib/content/schemas";
import { ContentValidationError, findContentIntegrityIssues, loadPublishedContent, readCollection } from "@/lib/content/store";

const content = await loadPublishedContent();

describe("acervo em content/*.json", () => {
  it("todas as coleções têm conteúdo publicado", () => {
    for (const name of COLLECTION_NAMES) {
      const key = name as Exclude<keyof typeof content, "roadmapProjectAreas">;
      expect(content[key].length, name).toBeGreaterThan(0);
    }
  });

  it("não tem referências quebradas nem slugs duplicados", () => {
    expect(findContentIntegrityIssues(content)).toEqual([]);
  });

  it("cada arquivo está num caminho permitido e no formato canônico", async () => {
    for (const name of COLLECTION_NAMES) {
      const dir = path.join(process.cwd(), "content", name);
      for (const file of await readdir(dir)) {
        const relative = `content/${name}/${file}`;
        expect(parseContentFilePath(relative), relative).not.toBeNull();
        const raw = await readFile(path.join(dir, file), "utf8");
        // Formato estável (ordem do schema, 2 espaços, \n final) = diffs pequenos
        // e revisáveis a cada edição.
        const canonical = envelopeSchema(COLLECTIONS[name].schema).parse(JSON.parse(raw));
        expect(raw, relative).toBe(`${JSON.stringify(canonical, null, 2)}\n`);
      }
    }
  });

  it("nenhuma pasta fora das coleções registradas (além das configurações do site e de afiliados)", async () => {
    const allowed = [...COLLECTION_NAMES, "settings", "afiliados"];
    expect((await readdir(path.join(process.cwd(), "content"))).sort()).toEqual(allowed.sort());
  });
});

describe("schemas", () => {
  const base = content.news[0]!;

  it("bloqueiam URL com protocolo perigoso", () => {
    for (const sourceUrl of ["javascript:alert(1)", "data:text/html,<b>x</b>", "ftp://example.com/x", "notaurl"]) {
      expect(newsSchema.safeParse({ ...base, sourceUrl }).success, sourceUrl).toBe(false);
    }
  });

  it("bloqueiam marcação HTML em texto puro", () => {
    expect(newsSchema.safeParse({ ...base, title: "<script>alert(1)</script>" }).success).toBe(false);
    expect(newsSchema.safeParse({ ...base, summary: 'Texto <img src=x onerror="alert(1)">' }).success).toBe(false);
    // Comparação matemática não é marcação.
    expect(newsSchema.safeParse({ ...base, summary: "Custo caiu para < 1 dólar." }).success).toBe(true);
  });

  it("rejeitam campo desconhecido, slug inválido e data fora do padrão", () => {
    expect(newsSchema.safeParse({ ...base, extra: true }).success).toBe(false);
    expect(newsSchema.safeParse({ ...base, slug: "Slug Ruim" }).success).toBe(false);
    expect(newsSchema.safeParse({ ...base, publishedAt: "30/11/2022" }).success).toBe(false);
  });

  it("envelope exige versão e status conhecidos", () => {
    const schema = envelopeSchema(COLLECTIONS.news.schema);
    const envelope = { schemaVersion: 1, status: "published", sortOrder: 10, data: base };
    expect(schema.safeParse(envelope).success).toBe(true);
    expect(schema.safeParse({ ...envelope, schemaVersion: 2 }).success).toBe(false);
    for (const status of ["draft", "review", "archived"]) expect(schema.safeParse({ ...envelope, status }).success).toBe(true);
    expect(schema.safeParse({ ...envelope, status: "scheduled" }).success).toBe(false);
  });
});

describe("caminhos permitidos", () => {
  it("monta o caminho de um item", () => {
    expect(contentFilePath("news", "openai-lanca-chatgpt")).toBe("content/news/openai-lanca-chatgpt.json");
  });

  it("recusa ids e coleções fora do padrão", () => {
    for (const id of ["../etc/passwd", "a/b", "a\\b", "", "UPPER", "x.json"]) {
      expect(() => contentFilePath("news", id), id).toThrow();
    }
    expect(() => contentFilePath("users" as never, "x")).toThrow();
  });

  it("recusa caminhos fora de content/<coleção>/<slug>.json", () => {
    for (const p of [
      "content/news/../../package.json",
      "content/news/x.ts",
      "content/users/x.json",
      "content/news/sub/x.json",
      "/content/news/x.json",
      "content\\news\\x.json",
      "app/page.tsx",
      "content/constructor/x.json",
    ]) {
      expect(parseContentFilePath(p), p).toBeNull();
    }
    expect(parseContentFilePath("content/news/x.json")).toEqual({ collection: "news", id: "x" });
  });
});

describe("leitura de coleção", () => {
  let root: string;
  const newsDir = () => path.join(root, "content", "news");
  const write = (file: string, value: unknown) =>
    writeFile(path.join(newsDir(), file), typeof value === "string" ? value : JSON.stringify(value));
  const envelope = (data: object, status = "published", sortOrder = 10) => ({ schemaVersion: 1, status, sortOrder, data });

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "dc-content-"));
    await mkdir(newsDir(), { recursive: true });
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  it("ordena por sortOrder e mantém arquivados fora do publicado", async () => {
    const base = content.news[0]!;
    await write("b.json", envelope({ ...base, id: "b", slug: "b" }, "published", 20));
    await write("a.json", envelope({ ...base, id: "a", slug: "a" }, "archived", 10));
    await write("c.json", envelope({ ...base, id: "c", slug: "c" }, "published", 5));
    const items = await readCollection("news", root);
    expect(items.map((item) => [item.data.id, item.status])).toEqual([
      ["c", "published"],
      ["a", "archived"],
      ["b", "published"],
    ]);
  });

  it("falha com erro explícito para JSON inválido, schema inválido e id diferente do arquivo", async () => {
    const base = content.news[0]!;
    await write("quebrado.json", "{ nao é json");
    await write("invalido.json", envelope({ ...base, id: "invalido", slug: "invalido", sourceUrl: "javascript:x" }));
    await write("outro-nome.json", envelope({ ...base, id: "nome-real", slug: "nome-real" }));
    const error = await readCollection("news", root).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentValidationError);
    const issues = (error as ContentValidationError).issues.join("\n");
    expect(issues).toContain("quebrado.json: JSON inválido");
    expect(issues).toContain("invalido.json: data.sourceUrl");
    expect(issues).toContain("outro-nome.json: o id");
  });
});
