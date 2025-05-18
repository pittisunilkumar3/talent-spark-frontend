import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fileUploadPlugin from "./vite-file-upload-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/list-uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/direct-upload': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    fileUploadPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
