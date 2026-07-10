import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/brand/logo.png");
const iconsDir = path.join(root, "public/icons");
const appDir = path.join(root, "src/app");

const BRAND_GREEN = { r: 50, g: 176, b: 77, alpha: 1 };

async function resizeAny(size, outPath) {
  await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(outPath);
}

async function resizeMaskable(size, outPath) {
  const inset = Math.round(size * 0.1);
  const inner = size - inset * 2;
  const logo = await sharp(src).resize(inner, inner, { fit: "contain" }).toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_GREEN },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outPath);
}

async function faviconIco(outPath) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(src)
        .resize(s, s, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .png()
        .toBuffer(),
    ),
  );
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (let i = 0; i < pngs.length; i++) {
    const s = sizes[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0);
    entry.writeUInt8(s === 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngs[i].length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    entries.push(entry);
  }
  await import("fs/promises").then((fs) =>
    fs.writeFile(outPath, Buffer.concat([header, ...entries, ...pngs])),
  );
}

await mkdir(iconsDir, { recursive: true });
await mkdir(appDir, { recursive: true });

await Promise.all([
  resizeAny(192, path.join(iconsDir, "icon-192x192.png")),
  resizeMaskable(192, path.join(iconsDir, "icon-192-maskable.png")),
  resizeAny(512, path.join(iconsDir, "icon-512x512.png")),
  resizeMaskable(512, path.join(iconsDir, "icon-512-maskable.png")),
  resizeAny(180, path.join(iconsDir, "apple-touch-icon.png")),
  resizeAny(192, path.join(iconsDir, "android-chrome-192x192.png")),
  resizeAny(32, path.join(appDir, "icon.png")),
  resizeAny(180, path.join(appDir, "apple-icon.png")),
  faviconIco(path.join(appDir, "favicon.ico")),
]);

console.log("PWA icons generated.");
