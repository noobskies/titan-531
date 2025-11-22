import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    base: "", // Important for Capacitor
    build: {
      outDir: "dist",
      sourcemap: false, // Disable for production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            charts: ["recharts"],
            icons: ["lucide-react"],
          },
        },
      },
    },
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
      dedupe: ["react", "react-dom"],
    },
  };
});
