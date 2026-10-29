import { describe, expect, it } from "vitest";
import { applyMigrations, createTestDb, expectDbError } from "./harness";

describe("aplicação das migrações em um projeto já em uso", () => {
  it("cria perfil e papel 'user' para contas que já existiam no Auth", async () => {
    const t = await createTestDb({
      beforeMigrations: (db) =>
        db.exec(`insert into auth.users (email, raw_user_meta_data) values
          ('antiga@teste.local', '{"display_name": "Conta Antiga", "role": "admin"}'),
          ('sem-nome@teste.local', '{}')`),
    });
    const rows = await t.db.query<{ display_name: string; role: string }>(
      `select p.display_name, r.role from public.profiles p join public.user_roles r on r.user_id = p.id order by p.display_name`,
    );
    expect(rows.rows).toEqual([
      { display_name: "Conta Antiga", role: "user" },
      { display_name: "Pessoa usuária", role: "user" },
    ]);
  });

  it("reaplicar as migrações não altera dados nem falha", async () => {
    const t = await createTestDb();
    const id = await t.createUser("x@teste.local", { display_name: "X" });
    await t.setRoleAsOwner(id, "editor");
    await t.db.exec(`insert into public.articles (id, slug, title, category, author_name, reading_time_minutes, status, published_on)
      values ('a', 'a', 'A', 'SQL', 'Autor', 1, 'published', '2026-01-01')`);

    await applyMigrations(t.db);

    const role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [id]);
    const count = await t.db.query<{ n: number }>("select count(*)::int as n from public.articles");
    expect(role.rows[0]?.role).toBe("editor");
    expect(count.rows[0]?.n).toBe(1);
  });
});

describe("proteção do último superadmin", () => {
  it("bloqueia rebaixar, suspender ou excluir o único superadmin, inclusive pelo dono do banco", async () => {
    const t = await createTestDb();
    const only = await t.createUser("unico@teste.local");
    await t.setRoleAsOwner(only, "superadmin");

    expect(await expectDbError(t.db.query("update public.user_roles set role = 'admin' where user_id = $1", [only]))).toMatch(
      /last_superadmin/,
    );
    expect(
      await expectDbError(t.db.query("update public.user_roles set status = 'suspended' where user_id = $1", [only])),
    ).toMatch(/last_superadmin/);
    expect(await expectDbError(t.db.query("delete from auth.users where id = $1", [only]))).toMatch(/last_superadmin/);
  });

  it("permite rebaixar quando existe outro superadmin ativo", async () => {
    const t = await createTestDb();
    const a = await t.createUser("a@teste.local");
    const b = await t.createUser("b@teste.local");
    await t.setRoleAsOwner(a, "superadmin");
    await t.setRoleAsOwner(b, "superadmin");

    await t.asUser(a, (db) => db.query("select public.set_user_role($1, 'admin')", [b]));
    const role = await t.db.query<{ role: string }>("select role from public.user_roles where user_id = $1", [b]);
    expect(role.rows[0]?.role).toBe("admin");
  });
});

describe("notícias sinalizadas", () => {
  it("'flagged' some da visão pública, mas continua visível para editores", async () => {
    const t = await createTestDb();
    const editor = await t.createUser("ed@teste.local");
    await t.setRoleAsOwner(editor, "editor");
    await t.db.exec(`insert into public.news (id, slug, title, summary, published_on, categories, source_name, source_url, status, verification)
      values ('ok', 'ok', 't', 's', '2026-01-01', '{IA}', 'F', 'https://f.com/1', 'published', 'unverified'),
             ('ruim', 'ruim', 't', 's', '2026-01-01', '{IA}', 'F', 'https://f.com/2', 'published', 'flagged')`);

    const anon = await t.asAnon((db) => db.query<{ id: string }>("select id from public.news order by id"));
    expect(anon.rows.map((r) => r.id)).toEqual(["ok"]);
    const asEditor = await t.asUser(editor, (db) => db.query<{ id: string }>("select id from public.news order by id"));
    expect(asEditor.rows.map((r) => r.id)).toEqual(["ok", "ruim"]);
  });
});
