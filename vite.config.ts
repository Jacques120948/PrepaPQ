/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Nom du dépôt GitHub Pages (respecte la casse exacte du dépôt) :
// https://<compte>.github.io/PrepaPQ/
const BASE = "/PrepaPQ/";

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        id: BASE,
        name: "PrépaPQ",
        short_name: "PrépaPQ",
        description:
          "Cartes et quiz de révision pour la préparation à la procédure de qualification.",
        lang: "fr-CH",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "portrait",
        theme_color: "#833AB4",
        background_color: "#FAF8FF",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Les jeux de cartes (JSON) doivent être mis en cache pour l'usage
        // hors ligne, au même titre que le code de l'application.
        globPatterns: ["**/*.{js,css,html,svg,png,webp,ico,json,woff2}"],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: false,
  },
});
