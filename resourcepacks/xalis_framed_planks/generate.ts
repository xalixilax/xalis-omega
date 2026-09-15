import fs from "node:fs";
import path from "node:path";
import { safeWriteFiles, type Files } from "@lib/files/utils";
import { minecraftBlockCategories } from "@lib/minecraft/blocks-categories";
import { config } from "./config";

const packRoot = path.dirname(new URL(import.meta.url).pathname);

/**
 * Every plank wood that has a slab: `oak_planks` becomes `oak`, `bamboo_planks`
 * becomes `bamboo`. `bamboo_mosaic` is excluded because it has no slab block.
 */
export function framedWoods(): string[] {
	return minecraftBlockCategories.woods.planks
		.filter((block) => block.endsWith("_planks"))
		.map((block) => block.slice(0, -"_planks".length));
}

export function generate() {
	const files: Files[] = [];

	for (const wood of framedWoods()) {
		files.push(
			{
				path: `assets/minecraft/blockstates/${wood}_slab.json`,
				content: {
					variants: {
						"type=bottom": { model: `minecraft:block/${wood}_slab` },
						"type=double": {
							model: `minecraft:block/${wood}_framed_planks`,
						},
						"type=top": { model: `minecraft:block/${wood}_slab_top` },
					},
				},
			},
			{
				path: `assets/minecraft/models/block/${wood}_framed_planks.json`,
				content: {
					parent: "minecraft:block/cube_all",
					textures: { all: `minecraft:block/${wood}_framed_planks` },
				},
			},
		);
	}

	safeWriteFiles(config.build.output, files);
	copyTextures();
}

function copyTextures() {
	const output = path.join(
		config.build.output,
		"assets/minecraft/textures/block",
	);

	for (const wood of framedWoods()) {
		const name = `${wood}_framed_planks`;
		const source = path.join(packRoot, "textures", `${name}.png`);

		if (!fs.existsSync(source)) {
			continue;
		}

		fs.mkdirSync(output, { recursive: true });
		fs.copyFileSync(source, path.join(output, `${name}.png`));
	}
}