import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, expectDbError, type TestDb } from "./harness";

let t: TestDb;
const ids = {} as Record<"user" | "other" | "moderator" | "editor" | "admin" | "superadmin" | "superadmin2", string>;

const PUBLIC_TABLES = ["articles", "news", "datasets", "courses", "roadmaps", "projects", "organizations"];

beforeAll(async () => {
  t = await createTestDb();
  for (const key of Object.keys({ user: 0, other: 0, moderator: 0, editor: 0, admin: 0, superadmin: 0, superadmin2: 0 })) {
    ids[key as keyof typeof ids] = await t.createUser(`${key}@teste.local`, { display_name: key });
  }
  await t.setRoleAsOwner(ids.moderator, "moderator");
  await t.setRoleAsOwner(ids.editor, "editor");
  await t.setRoleAsOwner(ids.admin, "admin");
  await t.setRoleAsOwner(ids.superadmin, "superadmin");
  await t.setRoleAsOwner(ids.superadmin2, "superadmin");

  // Conteúdo de referência inserido pelo dono do banco.
  await t.db.exec(`
    insert into public.articles (id, slug, title, category, author_name, reading_time_minutes, status, scheduled_for, published_on)
    values ('publicado', 'publicado', 'Publicado', 'SQL', 'Autor', 5, 'published', null, '2026-01-01'),
           ('rascunho', 'rascunho', 'Rascunho', 'SQL', 'Autor', 5, 'draft', null, null),
           ('agendado-passado', 'agendado-passado', 'Agendado', 'SQL', 'Autor', 5, 'scheduled', now() - interval '1 hour', '2026-01-01'),
           ('agendado-futuro', 'agendado-futuro', 'Futuro', 'SQL', 'Autor', 5, 'scheduled', now() + interval '1 day', '2026-01-01');
    insert into public.roadmaps (id, slug, title, description, level, estimated_duration, status)
    values ('trilha-publica', 'trilha-publica', 'Pública', 'd', 'Iniciante', '1 mês', 'published'),
           ('trilha-oculta', 'trilha-oculta', 'Oculta', 'd', 'Iniciante', '1 mês', 'draft');
    insert into public.roadmap_steps (id, roadmap_id, position, title, description)
    values ('etapa-publica', 'trilha-publica', 1, 'Etapa', 'd'),
           ('etapa-oculta', 'trilha-oculta', 1, 'Etapa', 'd');
  `);
});

/** Ids de artigos visíveis para quem executa `run` (anônimo ou um usuário). */
async function articleIds(run: TestDb["asAnon"]) {
  const result = await run((db) => db.query<{ id: string }>("select id from public.articles order by id"));
  return result.rows.map((row) => row.id);
}

describe("cadastro", () => {
  it("cria perfil e papel 'user' para todo novo usuário", async () => {
    const id = await t.createUser("novo@teste.local", { display_name: "Nova Pessoa" });
    const role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [id]);
    const profile = await t.db.query<{ display_name: string }>("select display_name from public.profiles where id = $1", [id]);
    expect(role.rows[0]?.role).toBe("user");
    expect(profile.rows[0]?.display_name).toBe("Nova Pessoa");
  });

  it("ignora tentativa de definir papel via metadados do cadastro", async () => {
    const id = await t.createUser("esperto@teste.local", { display_name: "x", role: "superadmin", app_role: "admin" });
    const role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [id]);
    expect(role.rows[0]?.role).toBe("user");
  });

  it("não usa parte do e-mail como nome público", async () => {
    const id = await t.createUser("privado.nome@teste.local");
    const profile = await t.db.query<{ display_name: string }>("select display_name from public.profiles where id = $1", [id]);
    expect(profile.rows[0]?.display_name).not.toContain("privado");
  });
});

describe("tabelas privadas", () => {
  it("visitante não lê user_roles nem audit_log", async () => {
    expect(await expectDbError(t.asAnon((db) => db.query("select * from public.user_roles")))).toMatch(/permission denied/);
    expect(await expectDbError(t.asAnon((db) => db.query("select * from public.audit_log")))).toMatch(/permission denied/);
  });

  it("usuário comum vê apenas o próprio papel", async () => {
    const rows = await t.asUser(ids.user, (db) => db.query<{ user_id: string }>("select user_id from public.user_roles"));
    expect(rows.rows.map((r) => r.user_id)).toEqual([ids.user]);
  });

  it("usuário comum, editor e moderador não leem audit_log", async () => {
    for (const who of [ids.user, ids.editor, ids.moderator]) {
      const rows = await t.asUser(who, (db) => db.query("select * from public.audit_log"));
      expect(rows.rows).toHaveLength(0);
    }
  });

  it("schema private não é acessível diretamente por tabelas", async () => {
    const tables = await t.db.query("select table_name from information_schema.tables where table_schema = 'private'");
    expect(tables.rows).toHaveLength(0);
  });

  it("todas as tabelas de public têm RLS ativo", async () => {
    const rows = await t.db.query<{ relname: string }>(
      `select c.relname from pg_class c
       where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and not c.relrowsecurity`,
    );
    expect(rows.rows.map((r) => r.relname)).toEqual([]);
  });
});

describe("escalada de privilégios", () => {
  it("usuário não altera o próprio papel por UPDATE direto", async () => {
    const message = await expectDbError(
      t.asUser(ids.user, (db) => db.query("update public.user_roles set role = 'admin' where user_id = $1", [ids.user])),
    );
    expect(message).toMatch(/permission denied/);
  });

  it("usuário não insere linha de papel", async () => {
    const message = await expectDbError(
      t.asUser(ids.user, (db) => db.query("insert into public.user_roles (user_id, role) values ($1, 'admin')", [ids.other])),
    );
    expect(message).toMatch(/permission denied/);
  });

  it("usuário, moderador e editor não usam set_user_role", async () => {
    for (const who of [ids.user, ids.moderator, ids.editor]) {
      const message = await expectDbError(
        t.asUser(who, (db) => db.query("select public.set_user_role($1, 'admin')", [who === ids.user ? ids.other : ids.user])),
      );
      expect(message).toMatch(/forbidden/);
    }
  });

  it("visitante não executa set_user_role", async () => {
    const message = await expectDbError(t.asAnon((db) => db.query("select public.set_user_role($1, 'admin')", [ids.user])));
    expect(message).toMatch(/permission denied/);
  });

  it("ninguém altera o próprio papel, nem superadmin", async () => {
    const message = await expectDbError(
      t.asUser(ids.admin, (db) => db.query("select public.set_user_role($1, 'superadmin')", [ids.admin])),
    );
    expect(message).toMatch(/cannot_change_own_role/);
    const message2 = await expectDbError(
      t.asUser(ids.superadmin, (db) => db.query("select public.set_user_role($1, 'user')", [ids.superadmin])),
    );
    expect(message2).toMatch(/cannot_change_own_role/);
  });

  it("admin concede editor/moderador, mas não admin", async () => {
    await t.asUser(ids.admin, (db) => db.query("select public.set_user_role($1, 'editor')", [ids.other]));
    let role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [ids.other]);
    expect(role.rows[0]?.role).toBe("editor");

    const message = await expectDbError(
      t.asUser(ids.admin, (db) => db.query("select public.set_user_role($1, 'admin')", [ids.other])),
    );
    expect(message).toMatch(/forbidden/);

    await t.asUser(ids.admin, (db) => db.query("select public.set_user_role($1, 'user')", [ids.other]));
    role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [ids.other]);
    expect(role.rows[0]?.role).toBe("user");
  });

  it("admin não rebaixa outro superadmin", async () => {
    const message = await expectDbError(
      t.asUser(ids.admin, (db) => db.query("select public.set_user_role($1, 'user')", [ids.superadmin])),
    );
    expect(message).toMatch(/forbidden/);
  });

  it("superadmin concede admin e a alteração fica auditada", async () => {
    await t.asUser(ids.superadmin, (db) => db.query("select public.set_user_role($1, 'admin')", [ids.other]));
    const log = await t.db.query<{ actor_id: string; details: { from: string; to: string } }>(
      "select actor_id, details from public.audit_log where action = 'user.role_changed' and entity_id = $1 order by id desc limit 1",
      [ids.other],
    );
    expect(log.rows[0]?.actor_id).toBe(ids.superadmin);
    expect(log.rows[0]?.details).toEqual({ from: "user", to: "admin" });
    await t.asUser(ids.superadmin, (db) => db.query("select public.set_user_role($1, 'user')", [ids.other]));
  });

  it("admin suspenso perde os poderes", async () => {
    const suspendedAdmin = await t.createUser("adm-suspenso@teste.local");
    await t.setRoleAsOwner(suspendedAdmin, "admin");
    await t.asUser(ids.superadmin, (db) => db.query("select public.set_user_status($1, 'suspended')", [suspendedAdmin]));

    const message = await expectDbError(
      t.asUser(suspendedAdmin, (db) => db.query("select public.set_user_role($1, 'editor')", [ids.user])),
    );
    expect(message).toMatch(/forbidden/);
    const rows = await t.asUser(suspendedAdmin, (db) => db.query("select * from public.audit_log"));
    expect(rows.rows).toHaveLength(0);
  });

  it("admin não suspende superadmin", async () => {
    const message = await expectDbError(
      t.asUser(ids.admin, (db) => db.query("select public.set_user_status($1, 'suspended')", [ids.superadmin])),
    );
    expect(message).toMatch(/forbidden/);
  });
});

describe("perfis", () => {
  it("são públicos para leitura, sem e-mail", async () => {
    const result = await t.asAnon((db) => db.query<Record<string, unknown>>("select * from public.profiles limit 1"));
    expect(result.rows.length).toBe(1);
    expect(Object.keys(result.rows[0]!)).not.toContain("email");
  });

  it("cada pessoa edita apenas o próprio perfil", async () => {
    await t.asUser(ids.user, (db) => db.query("update public.profiles set bio = 'Olá' where id = $1", [ids.user]));
    const changed = await t.asUser(ids.user, (db) =>
      db.query("update public.profiles set bio = 'invadido' where id = $1", [ids.other]),
    );
    expect(changed.affectedRows ?? 0).toBe(0);
    const bio = await t.db.query<{ bio: string | null }>("select bio from public.profiles where id = $1", [ids.other]);
    expect(bio.rows[0]?.bio).toBeNull();
  });

  it("não permite trocar o id do perfil para outra conta", async () => {
    const message = await expectDbError(
      t.asUser(ids.user, (db) => db.query("update public.profiles set id = $2 where id = $1", [ids.user, ids.other])),
    );
    expect(message).toMatch(/permission denied/);
  });
});

describe("conteúdo", () => {
  it("visitante vê publicado e agendado vencido, nunca rascunho ou agendado futuro", async () => {
    expect(await articleIds(t.asAnon)).toEqual(["agendado-passado", "publicado"]);
  });

  it("usuário comum e moderador têm a mesma visão pública", async () => {
    for (const who of [ids.user, ids.moderator]) {
      expect(await articleIds((fn) => t.asUser(who, fn))).toEqual(["agendado-passado", "publicado"]);
    }
  });

  it("editor vê rascunhos", async () => {
    expect(await articleIds((fn) => t.asUser(ids.editor, fn))).toContain("rascunho");
  });

  it.each(PUBLIC_TABLES)("visitante não escreve em %s", async (table) => {
    const message = await expectDbError(t.asAnon((db) => db.query(`delete from public.${table}`)));
    expect(message).toMatch(/permission denied/);
  });

  it("usuário comum e moderador não criam artigo", async () => {
    for (const who of [ids.user, ids.moderator]) {
      const message = await expectDbError(
        t.asUser(who, (db) =>
          db.query(
            "insert into public.articles (id, slug, title, category, author_name, reading_time_minutes) values ('x', 'x', 'x', 'x', 'x', 1)",
          ),
        ),
      );
      expect(message).toMatch(/row-level security/);
    }
  });

  it("usuário comum não altera artigo publicado", async () => {
    const result = await t.asUser(ids.user, (db) => db.query("update public.articles set title = 'hack' where id = 'publicado'"));
    expect(result.affectedRows ?? 0).toBe(0);
  });

  it("editor cria e edita; autoria é definida pelo servidor", async () => {
    await t.asUser(ids.editor, (db) =>
      db.query(
        `insert into public.articles (id, slug, title, category, author_name, reading_time_minutes, created_by)
         values ('do-editor', 'do-editor', 'Do editor', 'SQL', 'Autor', 3, $1)`,
        [ids.admin],
      ),
    );
    const row = await t.db.query<{ created_by: string; status: string }>(
      "select created_by, status from public.articles where id = 'do-editor'",
    );
    expect(row.rows[0]?.created_by).toBe(ids.editor);
    expect(row.rows[0]?.status).toBe("draft");

    const log = await t.db.query("select 1 from public.audit_log where entity_type = 'articles' and entity_id = 'do-editor'");
    expect(log.rows.length).toBeGreaterThan(0);
  });

  it("editor não exclui; admin exclui", async () => {
    const editorDelete = await t.asUser(ids.editor, (db) => db.query("delete from public.articles where id = 'do-editor'"));
    expect(editorDelete.affectedRows ?? 0).toBe(0);
    const adminDelete = await t.asUser(ids.admin, (db) => db.query("delete from public.articles where id = 'do-editor'"));
    expect(adminDelete.affectedRows).toBe(1);
  });

  it("etapas de trilha não publicada ficam ocultas", async () => {
    const rows = await t.asAnon((db) => db.query<{ id: string }>("select id from public.roadmap_steps order by id"));
    expect(rows.rows.map((r) => r.id)).toEqual(["etapa-publica"]);
  });

  it("notícia duplicada pela mesma URL é recusada", async () => {
    await t.db.exec(`insert into public.news (id, slug, title, summary, published_on, categories, source_name, source_url)
      values ('n1', 'n1', 't', 's', '2026-01-01', '{IA}', 'Fonte', 'https://exemplo.com/a')`);
    const message = await expectDbError(
      t.db.exec(`insert into public.news (id, slug, title, summary, published_on, categories, source_name, source_url)
        values ('n2', 'n2', 't', 's', '2026-01-01', '{IA}', 'Fonte', 'https://EXEMPLO.COM/a')`),
    );
    expect(message).toMatch(/news_source_url_key/);
  });
});
