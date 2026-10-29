import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Cada arquivo de banco sobe um Postgres (PGlite) em memória.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
