import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ESM: kein __dirname. Die Config läuft als Modul im Workspace.
const here = dirname(fileURLToPath(import.meta.url));
const components = (...p: string[]) => resolve(here, "../../packages/components/src", ...p);
const tokens = (...p: string[]) => resolve(here, "../../packages/tokens/dist", ...p);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Als Liste mit Ankern: ein Objekt-Alias würde auch "@weppelmann/components/style.css"
    // auf ".../index.ts/style.css" verbiegen.
    alias: [
      { find: /^@weppelmann\/components$/, replacement: components("index.ts") },
      { find: /^@weppelmann\/components\/(.*)$/, replacement: components("$1") },
      { find: /^@weppelmann\/tokens-css$/, replacement: tokens("css/vars.css") },
      { find: /^@weppelmann\/tokens$/, replacement: tokens("json/tokens.json") },
      {
        find: /^@weppelmann\/icons$/,
        replacement: resolve(here, "../../packages/icons/src/index.ts"),
      },
    ],
  },
  server: { port: 5173 },
});
