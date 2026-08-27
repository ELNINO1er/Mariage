import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/features/**/*.ts", "src/server/security/**/*.ts"],
      thresholds: { statements: 45, branches: 35, functions: 35, lines: 50 },
    },
  },
});
