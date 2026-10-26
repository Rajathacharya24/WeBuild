import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { APP_CONFIG } from "./app.config";

function appConfigHtml(): Plugin {
  return {
    name: "webuild-app-config-html",
    transformIndexHtml(html) {
      return html
        .replaceAll("%APP_TITLE%", `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`)
        .replaceAll("%APP_DESCRIPTION%", APP_CONFIG.description)
        .replaceAll("%APP_THEME_COLOR%", APP_CONFIG.themeColor);
    }
  };
}

export default defineConfig({
  envDir: "../../",
  plugins: [
    react(),
    appConfigHtml(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        name: `${APP_CONFIG.name} — ${APP_CONFIG.city}`,
        short_name: APP_CONFIG.shortName,
        description: APP_CONFIG.description,
        theme_color: APP_CONFIG.themeColor,
        background_color: APP_CONFIG.backgroundColor,
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "place-photos",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/leaflet") ||
            id.includes("node_modules/react-leaflet") ||
            id.includes("node_modules/@react-leaflet")
          ) {
            return "maps";
          }
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
