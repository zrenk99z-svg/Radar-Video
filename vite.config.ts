import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Ícones/estáticos que devem ir para o precache além dos assets buildados.
      includeAssets: [
        "favicon.svg",
        "favicon-96.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Refúgio Nerd — Radar de Vídeos",
        short_name: "Radar Nerd",
        description:
          "Encontre temas de vídeos com alto potencial para o canal Refúgio Nerd.",
        lang: "pt-BR",
        dir: "ltr",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#141210",
        theme_color: "#141210",
        categories: ["entertainment", "productivity"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // App shell + assets buildados vão para o precache (funciona offline).
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Fontes do Google (CSS) — stale-while-revalidate.
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Arquivos de fonte (woff2) — cache longo.
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Permite testar o SW em `vite dev` também.
        enabled: false,
      },
    }),
  ],
});
