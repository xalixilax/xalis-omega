#!/usr/bin/env bun
/**
 * Generates alpha masks for every texture in
 * resourcepacks/xalis_enhanced_vanilla/textures/ (the alpha/ subfolder is
 * skipped as source). Each mask renders the source alpha channel as
 * luminance: transparent pixels -> black, colored (opaque) pixels -> white,
 * semi-transparent pixels -> gray. Output keeps the same file name and goes
 * to resourcepacks/xalis_enhanced_vanilla/textures/alpha/.
 *
 * Existing masks are never overwritten: if the output file already exists,
 * the source is skipped.
 */
import { readdir, mkdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const SRC_DIR = "resourcepacks/xalis_enhanced_vanilla/textures";
const OUT_DIR = join(SRC_DIR, "alpha");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && extname(e.name).toLowerCase() === ".png")
    .map((e) => e.name);

  if (files.length === 0) {
    console.log("no source textures found");
    return;
  }

  let written = 0;
  let skipped = 0;
  for (const name of files) {
    const out = join(OUT_DIR, name);
    try {
      await stat(out);
      skipped++;
      console.log(`skip (already exists): ${name}`);
      continue;
    } catch {
      // not generated yet
    }

    const { data, info } = await sharp(join(SRC_DIR, name))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const mask = Buffer.alloc(info.width * info.height);
    for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3];

    await sharp(mask, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
      .png()
      .toFile(out);
    written++;
    console.log(`alpha mask: ${name}`);
  }

  console.log(`RESULT: OK, ${written} written, ${skipped} skipped (already in alpha/)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
