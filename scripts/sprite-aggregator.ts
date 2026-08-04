#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import { join, resolve, basename } from "node:path";
import sharp from "sharp";

const SPRITES_PER_ROW = 16;

const usage = `
Usage: bun run scripts/sprite-aggregator.ts <input-dir> <output-png> <sprite-size>

Arguments:
  input-dir   - Directory containing PNG files
  output-png  - Output sprite sheet path
  sprite-size - Sprite size in pixels (16, 32, or 64)

Example:
  bun run scripts/sprite-aggregator.ts ./sprites ./output.png 32
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error(usage);
    process.exit(1);
  }

  const [inputDir, outputPath, spriteSizeStr] = args;
  const spriteSize = parseInt(spriteSizeStr, 10);

  if (![16, 32, 64].includes(spriteSize)) {
    console.error("Error: Sprite size must be 16, 32, or 64");
    process.exit(1);
  }

  const inputPath = resolve(inputDir);
  const outputFile = resolve(outputPath);

  // Get all PNG files
  const files = await readdir(inputPath);
  const pngFiles = files
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .map((f) => join(inputPath, f))
    .sort();

  if (pngFiles.length === 0) {
    console.error("Error: No PNG files found in input directory");
    process.exit(1);
  }

  console.log(`Found ${pngFiles.length} PNG files`);

  // Calculate grid dimensions (height calculated automatically)
  const rows = Math.ceil(pngFiles.length / SPRITES_PER_ROW);
  const sheetWidth = SPRITES_PER_ROW * spriteSize;
  const sheetHeight = rows * spriteSize;

  console.log(
    `Creating sprite sheet: ${sheetWidth}x${sheetHeight} (${SPRITES_PER_ROW}x${rows} sprites @ ${spriteSize}px)`
  );

  // Create composite operations
  const composites: sharp.OverlayOptions[] = [];

  // Process each sprite
  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const row = Math.floor(i / SPRITES_PER_ROW);
    const col = i % SPRITES_PER_ROW;

    try {
      const resizedImage = sharp(file).resize(spriteSize, spriteSize, {
        fit: "fill",
      });

      composites.push({
        input: await resizedImage.toBuffer(),
        left: col * spriteSize,
        top: row * spriteSize,
      });

      console.log(
        `  [${i + 1}/${pngFiles.length}] ${basename(file)} -> [${col}, ${row}]`
      );
    } catch (err: any) {
      console.error(`  Error processing ${basename(file)}:`, err.message);
    }
  }

  // Create sprite sheet with all images composited
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outputFile);

  console.log(`\nSprite sheet saved to: ${outputFile}`);
  console.log(`Dimensions: ${sheetWidth}x${sheetHeight} pixels`);
  console.log(
    `Grid: ${SPRITES_PER_ROW}×${rows} sprites @ ${spriteSize}x${spriteSize}px`
  );
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
