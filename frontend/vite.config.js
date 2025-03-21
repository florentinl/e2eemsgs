import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), wasm(), topLevelAwait()],
  test: {
    globals: true,
    environment: "jsdom",
  },

});
