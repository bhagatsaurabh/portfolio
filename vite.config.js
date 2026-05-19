import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import svgSpriteSheet from "./plugins/vite-plugin-svg-spritesheet";

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_TIMESTAMP": JSON.stringify(new Date().toISOString()),
  },
  plugins: [react(), svgSpriteSheet()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
