import { defineConfig } from "vite";

const pennyApiTarget = process.env.PENNY_API_TARGET || "http://127.0.0.1:5000";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": pennyApiTarget },
  },
  preview: { proxy: { "/api": pennyApiTarget } },
});
