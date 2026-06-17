import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: "es2015",
  },
  build: {
    target: "es2015",
    cssCodeSplit: true, // Re-enabled: each page only loads its own CSS chunk
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting: keeps vendor libs out of the critical path
        manualChunks: {
          "vendor-react":   ["react", "react-dom", "react-router-dom"],
          "vendor-motion":  ["framer-motion"],
          "vendor-icons":   ["lucide-react"],
          "vendor-ui":      ["@stripe/react-stripe-js", "@stripe/stripe-js"],
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






