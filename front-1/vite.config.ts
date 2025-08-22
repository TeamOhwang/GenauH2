import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/gh": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
        // ❌ rewrite 제거!  /gh/* → http://localhost:8088/gh/*
      },
      "/api": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
