/// <reference types="vitest" />
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: [...configDefaults.exclude],
    // Flight-list tests assert one POST per configured provider (historically Sabre + Tripjack).
    env: {
      NEXT_PUBLIC_FLIGHT_SEARCH_PROVIDERS: "sabre,tripjack",
    },
  },
});
