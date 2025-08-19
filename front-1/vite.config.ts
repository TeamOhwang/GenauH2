// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,          // 선택: 실제 사용 포트로 맞추세요
    strictPort: true,    
    proxy: {
      // 프론트에서 /gh 로 호출하면 Vite가 백엔드(8088)로 프록시
      "/gh": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
        // rewrite: (p) => p.replace(/^\/gh/, "/gh"),
      },
    },
  },
});
