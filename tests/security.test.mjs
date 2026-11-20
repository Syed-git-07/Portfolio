import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  initialContent,
  validateContent,
  safeUrl,
} from "../src/portfolio/content.js";

test("unsafe URLs and malformed remote records are rejected", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "/\\evil.test",
    "https:\n//evil.test",
  ])
    assert.equal(safeUrl(value), "");
  assert.equal(safeUrl("/assets/resume.pdf"), "/assets/resume.pdf");
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
  assert.equal(
    validateContent(structuredClone(initialContent)).projects.length,
    initialContent.projects.length,
  );
  const malformed = structuredClone(initialContent);
  malformed.projects[0].tags = {};
  assert.throws(() => validateContent(malformed));
  const duplicate = structuredClone(initialContent);
  duplicate.projects.push(duplicate.projects[0]);
  assert.throws(() => validateContent(duplicate));
});

test("PostgreSQL owner boundary, concurrent version checks and upload RLS", async () => {
  const db = new PGlite();
  const owner = "11111111-1111-4111-8111-111111111111",
    stranger = "22222222-2222-4222-8222-222222222222";
  await db.exec(`create role anon;create role authenticated;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;
 alter table storage.objects enable row level security;
 grant usage on schema storage to anon,authenticated;grant all on storage.objects to anon,authenticated;
 insert into auth.users values ('${owner}'),('${stranger}');`);
  await db.exec(
    await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
  );
  await db.query("insert into public.portfolio_owners values ($1)", [owner]);
  const role = async (name, id = "") => {
    await db.exec(`reset role;set role ${name}`);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  };
  await role("anon");
  assert.equal(
    (await db.query("select * from public.portfolio_content")).rows.length,
    0,
  );
  await assert.rejects(
    db.query("select public.publish_portfolio($1,0)", [initialContent]),
    /permission denied/,
  );
  await assert.rejects(
    db.query("insert into public.portfolio_content values ($1,$2,1,now())", [
      "main",
      initialContent,
    ]),
    /permission denied/,
  );
  await role("authenticated", stranger);
  assert.equal(
    (await db.query("select public.is_portfolio_owner() as ok")).rows[0].ok,
    false,
  );
  await assert.rejects(
    db.query("select public.publish_portfolio($1,0)", [initialContent]),
    /not_authorized/,
  );
  await assert.rejects(
    db.query("select * from public.portfolio_owners"),
    /permission denied/,
  );
  await assert.rejects(
    db.query(
      "insert into storage.objects(bucket_id,name) values ('portfolio-media',$1)",
      [stranger + "/asset.pdf"],
    ),
    /row-level security/,
  );
  await role("authenticated", owner);
  assert.equal(
    (
      await db.query("select public.publish_portfolio($1,0) as version", [
        initialContent,
      ])
    ).rows[0].version,
    1,
  );
  await assert.rejects(
    db.query("select public.publish_portfolio($1,0)", [initialContent]),
    /version_conflict/,
  );
  await assert.rejects(
    db.query("select public.publish_portfolio($1,1)", [{}]),
    /invalid_content/,
  );
  assert.equal(
    (
      await db.query("select public.publish_portfolio($1,1) as version", [
        initialContent,
      ])
    ).rows[0].version,
    2,
  );
  await db.query(
    "insert into storage.objects(bucket_id,name) values ('portfolio-media',$1)",
    [owner + "/asset.pdf"],
  );
  await assert.rejects(
    db.query(
      "insert into storage.objects(bucket_id,name) values ('portfolio-media',$1)",
      [stranger + "/asset.pdf"],
    ),
    /row-level security/,
  );
  await role("anon");
  assert.equal(
    (await db.query("select version from public.portfolio_content")).rows[0]
      .version,
    2,
  );
  assert.equal(
    (await db.query("select * from storage.objects")).rows.length,
    0,
  );
  await db.exec("reset role; create role service_role;");
  await db.exec(
    await readFile(new URL("../supabase/contact.sql", import.meta.url), "utf8"),
  );
  await role("anon");
  await assert.rejects(
    db.query("select public.reserve_contact_send($1)", ["a".repeat(64)]),
    /permission denied/,
  );
  await role("authenticated", owner);
  await assert.rejects(
    db.query("select public.reserve_contact_send($1)", ["a".repeat(64)]),
    /permission denied/,
  );
  await role("service_role");
  for (let i = 0; i < 3; i++)
    assert.equal(
      (
        await db.query("select public.reserve_contact_send($1) as ok", [
          "a".repeat(64),
        ])
      ).rows[0].ok,
      true,
    );
  assert.equal(
    (
      await db.query("select public.reserve_contact_send($1) as ok", [
        "a".repeat(64),
      ])
    ).rows[0].ok,
    false,
  );
  for (let i = 0; i < 37; i++)
    assert.equal(
      (
        await db.query("select public.reserve_contact_send($1) as ok", [
          i.toString(16).padStart(64, "0"),
        ])
      ).rows[0].ok,
      true,
    );
  assert.equal(
    (
      await db.query("select public.reserve_contact_send($1) as ok", [
        "f".repeat(64),
      ])
    ).rows[0].ok,
    false,
  );
  await db.close();
});
