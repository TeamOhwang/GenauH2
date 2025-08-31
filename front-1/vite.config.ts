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
      // 1. SockJS 관련 모든 경로를 먼저 처리 (WebSocket + JSONP + 폴백)
      // 프론트엔드에서 /gh/ws 로 시작하는 모든 요청을 -> 백엔드의 http://localhost:8088/gh/ws 로 프록시
      "/gh/ws": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 프록시 활성화
        configure: (proxy, options) => {
          // SockJS의 JSONP 폴백 요청도 처리
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('SockJS 프록시 요청:', req.method, req.url);
          });
        },
      },
      // 2. WebSocket 관련 REST API 경로 처리 (컨텍스트 경로 /gh 포함)
      // 프론트엔드에서 /gh/api/websocket 로 요청하면 -> 백엔드의 http://localhost:8088/gh/api/websocket 로 프록시
      "/gh/api/websocket": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
      },
      // 3. 일반 API 요청 (컨텍스트 경로 /gh 포함)
      // 프론트엔드에서 /gh 로 시작하는 다른 요청들을 -> 백엔드의 http://localhost:8088/gh 로 프록시
      "/gh": {
        target: "http://localhost:8088",
        changeOrigin: true,
        secure: false,
      },
      // 4. 공공데이터포털 API 프록시
      "/cloud": {
        target: "https://api.odcloud.kr",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cloud/, "/api"),
      },
    },
  },
});
