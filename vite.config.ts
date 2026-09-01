import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Deploy target is a GitHub Pages project repo, so the site is served from a
 * subpath. Both the base path and the absolute origin used by the link-preview
 * tags come from env rather than being hardcoded — see .env, where changing the
 * account is a one-line edit.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  return {
    base: env.VITE_BASE || "/blessbook/",
    plugins: [react()],
    server: { port: 4300 },
    build: {
      target: "es2022",
      rollupOptions: {
        output: {
          manualChunks: { three: ["three"] },
        },
      },
    },
  };
});
