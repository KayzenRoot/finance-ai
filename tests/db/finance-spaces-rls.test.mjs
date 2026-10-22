import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migrationPath = new URL("../../supabase/migrations/20261022131525_finance_spaces_foundation.sql", import.meta.url);

test("finance spaces migration enforces owner-only database access", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      grant usage on schema auth to public;
      grant select on auth.users to public;
      create function auth.uid() returns uuid
      language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant execute on function auth.uid() to public;
    `);
    const migration = await readFile(migrationPath, "utf8");
    await db.exec(migration);

    await db.exec(`
      insert into auth.users (id) values
        ('10000000-0000-4000-8000-000000000001'),
        ('20000000-0000-4000-8000-000000000002');
    `);

    await db.exec("begin; set local role authenticated; select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);");
    const ownInsert = await db.query(`
      insert into public.finance_spaces (owner_id, space_type, display_name)
      values ('10000000-0000-4000-8000-000000000001', 'personal', 'Pessoal')
      returning id;
    `);
    assert.equal(ownInsert.rows.length, 1);

    async function expectRlsRejection(sql) {
      await db.exec("savepoint expected_rls_rejection;");
      let rejected;
      try {
        await db.query(sql);
      } catch (error) {
        rejected = error;
      }
      await db.exec("rollback to savepoint expected_rls_rejection; release savepoint expected_rls_rejection;");
      assert.equal(rejected?.code, "42501");
    }

    await expectRlsRejection(`insert into public.finance_spaces (owner_id, space_type, display_name)
      values ('20000000-0000-4000-8000-000000000002', 'personal', 'Outro titular')`);
    await expectRlsRejection(`update public.finance_spaces
      set owner_id = '20000000-0000-4000-8000-000000000002'
      where owner_id = '10000000-0000-4000-8000-000000000001'`);
    await db.exec("commit;");

    await db.exec("begin; set local role authenticated; select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);");
    const crossRead = await db.query("select id from public.finance_spaces;");
    assert.deepEqual(crossRead.rows, []);
    const crossUpdate = await db.query(`update public.finance_spaces set display_name = 'alterado'
      where owner_id = '10000000-0000-4000-8000-000000000001' returning id;`);
    assert.deepEqual(crossUpdate.rows, []);
    const crossDelete = await db.query(`delete from public.finance_spaces
      where owner_id = '10000000-0000-4000-8000-000000000001' returning id;`);
    assert.deepEqual(crossDelete.rows, []);
    await db.exec("rollback;");

    const rls = await db.query(`select relrowsecurity, relforcerowsecurity
      from pg_class where oid = 'public.finance_spaces'::regclass;`);
    assert.deepEqual(rls.rows, [{ relrowsecurity: true, relforcerowsecurity: true }]);

    const grants = await db.query(`select
      has_table_privilege('anon', 'public.finance_spaces', 'SELECT') as anon_select,
      has_table_privilege('anon', 'public.finance_spaces', 'INSERT') as anon_insert,
      has_table_privilege('authenticated', 'public.finance_spaces', 'SELECT') as user_select;`);
    assert.deepEqual(grants.rows, [{ anon_select: false, anon_insert: false, user_select: true }]);
  } finally {
    await db.close();
  }
});
