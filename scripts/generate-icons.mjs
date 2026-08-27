import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("public/logo.png");
const OUT = path.resolve("public");

async function resize(size, filename) {
  const buf = await sharp(SRC).resize(size, size).png().toBuffer();
  await writeFile(path.join(OUT, filename), buf);
  return buf;
}

async function main() {
  await resize(192, "icon-192.png");
  await resize(512, "icon-512.png");
  await resize(180, "apple-touch-icon.png");

  const icoSizes = await Promise.all(
    [16, 32, 48].map((size) => sharp(SRC).resize(size, size).png().toBuffer()),
  );
  const ico = await pngToIco(icoSizes);
  await writeFile(path.join(OUT, "favicon.ico"), ico);

  console.log("Generated icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
