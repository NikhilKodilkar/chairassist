import { defineConfig, loadEnv } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT || 5173);
  const host = env.VITE_DEV_HOST || "127.0.0.1";

  return {
    plugins: [react()],
    server: {
      host,
      port,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    preview: {
      host,
      port,
    },
    optimizeDeps: {
      exclude: ["@huggingface/transformers"],
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
