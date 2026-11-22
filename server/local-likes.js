import { mkdirSync } from "node:fs";
import { hostedLikes, makeLikesHandler } from "../api/project-likes.js";

export function localLikes(env) {
  if (env.SUPABASE_URL || env.SUPABASE_SERVICE_ROLE_KEY)
    return hostedLikes(env);
  let db;
  return makeLikesHandler(async (id, digest, desired) => {
    if (!db) {
      const { DatabaseSync } = await import("node:sqlite");
      if (!db) {
        mkdirSync(".local", { recursive: true });
        db = new DatabaseSync(".local/project-likes.sqlite");
        db.exec(
          "pragma busy_timeout=5000; create table if not exists likes(id text, digest text, primary key(id,digest))",
        );
      }
    }
    db.exec("begin immediate");
    try {
      if (desired === true)
        db.prepare("insert or ignore into likes values(?,?)").run(id, digest);
      if (desired === false)
        db.prepare("delete from likes where id=? and digest=?").run(id, digest);
      const row = db
        .prepare(
          "select count(*) as count, max(digest=?) as liked from likes where id=?",
        )
        .get(digest, id);
      db.exec("commit");
      return { count: row.count, liked: Boolean(row.liked) };
    } catch (error) {
      db.exec("rollback");
      throw error;
    }
  });
}
