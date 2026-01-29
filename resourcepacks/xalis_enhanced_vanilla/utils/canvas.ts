import { createCanvas, loadImage } from "canvas";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type SplitOptions = {
	startIndex?: number;
	tileCount?: number;
	resolution?: number;
};

/**
 *
 * @param input Input image path
 * @param output Output folder path
 * @param resolution Resolution of the texture. For example 16x16.
 * @param gridWidth Width of the grid
 * @param gridHeight Height of the grid
 * @param options Possible options for the split function
 */
export async function split(
	input: string,
	output: string,
	gridWidth: number,
	gridHeight: number,
	options?: SplitOptions,
) {
	const resolution = options?.resolution ?? 16; // Default resolution is 16x16
	const tileCount = options?.tileCount ?? gridWidth * gridHeight;

	if (!existsSync(output)) {
		mkdirSync(output, { recursive: true });
	}

	const img = await loadImage(input);
	const canvas = createCanvas(16, 16);
	const ctx = canvas.getContext("2d");

	let index = options?.startIndex ?? 0;

	for (let y = 0; y < gridHeight; y++) {
		for (let x = 0; x < gridWidth; x++) {
			if (index >= tileCount) {
				return;
			}

			ctx.clearRect(0, 0, 16, 16);
			ctx.drawImage(
				img,
				x * -resolution,
				y * -resolution,
				img.width,
				img.height,
			);

			const buffer = canvas.toBuffer("image/png");
			const outputPath = join(output, `${index}.png`);
			writeFileSync(outputPath, buffer);
			//console.log(`✅ Extracted : ${outputPath}`);

			index++;
		}
	}
}

/**
 * Split OverlayTemplate Image into 17 tiles
 * @param input
 * @param output
 * @param options
 */
export async function splitOverlayTemplate(
	input: string,
	output: string,
	options?: Omit<SplitOptions, "tileCount">,
) {
	await split(input, output, 7, 3, { ...options, tileCount: 17 });
}
