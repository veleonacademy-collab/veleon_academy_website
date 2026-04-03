import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: "es2015",
  },
  build: {
    target: "es2015", // Force transpilation of Optional Chaining, etc.
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@tanstack")) return "vendor-query";
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5005",
        changeOrigin: true
      }
    }
  }
});






