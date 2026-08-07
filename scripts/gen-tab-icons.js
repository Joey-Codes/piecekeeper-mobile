// Generates the tab-bar icons in assets/images/tabIcons from Lucide SVGs
// (lucide-static + @resvg/resvg-js, both devDependencies).
// Run: node scripts/gen-tab-icons.js
//
// Why custom PNGs instead of SF Symbols: iOS fixes symbol size/position in
// the native tab bar; a PNG renders at its own point size, so glyph size
// (22pt) and the transparent top padding (3pt) are controlled here.
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const iconsDir = path.join(__dirname, "../node_modules/lucide-static/icons");
const outDir = path.join(__dirname, "../assets/images/tabIcons");

const GLYPH_PT = 22;
const PAD_PT = 3;
const CANVAS_W = GLYPH_PT;
const CANVAS_H = GLYPH_PT + PAD_PT;
// Lucide space is 24 units; padding expressed in that space
const PAD_UNITS = (PAD_PT * 24) / GLYPH_PT;

// Matched to the web app's sidebar icons (play / note / bars / gear)
const ICONS = {
  home: "play.svg",
  repertoire: "music.svg",
  insights: "chart-no-axes-column-increasing.svg",
  settings: "settings.svg",
};

fs.mkdirSync(outDir, { recursive: true });

for (const [name, file] of Object.entries(ICONS)) {
  const raw = fs.readFileSync(path.join(iconsDir, file), "utf8");
  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 ${24 + PAD_UNITS}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(0,${PAD_UNITS})">${inner}</g></svg>`;

  for (const scale of [1, 2, 3]) {
    const resvg = new Resvg(wrapped, {
      fitTo: { mode: "width", value: CANVAS_W * scale },
    });
    const png = resvg.render().asPng();
    const suffix = scale === 1 ? "" : `@${scale}x`;
    fs.writeFileSync(path.join(outDir, `${name}${suffix}.png`), png);
    console.log(`${name}${suffix}.png (${CANVAS_W * scale}x${CANVAS_H * scale})`);
  }
}
