import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../backend/openapi.json",
  output: "src/api-client",
  plugins: ["@hey-api/client-fetch"],
});
