import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const source = join(publicDir, "icon-source.png");

function luminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

async function main() {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Light: black shape where image is dark, transparent where image is light
  const lightData = Buffer.from(data);
  for (let i = 0; i < lightData.length; i += channels) {
    const r = lightData[i];
    const g = lightData[i + 1];
    const b = lightData[i + 2];
    const a = lightData[i + 3];
    const isShape = luminance(r, g, b) < 0.5 && a > 0;
    lightData[i] = 0;
    lightData[i + 1] = 0;
    lightData[i + 2] = 0;
    lightData[i + 3] = isShape ? 255 : 0;
  }
  await sharp(lightData, { raw: { width, height, channels } })
    .png()
    .toFile(join(publicDir, "icon-light.png"));

  // Dark: white shape where image is dark, transparent where image is light
  const darkData = Buffer.from(data);
  for (let i = 0; i < darkData.length; i += channels) {
    const r = darkData[i];
    const g = darkData[i + 1];
    const b = darkData[i + 2];
    const a = darkData[i + 3];
    const isShape = luminance(r, g, b) < 0.5 && a > 0;
    darkData[i] = 255;
    darkData[i + 1] = 255;
    darkData[i + 2] = 255;
    darkData[i + 3] = isShape ? 255 : 0;
  }
  await sharp(darkData, { raw: { width, height, channels } })
    .png()
    .toFile(join(publicDir, "icon-dark.png"));

  console.log("Iconos generados: icon-light.png (negro), icon-dark.png (blanco), fondo transparente.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
