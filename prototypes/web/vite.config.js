import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api/chat": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: () => "/v1/messages",
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("x-api-key", process.env.ANTHROPIC_API_KEY ?? "");
            proxyReq.setHeader("anthropic-version", "2023-06-01");
            proxyReq.setHeader("content-type", "application/json");
          });
        }
      }
    }
  }
});
