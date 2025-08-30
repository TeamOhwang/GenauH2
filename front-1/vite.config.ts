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
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@stomp/stompjs'],
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      // WebSocket 연결을 위한 유일한 프록시 규칙입니다.
      // SockJS의 초기 요청(/ws/info 등)과 실제 WebSocket 핸드셰이크를 모두 처리합니다.
      "/ws": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 프록시 활성화
      },
      "/gh": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
      },
      // 공공데이터포털 API 프록시
      "/cloud": {
        target: "https://api.odcloud.kr",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cloud/, "/api"),
      },
    },
  },
});
