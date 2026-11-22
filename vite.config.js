import { defineConfig, loadEnv } from "vite";
import activity, { fetchCalendar } from "./api/github-activity.js";
import leetcode, { fetchLeetCodeCalendar } from "./api/leetcode-activity.js";
import { localLikes } from "./server/local-likes.js";
import react from "@vitejs/plugin-react";
import { createGmailContactHandler } from "./api/contact.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: "shared-project-likes",
      configureServer(server) {
        server.middlewares.use(
          "/api/project-likes",
          localLikes(loadEnv(mode, process.cwd(), "")),
        );
      },
      configurePreviewServer(server) {
        server.middlewares.use(
          "/api/project-likes",
          localLikes(loadEnv(mode, process.cwd(), "")),
        );
      },
    },
    {
      name: "github-activity",
      configureServer(server) {
        server.middlewares.use("/api/github-activity", activity);
      },
      configurePreviewServer(server) {
        server.middlewares.use("/api/github-activity", activity);
      },
      async generateBundle() {
        try {
          const calendar = await fetchCalendar(
            process.env.GITHUB_ACTIVITY_TOKEN,
          );
          this.emitFile({
            type: "asset",
            fileName: "github-activity.json",
            source: JSON.stringify(calendar),
          });
        } catch {
          this.warn(
            "GitHub unavailable. Keeping the dated public calendar snapshot.",
          );
        }
      },
    },
    {
      name: "leetcode-activity",
      configureServer(server) {
        server.middlewares.use("/api/leetcode-activity", leetcode);
      },
      configurePreviewServer(server) {
        server.middlewares.use("/api/leetcode-activity", leetcode);
      },
      async generateBundle() {
        try {
          const calendar = await fetchLeetCodeCalendar();
          this.emitFile({
            type: "asset",
            fileName: "leetcode-activity.json",
            source: JSON.stringify(calendar),
          });
        } catch {
          this.warn(
            "LeetCode unavailable. Keeping the dated public calendar snapshot.",
          );
        }
      },
    },
    {
      name: "local-contact-api",
      configureServer(server) {
        const env = loadEnv(mode, process.cwd(), "");
        const handler = createGmailContactHandler({
          ...env,
          SITE_URL: env.SITE_URL || "http://127.0.0.1:5173",
        });
        server.middlewares.use("/api/contact", handler);
      },
    },
  ],
}));
