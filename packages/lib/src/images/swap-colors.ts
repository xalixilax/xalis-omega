import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

export type Rgb = [number, number, number];

export interface SwapOptions {
	expand?: boolean;
}

const luminance = ([r, g, b]: Rgb): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const key = ([r, g, b]: Rgb): string => `${r},${g},${b}`;

const hexToRgb = (hex: string): Rgb => {
	const value = hex.trim().replace(/^#/, "");
	if (!/^[0-9a-f]{6}$/i.test(value)) throw new Error(`Invalid hex color: ${hex}`);
	return [
		Number.parseInt(value.slice(0, 2), 16),
		Number.parseInt(value.slice(2, 4), 16),
		Number.parseInt(value.slice(4, 6), 16),
	];
};

const uniqueColors = (data: Buffer, channels: number): Rgb[] => {
	const colors = new Map<string, Rgb>();
	for (let i = 0; i < data.length; i += channels) {
		if (data[i + 3] === 0) continue;
		const rgb: Rgb = [data[i]!, data[i + 1]!, data[i + 2]!];
		colors.set(key(rgb), rgb);
	}
	return [...colors.values()];
};

const read = async (input: string | Buffer) =>
	sharp(input)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

export const extractPalette = async (input: string | Buffer): Promise<Rgb[]> => {
	const { data, info } = await read(input);
	return uniqueColors(data, info.channels).sort((a, b) => luminance(a) - luminance(b));
};

export const parsePalette = async (palette: string): Promise<Rgb[]> => {
	if (!palette.endsWith(".png")) {
		return palette.split(",").map(hexToRgb);
	}
	return extractPalette(palette);
};

export const expandPalette = (palette: Rgb[], count: number): Rgb[] => {
	if (count <= palette.length) return palette;
	return Array.from({ length: count }, (_, index) => {
		const position = (index / (count - 1)) * (palette.length - 1);
		const low = Math.floor(position);
		const high = Math.min(low + 1, palette.length - 1);
		const t = position - low;
		const [lr, lg, lb] = palette[low]!;
		const [hr, hg, hb] = palette[high]!;
		return [
			Math.round(lr + (hr - lr) * t),
			Math.round(lg + (hg - lg) * t),
			Math.round(lb + (hb - lb) * t),
		];
	});
};

/**
 * Replaces every opaque color of the input with a target palette color at the
 * same relative luminance rank. Transparency is preserved.
 */
export const swapColors = async (
	input: string | Buffer,
	palette: Rgb[],
	options: SwapOptions = {},
): Promise<Buffer> => {
	if (palette.length === 0) throw new Error("Palette is empty");

	const { data, info } = await read(input);
	const sorted = uniqueColors(data, info.channels).sort((a, b) => luminance(a) - luminance(b));
	const target = options.expand ? expandPalette(palette, sorted.length) : palette;

	const mapping = new Map<string, Rgb>();
	sorted.forEach((color, index) => {
		const position = sorted.length === 1 ? 0 : index / (sorted.length - 1);
		mapping.set(key(color), target[Math.round(position * (target.length - 1))]!);
	});

	const result = Buffer.from(data);
	for (let i = 0; i < result.length; i += info.channels) {
		if (result[i + 3] === 0) continue;
		const mapped = mapping.get(key([result[i]!, result[i + 1]!, result[i + 2]!]));
		if (!mapped) continue;
		result[i] = mapped[0];
		result[i + 1] = mapped[1];
		result[i + 2] = mapped[2];
	}

	return sharp(result, {
		raw: { width: info.width, height: info.height, channels: info.channels },
	})
		.png()
		.toBuffer();
};

export const swapTextureColors = async (
	source: string,
	palette: string,
	output: string,
	options: SwapOptions = {},
): Promise<void> => {
	const target = await parsePalette(palette);
	const swapped = await swapColors(source, target, options);
	await mkdir(dirname(output), { recursive: true });
	await writeFile(output, swapped);
	console.log(`Saved ${output}`);
};