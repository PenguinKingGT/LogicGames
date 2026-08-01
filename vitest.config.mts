import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/games/catalog.ts",
        "src/games/mastermind/**/*.{ts,tsx}",
        "src/games/polymine/domain/**/*.ts",
        "src/games/polymine/persistence/*.ts",
        "src/games/nonogram/domain/**/*.ts",
        "src/games/nonogram/audio/*.ts",
        "src/games/nonogram/app/game-reducer.ts",
        "src/games/nonogram/persistence/*.ts",
        "src/games/circle-cat/domain/**/*.ts",
        "src/games/circle-cat/audio/*.ts",
        "src/games/circle-cat/app/game-reducer.ts",
        "src/games/circle-cat/persistence/*.ts",
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/app/**/page.tsx",
        "src/app/layout.tsx",
        "src/games/**/components/ui/**",
        "src/games/polymine/game/create-game.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 75,
        branches: 75,
      },
    },
  },
});
