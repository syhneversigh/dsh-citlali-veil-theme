import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LIGHT, DARK } from "../src/palette.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const dataUrl = async (file, type) => `data:${type};base64,${(await readFile(path.join(root, file))).toString("base64")}`;

const lightKeys = Object.keys(LIGHT).sort();
const darkKeys = Object.keys(DARK).sort();
if (JSON.stringify(lightKeys) !== JSON.stringify(darkKeys)) {
  throw new Error("Light and dark palettes must contain exactly the same tokens.");
}
if (lightKeys.some((name) => !name.startsWith("--dsw-") && !name.startsWith("--shiki-"))) {
  throw new Error("Unexpected token name in palette.");
}

const [template, css, night, reading, still, portrait, mark] = await Promise.all([
  read("src/client.template.js"),
  read("src/theme.css"),
  dataUrl("assets/citlali-night.webp", "image/webp"),
  dataUrl("assets/citlali-reading.webp", "image/webp"),
  dataUrl("assets/citlali-reading-still.webp", "image/webp"),
  dataUrl("assets/citlali-portrait.webp", "image/webp"),
  dataUrl("assets/icon.svg", "image/svg+xml"),
]);
const replacements = {
  __LIGHT__: JSON.stringify(LIGHT, null, 2),
  __DARK__: JSON.stringify(DARK, null, 2),
  __CSS__: JSON.stringify(css),
  __CITLALI_NIGHT__: JSON.stringify(night),
  __CITLALI_READING__: JSON.stringify(reading),
  __CITLALI_STILL__: JSON.stringify(still),
  __CITLALI_PORTRAIT__: JSON.stringify(portrait),
  __CITLALI_MARK__: JSON.stringify(mark),
};
let bundle = template;
for (const [key, value] of Object.entries(replacements)) bundle = bundle.replaceAll(key, value);
if (Object.keys(replacements).some((key) => bundle.includes(key))) {
  throw new Error("Unresolved placeholder in client bundle.");
}
if (/url\(\s*["']?https?:/i.test(css)) throw new Error("Skin assets must be local.");
await writeFile(path.join(root, "client.js"), bundle);
console.log(`Built dsh-citlali-veil-theme: ${lightKeys.length} light/dark tokens, ${(Buffer.byteLength(bundle) / 1024).toFixed(1)} KiB, embedded local artwork.`);
