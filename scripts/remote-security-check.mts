/**
 * Verificação de segurança no projeto Supabase REAL (após aplicar migrações).
 *
 * Uso — somente com autorização: npm run db:check:remote -- --confirm-remote
 *
 * O que faz:
 *   1. Cria 4 contas temporárias já confirmadas (user, editor, admin e uma com
 *      metadado malicioso) via Admin API — nenhum e-mail é enviado.
 *   2. Exercita leitura/escrita/RPC pela API pública com cada sessão.
 *   3. Remove TUDO o que criou (contas e artigo de teste), mesmo se algo falhar.
 *
 * Requer no .env.local (ou no terminal):
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY e
 *   SUPABASE_SERVICE_ROLE_KEY (somente local; nunca no front-end ou no Git).
 */
import { randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (!process.argv.includes("--confirm-remote")) {
  console.error("Este script altera o projeto remoto (cria e remove contas de teste).");
  console.error("Execute apenas com autorização: npm run db:check:remote -- --confirm-remote");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publishableKey || !serviceKey) {
  console.error("Faltam variáveis: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } } as const;
const admin = createClient(url, serviceKey, NO_SESSION);
const anon = createClient(url, publishableKey, NO_SESSION);

const runId = randomBytes(4).toString("hex");
const password = `Dc-${randomBytes(12).toString("base64url")}1`;
const TEST_ARTICLE_ID = `teste-seguranca-${runId}`;
const createdUserIds: string[] = [];
const results: { name: string; ok: boolean; detail?: string }[] = [];

async function check(name: string, fn: () => Promise<boolean | string>) {
  try {
    const outcome = await fn();
    results.push({ name, ok: outcome === true, detail: typeof outcome === "string" ? outcome : undefined });
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

async function createUser(label: string, metadata: Record<string, unknown> = {}): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: `dc-check-${runId}-${label}@example.com`,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Teste ${label}`, ...metadata },
  });
  if (error || !data.user) throw new Error(`createUser(${label}): ${error?.message}`);
  createdUserIds.push(data.user.id);
  return data.user.id;
}

async function signIn(label: string): Promise<SupabaseClient> {
  const client = createClient(url!, publishableKey!, NO_SESSION);
  const { error } = await client.auth.signInWithPassword({ email: `dc-check-${runId}-${label}@example.com`, password });
  if (error) throw new Error(`signIn(${label}): ${error.message}`);
  return client;
}

async function roleOf(userId: string): Promise<string | undefined> {
  const { data } = await admin.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  return data?.role as string | undefined;
}

try {
  const userId = await createUser("user");
  const editorId = await createUser("editor");
  const adminId = await createUser("admin");
  const sneakyId = await createUser("sneaky", { role: "superadmin", app_role: "admin" });

  // Papéis definidos pela service role (equivalente ao bootstrap manual).
  for (const [id, role] of [
    [editorId, "editor"],
    [adminId, "admin"],
  ] as const) {
    const { error } = await admin.from("user_roles").update({ role }).eq("user_id", id);
    if (error) throw new Error(`definir papel ${role}: ${error.message}`);
  }

  const user = await signIn("user");
  const editor = await signIn("editor");
  const adminUser = await signIn("admin");

  // --- Cadastro ---
  await check("cadastro cria papel 'user'", async () => (await roleOf(userId)) === "user");
  await check("metadado 'role' no cadastro é ignorado", async () => (await roleOf(sneakyId)) === "user");

  // --- Visitante ---
  await check("visitante não lê user_roles", async () => {
    const { data, error } = await anon.from("user_roles").select("user_id").limit(1);
    return Boolean(error) || data?.length === 0;
  });
  await check("visitante não lê audit_log", async () => {
    const { data, error } = await anon.from("audit_log").select("id").limit(1);
    return Boolean(error) || data?.length === 0;
  });
  await check("visitante não cria artigo", async () => {
    const { error } = await anon.from("articles").insert({
      id: `${TEST_ARTICLE_ID}-anon`, slug: `${TEST_ARTICLE_ID}-anon`, title: "x", category: "x", author_name: "x", reading_time_minutes: 1,
    });
    return Boolean(error);
  });
  await check("visitante não executa set_user_role", async () => {
    const { error } = await anon.rpc("set_user_role", { target_user: userId, new_role: "admin" });
    return Boolean(error);
  });
  await check("visitante lê as 97 notícias publicadas", async () => {
    const { count, error } = await anon.from("news").select("id", { count: "exact", head: true });
    return !error && count === 97 ? true : `count=${count} ${error?.message ?? ""}`;
  });

  // --- Usuário comum ---
  await check("usuário não altera o próprio papel (UPDATE)", async () => {
    await user.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
    return (await roleOf(userId)) === "user";
  });
  await check("usuário não usa set_user_role", async () => {
    const { error } = await user.rpc("set_user_role", { target_user: userId, new_role: "admin" });
    return Boolean(error) && (await roleOf(userId)) === "user";
  });
  await check("usuário não edita perfil alheio", async () => {
    await user.from("profiles").update({ bio: "invadido" }).eq("id", editorId);
    const { data } = await admin.from("profiles").select("bio").eq("id", editorId).single();
    return data?.bio !== "invadido";
  });
  await check("usuário edita o próprio perfil", async () => {
    const { error } = await user.from("profiles").update({ bio: "ok" }).eq("id", userId);
    return !error;
  });
  await check("usuário vê apenas o próprio papel", async () => {
    const { data } = await user.from("user_roles").select("user_id");
    return data?.length === 1 && data[0]?.user_id === userId;
  });

  // --- Editor ---
  await check("editor cria rascunho", async () => {
    const { error } = await editor.from("articles").insert({
      id: TEST_ARTICLE_ID, slug: TEST_ARTICLE_ID, title: "Teste de segurança", category: "SQL", author_name: "Teste", reading_time_minutes: 1,
    });
    return error ? error.message : true;
  });
  await check("rascunho invisível ao público", async () => {
    const { data } = await anon.from("articles").select("id").eq("id", TEST_ARTICLE_ID);
    return data?.length === 0;
  });
  await check("editor não exclui conteúdo", async () => {
    await editor.from("articles").delete().eq("id", TEST_ARTICLE_ID);
    const { data } = await admin.from("articles").select("id").eq("id", TEST_ARTICLE_ID);
    return data?.length === 1;
  });
  await check("editor não lê audit_log", async () => {
    const { data } = await editor.from("audit_log").select("id").limit(1);
    return data?.length === 0;
  });

  // --- Admin ---
  await check("admin promove usuário a editor", async () => {
    const { error } = await adminUser.rpc("set_user_role", { target_user: userId, new_role: "editor" });
    return !error && (await roleOf(userId)) === "editor";
  });
  await check("admin não concede papel admin", async () => {
    const { error } = await adminUser.rpc("set_user_role", { target_user: userId, new_role: "admin" });
    return Boolean(error) && (await roleOf(userId)) === "editor";
  });
  await check("admin não altera o próprio papel", async () => {
    const { error } = await adminUser.rpc("set_user_role", { target_user: adminId, new_role: "superadmin" });
    return Boolean(error) && (await roleOf(adminId)) === "admin";
  });
  await check("alteração de papel registrada na auditoria", async () => {
    const { data } = await adminUser.from("audit_log").select("actor_id").eq("action", "user.role_changed").eq("entity_id", userId);
    return (data ?? []).some((row) => row.actor_id === adminId);
  });
  await check("admin exclui conteúdo", async () => {
    const { error } = await adminUser.from("articles").delete().eq("id", TEST_ARTICLE_ID);
    return !error;
  });
} catch (error) {
  results.push({ name: "preparação", ok: false, detail: error instanceof Error ? error.message : String(error) });
} finally {
  // Limpeza: sempre executada.
  await admin.from("articles").delete().like("id", `${TEST_ARTICLE_ID}%`);
  for (const id of createdUserIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error(`ATENÇÃO: remova manualmente o usuário de teste ${id}: ${error.message}`);
  }
}

for (const r of results) console.log(`${r.ok ? "PASSOU" : "FALHOU"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} verificações passaram. Contas de teste removidas: ${createdUserIds.length}.`);
process.exitCode = failed > 0 ? 1 : 0;
