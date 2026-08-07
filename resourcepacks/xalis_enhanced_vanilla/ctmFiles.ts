import path from "node:path";
import { extractTextures } from "./scripts/templateToTiles";
import {
	type CtmPropertiesBase,
	CtmPropertiesCtmCompact,
	CtmPropertiesFixed,
	CtmPropertiesOverlay,
	CtmPropertiesOverlayCtm,
	CtmPropertiesOverlayFixed,
	CtmPropertiesOverlayRandom,
	CtmPropertiesRandom,
	CtmPropertiesVertical,
} from "./types/ctm/ctm";
import fs from "node:fs";
import { config } from "./resourcpack.config";
import {
	flattenMinecraftBlocksArgs,
	minecraftBlocks,
	type MinecraftBlocks,
} from "./utils/ctmBlocks";

type Block = string;
type Namespace = string;

type CtmPacks = {
	[key in MinecraftBlocks]: {
		overlays: Set<string> | null;
		minecraft: {
			[key: Block]: CtmPropertiesBase[];
		};
		modded?: {
			[key: Namespace]: {
				[key: Block]: CtmPropertiesBase[];
			};
		};
	};
};

/**
 * Get the number of blocks in the ctm files. Every folder has a number that is used to sort rendering order and avoid conflicting overlays.
 * @param files CtmPacks object
 * @returns The count of blocks in the ctm files
 */
export function getCtmPacksBlockCount(files: Partial<CtmPacks>) {
	let count = 0;

	// Loop over all the groups in the files object
	for (const [_, keys] of Object.entries(files)) {
		// Get the count for the goups
		count += Object.keys(keys.minecraft).length;

		// Loop over the modded groups
		if (keys.modded) {
			for (const [_, namespace] of Object.entries(keys.modded)) {
				count += Object.keys(namespace).length;
			}
		}
	}
	return count;
}

const bricksOverlay = new Set([
	"andesite",
	"bricks",
	"cobblestone",
	"diorite",
	"granite",
	"mossy_cobblestone",
	"polished_andesite",
	"polished_diorite",
	"polished_granite",
	"stone",
	"terracotta",
	"stone_bricks",
]);

const snowyBiomes =
	"snowy_beach snowy_plains snowy_slopes ice_spikes snowy_taiga frozen_river grove jagged_peaks frozen_peaks terralith:alpha_islands_winter terralith:emerald_peaks terralith:frozen_cliffs terralith:glacial_chasm terralith:gravel_desert terralith:ice_marsh terralith:scarlet_mountains terralith:skylands_winter terralith:snowy_badlands terralith:snowy_maple_forest terralith:snowy_shield terralith:wintry_forest terralith:wintry_lowlands";

const grassMatchBlocks = flattenMinecraftBlocksArgs(
	minecraftBlocks.grasses,
	minecraftBlocks.soil,
	minecraftBlocks.stones,
);
const soilConnectBlocks = flattenMinecraftBlocksArgs(minecraftBlocks.soil);
const stoneConnectBlocks = flattenMinecraftBlocksArgs(minecraftBlocks.stones);
const masonryConnectBlocks = flattenMinecraftBlocksArgs(
	minecraftBlocks.masonry_blocks,
);
const miscConnectBlocks = flattenMinecraftBlocksArgs(
	minecraftBlocks.misc_blocks,
);

export const files: Partial<CtmPacks> = {
	grasses: {
		overlays: grassMatchBlocks,
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
				// new CtmPropertiesOverlay({
				// 	tiles: "20-36",
				// 	faces: ["sides"],
				// 	// connect: "block",
				// 	connectTiles: "warped_nylium_side",
				// 	biomes: "the_end small_end_islands end_midlands end_highlands end_barrens the_void",
				// }),
			],
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
			grass_block: [
				new CtmPropertiesOverlay({
					tiles: "0-16",
					faces: ["top"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintBlock: "grass_block",
					tintIndex: 0,
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					tiles: "0-16",
					faces: ["top"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintBlock: "grass_block",
					tintIndex: 0,
					heights: "0-61",
					biomes:
						"snowy_tundra snowy_mountains ice_spikes snowy_taiga_hills snowy_taiga snowy_taiga_mountains frozen_river snowy_beach snowy_plains grove snowy_slopes jagged_peaks frozen_peaks terralith:alpha_islands_winter terralith:alpha_islands_winter terralith:emerald_peaks terralith:frozen_cliffs terralith:glacial_chasm terralith:gravel_desert terralith:ice_marsh terralith:scarlet_mountains terralith:skylands_winter terralith:snowy_badlands terralith:snowy_maple_forest terralith:snowy_shield terralith:wintry_forest terralith:wintry_lowlands",
				}),
				new CtmPropertiesOverlay({
					tiles: "20-36",
					faces: ["sides"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					heights: "0-61",
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					tiles: "40-56",
					faces: ["sides"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintBlock: "grass_block",
					tintIndex: 0,
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					tiles: "60-76",
					matchBlocks: "dirt_path",
					faces: ["top"],
					connectBlocks: new Set(["grass_block"]),
					tintBlock: "grass_block",
					tintIndex: 0,
					biomes:
						snowyBiomes,
				}),

				new CtmPropertiesOverlay({
					// sides axis x
					matchBlocks:
						"oak_log:axis=x stripped_oak_log:axis=x oak_wood:axis=x stripped_oak_wood:axis=x spruce_log:axis=x stripped_spruce_log:axis=x spruce_wood:axis=x stripped_spruce_wood:axis=x birch_log:axis=x stripped_birch_log:axis=x birch_wood:axis=x stripped_birch_wood:axis=x jungle_log:axis=x stripped_jungle_log:axis=x jungle_wood:axis=x stripped_jungle_wood:axis=x acacia_log:axis=x stripped_acacia_log:axis=x acacia_wood:axis=x stripped_acacia_wood:axis=x dark_oak_log:axis=x stripped_dark_oak_log:axis=x dark_oak_wood:axis=x stripped_dark_oak_wood:axis=x mangrove_log:axis=x stripped_mangrove_log:axis=x mangrove_wood:axis=x stripped_mangrove_wood:axis=x crimson_stem:axis=x stripped_crimson_stem:axis=x crimson_hyphae:axis=x stripped_crimson_hyphae:axis=x warped_stem:axis=x stripped_warped_stem:axis=x warped_hyphae:axis=x stripped_warped_hyphae:axis=x",
					tiles: "20-36",
					faces: ["north", "south", "top", "bottom"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// sides axis y
					matchBlocks:
						"oak_log:axis=y stripped_oak_log:axis=y oak_wood:axis=y stripped_oak_wood:axis=y spruce_log:axis=y stripped_spruce_log:axis=y spruce_wood:axis=y stripped_spruce_wood:axis=y birch_log:axis=y stripped_birch_log:axis=y birch_wood:axis=y stripped_birch_wood:axis=y jungle_log:axis=y stripped_jungle_log:axis=y jungle_wood:axis=y stripped_jungle_wood:axis=y acacia_log:axis=y stripped_acacia_log:axis=y acacia_wood:axis=y stripped_acacia_wood:axis=y dark_oak_log:axis=y stripped_dark_oak_log:axis=y dark_oak_wood:axis=y stripped_dark_oak_wood:axis=y mangrove_log:axis=y stripped_mangrove_log:axis=y mangrove_wood:axis=y stripped_mangrove_wood:axis=y crimson_stem:axis=y stripped_crimson_stem:axis=y crimson_hyphae:axis=y stripped_crimson_hyphae:axis=y warped_stem:axis=y stripped_warped_stem:axis=y warped_hyphae:axis=y stripped_warped_hyphae:axis=y ",
					tiles: "20-36",
					faces: ["sides"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// sides axis z
					matchBlocks:
						"oak_log:axis=z stripped_oak_log:axis=z oak_wood:axis=z stripped_oak_wood:axis=z spruce_log:axis=z stripped_spruce_log:axis=z spruce_wood:axis=z stripped_spruce_wood:axis=z birch_log:axis=z stripped_birch_log:axis=z birch_wood:axis=z stripped_birch_wood:axis=z jungle_log:axis=z stripped_jungle_log:axis=z jungle_wood:axis=z stripped_jungle_wood:axis=z acacia_log:axis=z stripped_acacia_log:axis=z acacia_wood:axis=z stripped_acacia_wood:axis=z dark_oak_log:axis=z stripped_dark_oak_log:axis=z dark_oak_wood:axis=z stripped_dark_oak_wood:axis=z mangrove_log:axis=z stripped_mangrove_log:axis=z mangrove_wood:axis=z stripped_mangrove_wood:axis=z crimson_stem:axis=z stripped_crimson_stem:axis=z crimson_hyphae:axis=z stripped_crimson_hyphae:axis=z warped_stem:axis=z stripped_warped_stem:axis=z warped_hyphae:axis=z stripped_warped_hyphae:axis=z ",
					tiles: "20-36",
					faces: ["top", "bottom", "east", "west"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					biomes:
						snowyBiomes,
				}),

				new CtmPropertiesOverlay({
					// top axis x
					matchBlocks:
						"oak_log:axis=x stripped_oak_log:axis=x oak_wood:axis=x stripped_oak_wood:axis=x spruce_log:axis=x stripped_spruce_log:axis=x spruce_wood:axis=x stripped_spruce_wood:axis=x birch_log:axis=x stripped_birch_log:axis=x birch_wood:axis=x stripped_birch_wood:axis=x jungle_log:axis=x stripped_jungle_log:axis=x jungle_wood:axis=x stripped_jungle_wood:axis=x acacia_log:axis=x stripped_acacia_log:axis=x acacia_wood:axis=x stripped_acacia_wood:axis=x dark_oak_log:axis=x stripped_dark_oak_log:axis=x dark_oak_wood:axis=x stripped_dark_oak_wood:axis=x mangrove_log:axis=x stripped_mangrove_log:axis=x mangrove_wood:axis=x stripped_mangrove_wood:axis=x crimson_stem:axis=x stripped_crimson_stem:axis=x crimson_hyphae:axis=x stripped_crimson_hyphae:axis=x warped_stem:axis=x stripped_warped_stem:axis=x warped_hyphae:axis=x stripped_warped_hyphae:axis=x",
					tiles: "0-16",
					faces: ["east"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// top axis y
					matchBlocks:
						"oak_log:axis=y stripped_oak_log:axis=y oak_wood:axis=y stripped_oak_wood:axis=y spruce_log:axis=y stripped_spruce_log:axis=y spruce_wood:axis=y stripped_spruce_wood:axis=y birch_log:axis=y stripped_birch_log:axis=y birch_wood:axis=y stripped_birch_wood:axis=y jungle_log:axis=y stripped_jungle_log:axis=y jungle_wood:axis=y stripped_jungle_wood:axis=y acacia_log:axis=y stripped_acacia_log:axis=y acacia_wood:axis=y stripped_acacia_wood:axis=y dark_oak_log:axis=y stripped_dark_oak_log:axis=y dark_oak_wood:axis=y stripped_dark_oak_wood:axis=y mangrove_log:axis=y stripped_mangrove_log:axis=y mangrove_wood:axis=y stripped_mangrove_wood:axis=y crimson_stem:axis=y stripped_crimson_stem:axis=y crimson_hyphae:axis=y stripped_crimson_hyphae:axis=y warped_stem:axis=y stripped_warped_stem:axis=y warped_hyphae:axis=y stripped_warped_hyphae:axis=y ",
					tiles: "0-16",
					faces: ["top"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// top axis z
					matchBlocks:
						"oak_log:axis=z stripped_oak_log:axis=z oak_wood:axis=z stripped_oak_wood:axis=z spruce_log:axis=z stripped_spruce_log:axis=z spruce_wood:axis=z stripped_spruce_wood:axis=z birch_log:axis=z stripped_birch_log:axis=z birch_wood:axis=z stripped_birch_wood:axis=z jungle_log:axis=z stripped_jungle_log:axis=z jungle_wood:axis=z stripped_jungle_wood:axis=z acacia_log:axis=z stripped_acacia_log:axis=z acacia_wood:axis=z stripped_acacia_wood:axis=z dark_oak_log:axis=z stripped_dark_oak_log:axis=z dark_oak_wood:axis=z stripped_dark_oak_wood:axis=z mangrove_log:axis=z stripped_mangrove_log:axis=z mangrove_wood:axis=z stripped_mangrove_wood:axis=z crimson_stem:axis=z stripped_crimson_stem:axis=z crimson_hyphae:axis=z stripped_crimson_hyphae:axis=z warped_stem:axis=z stripped_warped_stem:axis=z warped_hyphae:axis=z stripped_warped_hyphae:axis=z ",
					tiles: "0-16",
					faces: ["south"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),

				new CtmPropertiesOverlay({
					// z sides axis x overlay
					matchBlocks:
						"oak_log:axis=x stripped_oak_log:axis=x oak_wood:axis=x stripped_oak_wood:axis=x spruce_log:axis=x stripped_spruce_log:axis=x spruce_wood:axis=x stripped_spruce_wood:axis=x birch_log:axis=x stripped_birch_log:axis=x birch_wood:axis=x stripped_birch_wood:axis=x jungle_log:axis=x stripped_jungle_log:axis=x jungle_wood:axis=x stripped_jungle_wood:axis=x acacia_log:axis=x stripped_acacia_log:axis=x acacia_wood:axis=x stripped_acacia_wood:axis=x dark_oak_log:axis=x stripped_dark_oak_log:axis=x dark_oak_wood:axis=x stripped_dark_oak_wood:axis=x mangrove_log:axis=x stripped_mangrove_log:axis=x mangrove_wood:axis=x stripped_mangrove_wood:axis=x crimson_stem:axis=x stripped_crimson_stem:axis=x crimson_hyphae:axis=x stripped_crimson_hyphae:axis=x warped_stem:axis=x stripped_warped_stem:axis=x warped_hyphae:axis=x stripped_warped_hyphae:axis=x",
					tiles: "40-56",
					faces: ["north", "south", "top", "bottom"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// z sides axis y overlay
					matchBlocks:
						"oak_log:axis=y stripped_oak_log:axis=y oak_wood:axis=y stripped_oak_wood:axis=y spruce_log:axis=y stripped_spruce_log:axis=y spruce_wood:axis=y stripped_spruce_wood:axis=y birch_log:axis=y stripped_birch_log:axis=y birch_wood:axis=y stripped_birch_wood:axis=y jungle_log:axis=y stripped_jungle_log:axis=y jungle_wood:axis=y stripped_jungle_wood:axis=y acacia_log:axis=y stripped_acacia_log:axis=y acacia_wood:axis=y stripped_acacia_wood:axis=y dark_oak_log:axis=y stripped_dark_oak_log:axis=y dark_oak_wood:axis=y stripped_dark_oak_wood:axis=y mangrove_log:axis=y stripped_mangrove_log:axis=y mangrove_wood:axis=y stripped_mangrove_wood:axis=y crimson_stem:axis=y stripped_crimson_stem:axis=y crimson_hyphae:axis=y stripped_crimson_hyphae:axis=y warped_stem:axis=y stripped_warped_stem:axis=y warped_hyphae:axis=y stripped_warped_hyphae:axis=y ",
					tiles: "40-56",
					faces: ["sides"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),
				new CtmPropertiesOverlay({
					// z sides axis z overlay
					matchBlocks:
						"oak_log:axis=z stripped_oak_log:axis=z oak_wood:axis=z stripped_oak_wood:axis=z spruce_log:axis=z stripped_spruce_log:axis=z spruce_wood:axis=z stripped_spruce_wood:axis=z birch_log:axis=z stripped_birch_log:axis=z birch_wood:axis=z stripped_birch_wood:axis=z jungle_log:axis=z stripped_jungle_log:axis=z jungle_wood:axis=z stripped_jungle_wood:axis=z acacia_log:axis=z stripped_acacia_log:axis=z acacia_wood:axis=z stripped_acacia_wood:axis=z dark_oak_log:axis=z stripped_dark_oak_log:axis=z dark_oak_wood:axis=z stripped_dark_oak_wood:axis=z mangrove_log:axis=z stripped_mangrove_log:axis=z mangrove_wood:axis=z stripped_mangrove_wood:axis=z crimson_stem:axis=z stripped_crimson_stem:axis=z crimson_hyphae:axis=z stripped_crimson_hyphae:axis=z warped_stem:axis=z stripped_warped_stem:axis=z warped_hyphae:axis=z stripped_warped_hyphae:axis=z ",
					tiles: "40-56",
					faces: ["top", "bottom", "east", "west"],
					connectBlocks: new Set(["grass_block:snowy=false"]),
					tintIndex: 0,
					tintBlock: "grass_block",
					biomes:
						snowyBiomes,
				}),
			],
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
			moss: [new CtmPropertiesOverlay()],
			rooted_dirt: [new CtmPropertiesOverlay()],
			dirt: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["dirt", "rooted_dirt"]),
				}),
			],
			gravel: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["gravel", "suspicious_gravel"]),
				}),
			],
			sand: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["sand", "suspicious_sand"]),
				}),
			],
			red_sand: [new CtmPropertiesOverlay()],
			coarse_dirt: [new CtmPropertiesOverlay()],
			// nether_gold_ore: [new CtmPropertiesOverlay()],
			// nether_quartz_ore: [new CtmPropertiesOverlay()],
			netherrack: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set([
						"netherrack",
						"nether_quartz_ore",
						"nether_gold_ore",
					]),
				}),
			],
			packed_mud: [new CtmPropertiesOverlay()],
			mangrove_roots: [
				new CtmPropertiesOverlay({
					tiles: "0-16",
					connectTiles: "mangrove_roots_top muddy_mangrove_roots_top",
				}),
				new CtmPropertiesOverlay({
					tiles: "20-36",
					connectTiles: "mangrove_roots_side muddy_mangrove_roots_side",
				}),
			],
			mud: [new CtmPropertiesOverlay()],
			andesite: [new CtmPropertiesOverlay()],
			basalt: [
				new CtmPropertiesOverlay({
					connectTiles: "basalt_top",
					tiles: "0-16",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: new Set(["basalt:axis=y"]),
					tiles: "20-36",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: new Set(["basalt:axis=x"]),
					tiles: "40-56",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: new Set(["basalt:axis=z"]),
					tiles: "40-56",
				}),
				new CtmPropertiesOverlay({
					connectTiles: "basalt_side",
					connectBlocks: new Set(["basalt:axis=none"]),
					tiles: "20-36",
					faces: ["top", "bottom"],
				}),
			],
			calcite: [new CtmPropertiesOverlay()],
			diorite: [new CtmPropertiesOverlay()],
			granite: [new CtmPropertiesOverlay()],
			// coal_ore: [new CtmPropertiesOverlay()],
			// copper_ore: [new CtmPropertiesOverlay()],
			// diamond_ore: [new CtmPropertiesOverlay()],
			// emerald_ore: [new CtmPropertiesOverlay()],
			// gold_ore: [new CtmPropertiesOverlay()],
			// iron_ore: [new CtmPropertiesOverlay()],
			// lapis_ore: [new CtmPropertiesOverlay()],
			// redstone_ore: [new CtmPropertiesOverlay()],
			stone: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set([
						"stone",
						"coal_ore",
						"copper_ore",
						"iron_ore",
						"gold_ore",
						"diamond_ore",
						"redstone_ore",
						"lapis_ore",
						"emerald_ore",
					]),
				}),
			],
			amethyst: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["amethyst_block", "budding_amethyst"]),
				}),
			],
			mossy_cobblestone: [new CtmPropertiesOverlay()],
			cobblestone: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["cobblestone", "mossy_cobblestone"]),
				}),
			],
			// deepslate_coal_ore: [new CtmPropertiesOverlay()],
			// deepslate_copper_ore: [new CtmPropertiesOverlay()],
			// deepslate_diamond_ore: [new CtmPropertiesOverlay()],
			// deepslate_emerald_ore: [new CtmPropertiesOverlay()],
			// deepslate_gold_ore: [new CtmPropertiesOverlay()],
			// deepslate_iron_ore: [new CtmPropertiesOverlay()],
			// deepslate_lapis_ore: [new CtmPropertiesOverlay()],
			// deepslate_redstone_ore: [new CtmPropertiesOverlay()],
			deepslate: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set([
						"deepslate",
						"deepslate_copper_ore",
						"deepslate_iron_ore",
						"deepslate_gold_ore",
						"deepslate_diamond_ore",
						"deepslate_redstone_ore",
						"deepslate_lapis_ore",
						"deepslate_coal_ore",
						"deepslate_emerald_ore",
					]),
				}),
			],
		},
	},
	masonry_blocks: {
		overlays: masonryConnectBlocks,
		minecraft: {
			stone_bricks: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set([
						"stone_bricks",
						"mossy_stone_bricks",
						"cracked_stone_bricks",
					]),
				}),
			],
			mossy_stone_bricks: [
				new CtmPropertiesOverlay({
					matchBlocks: "stone_bricks cracked_stone_bricks",
					connectBlocks: new Set(["mossy_stone_bricks"]),
				}),
			],
			bricks: [new CtmPropertiesOverlay()],
			cracked_deepslate_bricks: [new CtmPropertiesOverlay()],
			cracked_nether_bricks: [new CtmPropertiesOverlay()],
			cracked_polished_blackstone_bricks: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set([
						"polished_blackstone_bricks",
						"cracked_polished_blackstone_bricks",
					]),
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
			mud_bricks: [new CtmPropertiesOverlay()],
			nether_bricks: [new CtmPropertiesOverlay()],
			polished_blackstone_bricks: [new CtmPropertiesOverlay()],
			red_nether_bricks: [new CtmPropertiesOverlay()],
		},
	},
	misc_blocks: {
		overlays: null,
		minecraft: {
			loom: [
				new CtmPropertiesOverlay({
					matchBlocks: "bookshelf",
					faces: ["sides"],
				}),
			],
			mangrove_log: [
				new CtmPropertiesOverlay({
					connectBlocks: new Set(["mangrove_log", "mangrove_wood"]),
					matchBlocks: "mangrove_roots",
				}),
			],
			snowy_leaves: [
				new CtmPropertiesOverlayCtm({
					tiles: "0-46",
					faces: ["sides"],
					matchBlocks:
						"oak_leaves birch_leaves acacia_leaves jungle_leaves dark_oak_leaves spruce_leaves azalea_leaves flowering_azalea_leaves pumpkin",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesOverlayCtm({
					tiles: "0-46",
					matchBlocks: "sand",
					faces: ["sides"],
					heights: "62-256",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesOverlayFixed({
					tiles: "snow",
					heights: "63-256",
					matchBlocks: "grass_block",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesOverlayRandom({
					biomes: snowyBiomes,
					tiles: "51-56",
					faces: ["top", "bottom"],
					matchTiles:
						"grass_block_snow grass_block_side_overlay grass_block_top",
					weights: "1 1 8 1 1 20",
					heights: "63-256",
				}),
				new CtmPropertiesOverlayFixed({
					biomes: snowyBiomes,
					tiles: "50",
					faces: ["top"],
					matchBlocks: "grass_block",
					heights: "62",
				}),
				new CtmPropertiesOverlayFixed({
					biomes: snowyBiomes,
					tiles: "grass_block_snow",
					faces: ["sides"],
					matchBlocks: "grass_block",
					heights: "62",
				}),
				new CtmPropertiesOverlayFixed({
					biomes: snowyBiomes,
					tiles: "snow",
					faces: ["top"],
					matchBlocks: "grass_block",
					heights: "63-256",
				}),
				new CtmPropertiesOverlayRandom({
					biomes: snowyBiomes,
					tiles: "51-56",
					faces: ["top"],
					matchBlocks: "sand",
					weights: "1 1 8 1 1 20",
					heights: "63-256",
				}),
				...generateSnowyLeaves(),
			],
			fern: [
				new CtmPropertiesFixed({
					tiles: "fern_overlay",
					matchTiles: "block/inv",
					matchBlocks: "fern",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "fern_overlay",
					matchTiles: "fern",
					matchBlocks: "fern",
					biomes: snowyBiomes,
				}),
			],
			large_fern: [
				new CtmPropertiesFixed({
					tiles: "large_fern_bottom_overlay",
					matchTiles: "block/inv",
					matchBlocks: "large_fern:half=lower",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "large_fern_bottom",
					matchTiles: "large_fern_bottom",
					matchBlocks: "large_fern:half=lower",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "large_fern_top_overlay",
					matchTiles: "block/inv",
					matchBlocks: "large_fern:half=upper",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "large_fern_top",
					matchTiles: "large_fern_top",
					matchBlocks: "large_fern:half=upper",
					biomes: snowyBiomes,
				}),
			],
			grass: [
				new CtmPropertiesRandom({
					tiles: "0-12",
					matchTiles: "block/inv",
					matchBlocks: "short_grass",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					matchTiles:
						"block/short_grass/grass block/short_grass/grass_1 block/short_grass/grass_2 block/short_grass/grass_3 block/short_grass/grass_4 block/short_grass/grass_5 block/short_grass/grass_6 block/short_grass/grass_7 block/short_grass/grass_8 block/short_grass/grass_9 block/short_grass/grass_10 block/short_grass/grass_11 block/short_grass/grass_12",
					biomes: snowyBiomes,
					tiles: "inv",
				}),
			],
			tall_grass: [
				new CtmPropertiesFixed({
					tiles: "tall_grass_bottom",
					matchTiles: "block/inv",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "tall_grass_bottom",
					matchTiles: "block/inv",
					matchBlocks: "tall_grass:half=lower",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "inv",
					matchTiles: "tall_grass_top tall_grass_top_1 tall_grass_top_2",
					biomes: snowyBiomes,
				}),
				new CtmPropertiesFixed({
					tiles: "snowy_tall_grass_top",
					matchTiles: "block/inv",
					matchBlocks: "tall_grass:half=upper",
					biomes: snowyBiomes,
				}),
			],
			cut_red_sandstone: [
				new CtmPropertiesOverlay({
					faces: ["sides"],
					matchTiles: "cut_red_sandstone",
					tiles: "0-4",
					layer: "translucent",
				}),
			],
			cut_red_sandstone_wall: [
				new CtmPropertiesOverlay({
					matchTiles: "cut_red_sandstone_post",
					tiles: "0-4",
					layer: "translucent",
				}),
			],
			cut_sandstone: [
				new CtmPropertiesOverlay({
					faces: ["sides"],
					matchTiles: "cut_sandstone",
					tiles: "0-4",
					layer: "translucent",
				}),
			],
			cut_sandstone_wall: [
				new CtmPropertiesOverlay({
					matchTiles: "cut_sandstone_post",
					tiles: "0-4",
					layer: "translucent",
				}),
			],
			reinforced_deepslate: [
				new CtmPropertiesVertical({
					tiles: "0-3",
					faces: ["sides"],
					matchTiles: "reinforced_deepslate_side",
				}),
				new CtmPropertiesCtmCompact({
					tiles: "10-14",
					matchTiles: "reinforced_deepslate_top reinforced_deepslate_bottom",
				}),
			],
			sandstone: [
				new CtmPropertiesCtmCompact({
					tiles: "0-4",
					matchTiles: "sandstone",
					faces: ["sides"],
					//layer: "translucent",
				}),
			],
			snowy_grass_block: [
				new CtmPropertiesFixed({
					tiles: "0",
					matchTiles: "block/inv",
					matchBlocks: "snow_block",
					biomes: snowyBiomes,
					heights: "63-256",
				}),
			],
		},
	},
};

const netherrack = new CtmPropertiesOverlay();
//sand all extra overlays
//snowy_flower
//snowy_grass
//snowy_leaves
//snowy_grass_block
// alternate stoneBricks
//nylium weirdness
//rooted_dirt does not seems to have the second overlay
// check again every ores
// dirt/stone

function generateSnowyLeaves() {
	const leavesTypes = [
		"oak_leaves",
		"birch_leaves",
		"acacia_leaves",
		"jungle_leaves",
		"dark_oak_leaves",
		"spruce_leaves",
		"azalea_leaves",
		"flowering_azalea_leaves",
	];

	const snowyLeavesConfigs = [];

	for (const type of leavesTypes) {
		const overlay = new CtmPropertiesFixed({
			biomes: snowyBiomes,
			tiles: `${type}_overlay`,
			matchBlocks: `${type}_leaves`,
			matchTiles: "block/inv",
		});
		const block = new CtmPropertiesFixed({
			biomes: snowyBiomes,
			tiles: type,
			matchBlocks: `${type}_leaves`,
			matchTiles: `${type}_leaves_bushy_1 ${type}_leaves_bushy_0`,
		});

		snowyLeavesConfigs.push(block);
		snowyLeavesConfigs.push(overlay);
	}

	return snowyLeavesConfigs;
}

export function writeCtmProperties() {
	let folderLeft = getCtmPacksBlockCount(files);

	function writeCtmFile(
		blocks: { [key: Block]: CtmPropertiesBase[] },
		overlays: Set<string> | null,
	) {
		for (const [block, properties] of Object.entries(blocks)) {
			const blockFolderName = `/${folderLeft
				.toString()
				.padStart(4, "0")}_${block}`;

			const outputPath = path.join(
				config.build.output,
				"assets/minecraft/optifine/ctm",
				blockFolderName,
			);

			for (const property of properties) {
				const methodOutputPath = path.join(outputPath, property.method);

				// Check for existing folders
				if (!fs.existsSync(methodOutputPath)) {
					fs.mkdirSync(methodOutputPath, {
						recursive: true,
					});
				}

				// Handle special case for some methods
				switch (property.method) {
					case "overlay":
						if (isOfMethod(property, "overlay")) {
							handleOverlay(property, block, overlays);
						}
						break;
					default:
						break;
				}

				// Extract textures for this block
				const startIndex = property.tiles.split("-")[0];
				extractTextures(
					`./textures/${block}_${startIndex}.png`,
					`${block}_${startIndex}.png`,
					methodOutputPath,
				);

				// Write the properties file
				fs.writeFile(
					`${methodOutputPath}/${startIndex}_${block}.properties`,
					property.toString(),
					(err) => {
						if (err) {
							console.error(err);
						}
					},
				);
			}

			folderLeft--;
		}
	}

	for (const [_, group] of Object.entries(files)) {
		// Write base minecraft files
		writeCtmFile(group.minecraft, group.overlays);

		// Write files for mods
		if (group.modded) {
			for (const [_, blocks] of Object.entries(group.modded)) {
				writeCtmFile(blocks, group.overlays);
			}
		}
	}
}

fs.rmSync(path.join(config.build.output, "assets"), {
	recursive: true,
	force: true,
});
writeCtmProperties();
console.log("Done", getCtmPacksBlockCount(files));

function handleOverlay(
	property: CtmPropertiesOverlay,
	block: string,
	overlays: Set<string> | null,
) {
	if (!property.connectBlocks) {
		property.connectBlocks = new Set([block]);
	}

	if (overlays) {
		for (const connectedBlock of property.connectBlocks) {
			overlays.delete(connectedBlock);
		}

		if (!property.matchBlocks) {
			property.matchBlocks = Array.from(overlays).join(" ");
		}
	}
}

type CtmTypeMap = {
	overlay: CtmPropertiesOverlay;
	overlay_fixed: CtmPropertiesOverlayFixed;
};

function isOfMethod<M extends keyof CtmTypeMap>(
	obj: CtmPropertiesBase,
	method: M,
): obj is CtmTypeMap[M] {
	return obj.method === method;
}
