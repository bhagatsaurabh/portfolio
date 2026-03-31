import { promises as fs } from "fs";
import path from "path";
import { loadConfig, optimize } from "svgo";

export default function svgSpriteSheet() {
  async function generateIconSprite() {
    console.log("Generating SVG sprite sheet...");
    const iconsDir = path.join(process.cwd(), "public", "icons");
    let files = await fs.readdir(iconsDir);
    let symbols = "";
    files = files.filter((file) => file.endsWith(".svg"));
    console.log(`Found ${files.length} SVG files in ${iconsDir}`);

    for (const file of files) {
      let svgContent = await fs.readFile(path.join(iconsDir, file), "utf8");
      const id = file.replace(".svg", "");
      svgContent = svgContent
        .replace(/id="[^"]+"/, "")
        .replace("<svg", `<symbol id="${id}"`)
        .replace("</svg>", "</symbol>");
      symbols += svgContent + "\n";
    }

    const spritesheet = `<svg width="0" height="0" style="display: none">\n\n${symbols}</svg>`;
    console.log("SVG spritesheet size:", spritesheet.length);

    await fs.writeFile(
      path.join(process.cwd(), "public", "spritesheets", "icons.svg"),
      spritesheet,
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
