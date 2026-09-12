// Vite + Vitest config for the MolarMind demo.
// Host, port, and routes come from .env — do not hard-code loopback URLs.
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT || 5173);
  const host = env.VITE_DEV_HOST || "127.0.0.1";

  return {
    plugins: [react()],
    server: {
      host,
      port,
      // Whisper's Web Worker and WebGPU need these isolation headers.
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
      },
    },
    preview: {
      host,
      port,
    },
    // Transformers.js loads ONNX/WASM itself; pre-bundling it breaks the worker.
    optimizeDeps: {
      exclude: ["@huggingface/transformers"],
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
