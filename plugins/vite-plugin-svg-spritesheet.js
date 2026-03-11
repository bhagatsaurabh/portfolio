import { promises as fs } from "fs";
import path from "path";
import { loadConfig, optimize } from "svgo";

export default function svgSpriteSheet() {
  async function generateIconSprite() {
    const iconsDir = path.join(process.cwd(), "public", "icons");
    const files = await fs.readdir(iconsDir);
    let symbols = "";

    for (const file of files) {
      if (!file.endsWith(".svg")) continue;
      let svgContent = await fs.readFile(path.join(iconsDir, file), "utf8");
      const id = file.replace(".svg", "");
      svgContent = svgContent
        .replace(/id="[^"]+"/, "")
        .replace("<svg", `<symbol id="${id}"`)
        .replace("</svg>", "</symbol>");
      symbols += svgContent + "\n";
    }

    const spritesheet = `<svg width="0" height="0" style="display: none">\n\n${symbols}</svg>`;

    const svgoConfig = await loadConfig();
    const result = optimize(spritesheet, svgoConfig);
    const optimizedSpritesheet = result.data;

    await fs.writeFile(
      path.join(process.cwd(), "public", "spritesheets", "icons.svg"),
      optimizedSpritesheet,
    );
  }

  return {
    name: "svg-spritesheet",
    buildStart() {
      return generateIconSprite();
    },
    configureServer(server) {
      server.watcher.add(path.join(process.cwd(), "public", "icons", "*.svg"));
      server.watcher.on("change", async (changedPath) => {
        if (changedPath.endsWith(".svg")) {
          return generateIconSprite();
        }
      });
    },
  };
}
