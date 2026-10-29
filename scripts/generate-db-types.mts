/**
 * Gera lib/supabase/database.types.ts a partir do schema real do projeto.
 *
 * Uso (depois de aplicar as migrações): npm run db:types
 *
 * Requisitos:
 *   - NEXT_PUBLIC_SUPABASE_URL no .env.local (o project ref é extraído dela);
 *   - SUPABASE_ACCESS_TOKEN (Account → Access Tokens no painel do Supabase),
 *     definido só no terminal ou no .env.local — nunca com prefixo NEXT_PUBLIC_.
 *
 * Somente leitura: consulta o schema; não altera o banco.
 */
import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_CLI = "supabase@2.122.0";
const OUTPUT = path.resolve(import.meta.dirname, "../lib/supabase/database.types.ts");

function projectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = url ? new URL(url).hostname.split(".")[0] : undefined;
  if (!ref) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL (ex.: https://<ref>.supabase.co) no .env.local.");
  return ref;
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error("Defina SUPABASE_ACCESS_TOKEN (painel do Supabase → Account → Access Tokens).");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["--yes", SUPABASE_CLI, "gen", "types", "typescript", "--project-id", projectRef(), "--schema", "public"],
  { encoding: "utf8", shell: process.platform === "win32", env: process.env, maxBuffer: 20 * 1024 * 1024 },
);

if (result.status !== 0 || !result.stdout.includes("export type Database")) {
  console.error(result.stderr || "A geração de tipos falhou.");
  process.exit(1);
}

const header = "// Gerado por `npm run db:types` (supabase gen types). Não edite à mão.\n\n";
await writeFile(OUTPUT, header + result.stdout, "utf8");
console.log(`Tipos gerados em ${path.relative(process.cwd(), OUTPUT)}. Rode npm run typecheck.`);
