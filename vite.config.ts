/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  base: "/my-raid-cds/",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      // Generator helpers live under scripts/ (.mjs); keep their tests out of src/tsc.
      "scripts/**/*.test.mjs",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@mui/icons-material")) return "mui-icons";
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("react-dom") || id.includes("react/")) return "react";
        },
      },
    },
  },
});
