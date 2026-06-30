import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@an-act/tokens": path.resolve(__dirname, "../../packages/tokens/src/index.ts"),
      "@an-act/runtime-core": path.resolve(__dirname, "../../packages/runtime-core/src/index.ts"),
      "@an-act/runtime-client": path.resolve(__dirname, "../../packages/runtime-client/src/index.ts"),
      "@an-act/runtime-ui/react": path.resolve(__dirname, "../../packages/runtime-ui/src/react/index.ts"),
      "@an-act/runtime-ui/brand.css": path.resolve(__dirname, "../../packages/runtime-ui/src/react/styles/an-act-brand.css"),
      "@an-act/runtime-ui/production.css": path.resolve(__dirname, "../../packages/runtime-ui/src/react/styles/an-act-production.css"),
      "@an-act/runtime-ui": path.resolve(__dirname, "../../packages/runtime-ui/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/need-experience": { target: "http://127.0.0.1:3000", changeOrigin: true },
      "/action-experience": { target: "http://127.0.0.1:3000", changeOrigin: true },
      "/contract-experience": { target: "http://127.0.0.1:3000", changeOrigin: true },
      "/v1/auth": { target: "http://127.0.0.1:3000", changeOrigin: true },
    },
  },
});
