import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

/** Absolute origin for Open Graph / canonical. Override with VITE_SITE_URL. */
const DEFAULT_SITE_URL = "https://fulldevstack2.github.io/blesspoke";

function spaFallback(): Plugin {
  return {
    name: "blesspoke-spa-fallback",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const index = path.join(dist, "index.html");
      const fallback = path.join(dist, "404.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, fallback);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  // Local dev stays at `/`. Production / GH Pages uses `/blesspoke/`.
  const base = env.VITE_BASE || (mode === "production" ? "/blesspoke/" : "/");

  return {
    base,
    plugins: [
      react(),
      {
        name: "blesspoke-site-url",
        transformIndexHtml(html) {
          return html.replaceAll("%SITE_URL%", siteUrl);
        },
      },
      spaFallback(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 3000,
    },
  };
});
