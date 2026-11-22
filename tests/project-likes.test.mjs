import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("project likes count distinct browsers and only remove the requesting browser's vote", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role;");
    await db.exec(await readFile(new URL("../supabase/project-likes.sql", import.meta.url),"utf8"));
    const vote = async (project, key, desired) => (await db.query(
      "select public.project_like_state($1,$2,$3) as state",[project,key.repeat(64),desired])).rows[0].state;
    assert.deepEqual(await vote("fee-portal","a",null),{count:0,liked:false});
    await Promise.all([vote("fee-portal","a",true),vote("fee-portal","a",true),vote("fee-portal","b",true)]);
    assert.deepEqual(await vote("fee-portal","a",null),{count:2,liked:true});
    assert.deepEqual(await vote("fee-portal","c",false),{count:2,liked:false});
    assert.deepEqual(await vote("riskguard","b",null),{count:0,liked:false});
    await vote("fee-portal","b",false);
    assert.deepEqual(await vote("fee-portal","b",false),{count:1,liked:false});
    await db.exec("set role anon");
    await assert.rejects(vote("fee-portal","c",true),/permission denied/);
  } finally { await db.close(); }
});
