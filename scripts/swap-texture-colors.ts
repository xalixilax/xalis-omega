#!/usr/bin/env bun
import { resolve } from "node:path";
import { swapTextureColors } from "../packages/lib/src/images/swap-colors";

const usage = `
Usage: bun run scripts/swap-texture-colors.ts <source.png> <palette.png | #hex,#hex,...> <output.png> [--expand]

Arguments:
  source   - Texture PNG whose colors are replaced
  palette  - Target palette PNG or a comma-separated list of hex colors
  output   - Output PNG path

Options:
  --expand - Interpolate the palette to match the source color count

The source palette is extracted from the texture and sorted by luminance.
Every source color is mapped to the target palette color at the same
relative luminance rank, so shading and details are preserved.

Example:
  bun run scripts/swap-texture-colors.ts jungle_planks.png note_block.png jungle_planks_note.png
  bun run scripts/swap-texture-colors.ts jungle_log.png "#5b8731,#8bab4f,#c2d67a" jungle_log_green.png --expand
`;

const main = async () => {
	const args = process.argv.slice(2);
	const [source, palette, output] = args.filter((arg) => !arg.startsWith("--"));
	const expand = args.includes("--expand");

	if (!source || !palette || !output) {
		console.error(usage);
		process.exit(1);
	}

	await swapTextureColors(resolve(source), palette, resolve(output), { expand });
};

if (import.meta.main) {
	main().catch((error: Error) => {
		console.error("Error:", error.message);
		process.exit(1);
	});
}