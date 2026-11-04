import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/mathjs/")) return "math-engine";
          if (id.includes("/node_modules/motion/")) return "motion";
        },
      },
    },
  },
  test: {
    environment: "node",
  },
});
