import { randomUUID, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { initialContent } from "../src/portfolio/content.js";

const known = new Set(initialContent.projects.map((p) => p.id));
export function makeLikesHandler(store, hasProject = async () => false) {
  return async (req, res) => {
    const send = (status, data) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "private, no-store");
    const params = new URL(req.url, "http://localhost").searchParams;
    const id = params.get("project");
    const write = req.method === "POST";
    if (!write && req.method !== "GET") return send(405, {});
    if (!id || !/^[\w-]{1,100}$/.test(id)) return send(400, {});
    if (
      write &&
      (req.headers["x-project-like"] !== "1" ||
        req.headers["sec-fetch-site"] === "cross-site")
    )
      return send(403, {});
    const desired = params.get("liked");
    if (write && !["true", "false"].includes(desired)) return send(400, {});
    const cookie = /(?:^|;\s*)portfolio_like=([0-9a-f-]{36})(?:;|$)/.exec(
      req.headers.cookie || "",
    )?.[1];
    if (write && !cookie) return send(409, {});
    const token = cookie || randomUUID();
    try {
      if (!known.has(id) && !(await hasProject(id))) return send(404, {});
      const digest = createHash("sha256")
        .update(id + ":" + token)
        .digest("hex");
      const state = await store(id, digest, write ? desired === "true" : null);
      if (!cookie)
        res.setHeader(
          "Set-Cookie",
          "portfolio_like=" +
            token +
            "; HttpOnly; SameSite=Lax; Path=/api/project-likes; Max-Age=31536000" +
            (process.env.VERCEL || req.socket?.encrypted ? "; Secure" : ""),
        );
      send(200, state);
    } catch {
      send(503, { error: "Likes unavailable" });
    }
  };
}

export function hostedLikes(env) {
  const db = () =>
    createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  return makeLikesHandler(
    async (slug, digest, desired) => {
      const { data, error } = await db().rpc("project_like_state", {
        slug,
        digest,
        desired,
      });
      if (error) throw error;
      return data;
    },
    async (id) => {
      const { data, error } = await db()
        .from("portfolio_content")
        .select("data->projects")
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      return data?.projects?.some((p) => p.id === id);
    },
  );
}
export default hostedLikes(process.env);
