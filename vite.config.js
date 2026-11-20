import { defineConfig, loadEnv } from "vite";
import activity, { fetchCalendar } from "./api/github-activity.js";
import react from "@vitejs/plugin-react";
import { createGmailContactHandler } from "./api/contact.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
