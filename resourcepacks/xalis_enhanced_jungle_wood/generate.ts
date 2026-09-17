import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { globalConfig } from "@global-config";
import { swapColors, type Rgb } from "@lib/images/swap-colors";
import { config } from "./config";

const noteBlockPalette: Rgb[] = [
	[0x29, 0x28, 0x20],
	[0x41, 0x28, 0x18],
	[0x5a, 0x34, 0x20],
	[0x5a, 0x3c, 0x29],
	[0x7b, 0x50, 0x39],
	[0x94, 0x5d, 0x41],
];

const jungleTextures = [
	"block/jungle_log.png",
	"block/jungle_log_top.png",
	"block/jungle_planks.png",
	"block/stripped_jungle_log.png",
	"block/stripped_jungle_log_top.png",
	"block/jungle_door_bottom.png",
	"block/jungle_door_top.png",
	"block/jungle_trapdoor.png",
	"block/jungle_sign.png",
	"block/jungle_hanging_sign.png",
	"block/jungle_shelf.png",
	"item/jungle_boat.png",
	"item/jungle_chest_boat.png",
	"item/jungle_door.png",
	"item/jungle_sign.png",
	"item/jungle_hanging_sign.png",
	"entity/boat/jungle.png",
	"entity/chest_boat/jungle.png",
	"gui/signs/jungle.png",
	"gui/hanging_signs/jungle.png",
];

const sourceUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/${globalConfig.minecraftVersion}/assets/minecraft/textures`;

export async function generate(output: string = config.build.output) {
	for (const texture of jungleTextures) {
		const response = await fetch(`${sourceUrl}/${texture}`);
		if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${texture}`);

		const swapped = await swapColors(Buffer.from(await response.arrayBuffer()), noteBlockPalette, {
			expand: true,
		});

		const target = join(output, "assets/minecraft/textures", texture);
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, swapped);
	}

	console.log(`Generated ${jungleTextures.length} jungle wood textures into ${output}`);
}