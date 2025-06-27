import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";


const manifestPWA: Partial<VitePWAOptions> = {
  strategies: 'generateSW',
  registerType: 'prompt',
  injectRegister: false,
  pwaAssets: { disabled: false, config: true, htmlPreset: "2023", overrideManifestIcons: true },

  manifest: {
    name: "Another Connections Clone",
    short_name: "Another Connections Clone",
    description: "NYTime Connection game clone",
    theme_color: "#b3a7fe",
    background_color: "#b3a7fe",
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    icons: [
    {
      "src": "pwa-64x64.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  },
  workbox: {
    // defining cached files formats
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
  },
  injectManifest: {
    globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
  },
  devOptions: {
    enabled: true,
    type: "module",
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(manifestPWA)]
})
