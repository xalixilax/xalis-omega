import { CtmPropertiesOverlay } from "./types/ctm/ctm";
import fs from "node:fs";

type CtmPacks = {
	[key: string]: {
		[key: string]: {
			[key: string]: CtmPropertiesOverlay[];
		};
	};
};

export const files: CtmPacks = {
	bricks: {
		minecraft: {
			stone_bricks: [
				new CtmPropertiesOverlay({
					connectBlocks: "stone_bricks mossy_stone_bricks cracked_stone_bricks",
				}),
			],
			bricks: [new CtmPropertiesOverlay()],
			cracked_deepslate_bricks: [new CtmPropertiesOverlay()],
			cracked_nether_bricks: [new CtmPropertiesOverlay()],
			cracked_polished_blackstone_bricks: [
				new CtmPropertiesOverlay({
					connectBlocks:
						"polished_blackstone_bricks cracked_polished_blackstone_bricks",
				}),
			],
			cut_red_sandstone: [
				new CtmPropertiesOverlay({
					faces: ["sides"],
				}),
			],
			cut_sandstone: [new CtmPropertiesOverlay()],
			deepslate_bricks: [new CtmPropertiesOverlay()],
			end_stone_bricks: [new CtmPropertiesOverlay()],
			mossy_stone_bricks: [new CtmPropertiesOverlay()],
			mud_bricks: [new CtmPropertiesOverlay()],
			nether_bricks: [new CtmPropertiesOverlay()],
			polished_blackstone_bricks: [new CtmPropertiesOverlay()],
			red_nether_bricks: [new CtmPropertiesOverlay()],
		},
	},
	grasses: {
		minecraft: {
			crimson_nylium: [
				new CtmPropertiesOverlay({
					faces: ["top"],
					tiles: "0-16",
				}),
				new CtmPropertiesOverlay({
					faces: ["sides"],
					tiles: "20-36",
				}),
			],
			warped_nylium: [
				new CtmPropertiesOverlay({
					faces: ["top"],
					tiles: "0-16",
				}),
				new CtmPropertiesOverlay({
					faces: ["sides"],
					tiles: "20-36",
				}),
			],
			grass_block: [new CtmPropertiesOverlay()], // TODO
			moss_block: [new CtmPropertiesOverlay()],
			mycelium: [
				new CtmPropertiesOverlay({
					tiles: "0-16",
					faces: ["top"],
				}),
				new CtmPropertiesOverlay({
					tiles: "20-36",
					faces: ["sides"],
				}),
			],
			hay_block: [new CtmPropertiesOverlay()],
		},
	},
	dusts: {
		minecraft: {
			gravel: [new CtmPropertiesOverlay()],
			sand: [new CtmPropertiesOverlay()],
			red_sand: [new CtmPropertiesOverlay()],
		},
	},
	dirts: {
		minecraft: {
			coarse_dirt: [new CtmPropertiesOverlay()],
			podzol: [
				new CtmPropertiesOverlay({
					tiles: "0-16",
					faces: ["top"],
				}),
				new CtmPropertiesOverlay({
					tiles: "20-36",
					faces: ["sides"],
				}),
			],
			dirt_rooted: [new CtmPropertiesOverlay()],
			mud: [new CtmPropertiesOverlay()],
			nether_gold_ore: [new CtmPropertiesOverlay()],
			nether_quartz_ore: [new CtmPropertiesOverlay()],
			netherrack: [
				new CtmPropertiesOverlay({
					connectBlocks: "netherrack nether_quartz_ore nether_gold_ore",
				}),
			],
			packed_mud: [new CtmPropertiesOverlay()],
			dirt: [
				new CtmPropertiesOverlay({
					connectBlocks: "dirt rooted_dirt",
				}),
			],
			mangrove_roots: [
				new CtmPropertiesOverlay({
					connectTiles: "mangrove_roots_top muddy_mangrove_roots_top",
				}),
			],
		},
	},
	stones: {
		minecraft: {
			andesite: [new CtmPropertiesOverlay()],
			basalt: [
				new CtmPropertiesOverlay({
					connectTiles: "basalt_top",
					tiles: "0-16",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: "basalt:axis=y",
					tiles: "20-36",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: "basalt:axis=x",
					tiles: "40-56",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: "basalt:axis=z",
					tiles: "40-56",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: "basalt:axis=none",
					tiles: "60-76",
					faces: ["top", "bottom"],
				}),
			],
			calcite: [new CtmPropertiesOverlay()],
			diorite: [new CtmPropertiesOverlay()],
			granite: [new CtmPropertiesOverlay()],
			coal_ore: [new CtmPropertiesOverlay()],
			copper_ore: [new CtmPropertiesOverlay()],
			diamond_ore: [new CtmPropertiesOverlay()],
			emerald_ore: [new CtmPropertiesOverlay()],
			gold_ore: [new CtmPropertiesOverlay()],
			iron_ore: [new CtmPropertiesOverlay()],
			lapis_ore: [new CtmPropertiesOverlay()],
			redstone_ore: [new CtmPropertiesOverlay()],
			stone: [
				new CtmPropertiesOverlay({
					connectBlocks:
						"stone coal_ore copper_ore iron_ore gold_ore diamond_ore redstone_ore lapis_ore emerald_ore",
				}),
			],
			amethyst: [
				new CtmPropertiesOverlay({
					connectBlocks: "amethyst_block budding_amethyst",
				}),
			],
			mossy_cobblestone: [new CtmPropertiesOverlay()],
			cobblestone: [
				new CtmPropertiesOverlay({
					connectBlocks: "cobblestone mossy_cobblestone",
				}),
			],
			deepslate_coal_ore: [new CtmPropertiesOverlay()],
			deepslate_copper_ore: [new CtmPropertiesOverlay()],
			deepslate_diamond_ore: [new CtmPropertiesOverlay()],
			deepslate_emerald_ore: [new CtmPropertiesOverlay()],
			deepslate_gold_ore: [new CtmPropertiesOverlay()],
			deepslate_iron_ore: [new CtmPropertiesOverlay()],
			deepslate_lapis_ore: [new CtmPropertiesOverlay()],
			deepslate_redstone_ore: [new CtmPropertiesOverlay()],
			deepslate: [
				new CtmPropertiesOverlay({
					connectBlocks:
						"deepslate deepslate_copper_ore deepslate_iron_ore deepslate_gold_ore deepslate_diamond_ore deepslate_redstone_ore deepslate_lapis_ore deepslate_coal_ore deepslate_emerald_ore",
				}),
			],
		},
	},
	manual: {
		minecraft: {
			loom: [
				new CtmPropertiesOverlay({
					matchBlocks: "bookshelf",
					faces: ["sides"],
				}),
			],
			mangrove_log: [
				new CtmPropertiesOverlay({
					connectBlocks: "mangrove_log mangrove_wood",
					matchBlocks: "mangrove_roots",
				}),
			],
		},
	},
};

const netherrack = new CtmPropertiesOverlay();
const reinforced_deepslate = new CtmPropertiesOverlay();
//sand
//snow
//snowy_flower
//snowy_grass
//snowy_leaves
//snowy_grass_block
// random stoneBricks
//nylium weirdness

function writeModToFiles() {
	let folderCreated = 0;
	for (const [key, value] of Object.entries(files)) {
		for (const [namespace, blocks] of Object.entries(value)) {
			for (const [block, properties] of Object.entries(blocks)) {
				const path = `./dist/assets/minecraft/optifine/ctm/${folderCreated.toString().padStart(4, "0")}_${block}`;

				if (!fs.existsSync(path)) {
					fs.mkdirSync(path, {
						recursive: true,
					});
				}

				for (const property of properties) {
					property.matchTiles = block;


					const content = property.toString();
          const fileNumber = property.tiles.split("-")[0];
					fs.writeFile(`${path}/${fileNumber}_${block}.properties`, content, (err) => {
						if (err) {
							console.error(err);
						}
					});
				}

				folderCreated++;
			}
		}
	}
}

writeModToFiles();
