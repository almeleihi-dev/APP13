import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

const API_PROXY = { target: "http://127.0.0.1:3000", changeOrigin: true };

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.svg", "manifest.webmanifest"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,webmanifest,json}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/need-experience"),
            handler: "NetworkFirst",
            options: {
              cacheName: "an-act-need-experience",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/action-experience"),
            handler: "NetworkFirst",
            options: {
              cacheName: "an-act-action-experience",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
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
      "/need-experience": API_PROXY,
      "/action-experience": API_PROXY,
      "/contract-experience": API_PROXY,
      "/profile-experience": API_PROXY,
      "/living-onboarding": API_PROXY,
      "/professional-passport": API_PROXY,
      "/ai-guidance-experience": API_PROXY,
      "/ai-execution-companion-experience": API_PROXY,
      "/contract-intelligence": API_PROXY,
      "/runtime-executive": API_PROXY,
      "/v1": API_PROXY,
    },
  },
});
