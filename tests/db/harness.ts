import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const ROOT = path.resolve(__dirname, "../..");
const MIGRATIONS_DIR = path.join(ROOT, "supabase/migrations");

export type AppRole = "user" | "moderator" | "editor" | "admin" | "superadmin";

export interface TestDb {
  db: PGlite;
  /** Cria um usuário no auth.users (dispara o gatilho de cadastro). */
  createUser(email: string, metadata?: Record<string, unknown>): Promise<string>;
  /** Define o papel diretamente, como o dono do banco faria no bootstrap. */
  setRoleAsOwner(userId: string, role: AppRole): Promise<void>;
  /** Executa como visitante anônimo (role `anon`). */
  asAnon<T>(fn: (db: PGlite) => Promise<T>): Promise<T>;
  /** Executa como usuário autenticado (role `authenticated` + JWT sub). */
  asUser<T>(userId: string, fn: (db: PGlite) => Promise<T>): Promise<T>;
}

export async function applyMigrations(db: PGlite): Promise<void> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(MIGRATIONS_DIR, file), "utf8"));
  }
}

interface CreateTestDbOptions {
  /** Executado entre o stub e as migrações (ex.: usuários que já existiam no Auth). */
  beforeMigrations?: (db: PGlite) => Promise<unknown>;
}

export async function createTestDb(options: CreateTestDbOptions = {}): Promise<TestDb> {
  const db = new PGlite();
  await db.exec(await readFile(path.join(__dirname, "supabase-stub.sql"), "utf8"));
  await options.beforeMigrations?.(db);
  await applyMigrations(db);

  async function runAs<T>(role: "anon" | "authenticated", sub: string | null, fn: (db: PGlite) => Promise<T>) {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [sub ?? ""]);
    await db.exec(`set role ${role}`);
    try {
      return await fn(db);
    } finally {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', '', false)");
    }
  }

  return {
    db,
    async createUser(email, metadata = {}) {
      const result = await db.query<{ id: string }>(
        "insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id",
        [email, JSON.stringify(metadata)],
      );
      return result.rows[0]!.id;
    },
    async setRoleAsOwner(userId, role) {
      await db.query("update public.user_roles set role = $2 where user_id = $1", [userId, role]);
    },
    asAnon: (fn) => runAs("anon", null, fn),
    asUser: (userId, fn) => runAs("authenticated", userId, fn),
  };
}

/** Espera que a promessa falhe; devolve a mensagem para asserções. */
export async function expectDbError(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("Era esperado um erro do banco, mas a operação foi aceita.");
}
