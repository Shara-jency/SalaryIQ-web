import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@domain": path.resolve(root, "src/domain"),
      "@infrastructure": path.resolve(root, "src/infrastructure"),
      "@app": path.resolve(root, "src/app"),
      "@features": path.resolve(root, "src/features"),
      "@shared": path.resolve(root, "src/shared"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/setupTests.ts"],
  },
});
