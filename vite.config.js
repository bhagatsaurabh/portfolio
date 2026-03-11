import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import svgSpriteSheet from "plugins/vite-plugin-svg-spritesheet";

export default defineConfig({
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
