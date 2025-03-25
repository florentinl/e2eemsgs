import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    wasm(),
    topLevelAwait(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
