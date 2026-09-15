import type { Block, BlockCategories } from "@lib/types/minecraft";
import { minecraftBlock } from "./blocks";

type Keyword = string;
type Rule = Keyword | Keyword[];

/**
 * Find every block whose id matches all rules.
 *
 * A keyword matches whole words of a block id: `planks` matches `oak_planks`
 * and `bricks` matches `stone_bricks`, but `sand` does not match `sandstone`.
 * A trailing `s` is ignored. Prefix a keyword with `!` to reject the block.
 * An array is a group of alternatives: one keyword must match.
 */
export function searchBlock(...rules: Rule[]): Block[] {
	return minecraftBlock.filter((block) =>
		rules.every((rule) => {
			const keywords = Array.isArray(rule) ? rule : [rule];
			return keywords.some((keyword) => matchesKeyword(block, keyword));
		}),
	);
}

function matchesKeyword(block: string, keyword: string): boolean {
	const positive = !keyword.startsWith("!");
	const parts = (positive ? keyword : keyword.slice(1)).split("_");
	const words = block.split("_");
	const hit = words.some((_, i) =>
		parts.every((part, j) => sameWord(words[i + j] ?? "", part)),
	);
	return positive ? hit : !hit;
}

function sameWord(word: string, keyword: string): boolean {
	return word === keyword || word === `${keyword}s` || keyword === `${word}s`;
}

const FULL_BLOCK_ONLY: Rule[] = [
	"!slab",
	"!stairs",
	"!wall",
	"!fence",
	"!gate",
	"!door",
	"!trapdoor",
	"!button",
	"!pressure_plate",
	"!sign",
	"!pane",
	"!bars",
	"!chain",
	"!torch",
	"!lantern",
];

const COPPER_ONLY: Rule[] = [...FULL_BLOCK_ONLY, "!raw", "!ore", "!chest", "!golem"];

export const LOG = searchBlock("log", "!stripped");
export const WOOD = searchBlock(
	["wood", "stem", "hyphae", "bamboo_block"],
	"!stripped",
	"!mushroom",
	"!melon",
	"!pumpkin",
	"!dripleaf",
);
export const PLANKS = searchBlock(["planks", "bamboo_mosaic"], "!slab", "!stairs");
export const STRIPPED_LOG = searchBlock("stripped", "log");
export const STRIPPED_WOOD = searchBlock("stripped", [
	"wood",
	"stem",
	"hyphae",
	"bamboo_block",
]);
export const LEAVES = searchBlock("leaves");
export const BRICKS = searchBlock(["brick", "purpur", "tiles"], "!chiseled", ...FULL_BLOCK_ONLY);
export const POLISHED = searchBlock(
	["polished", "smooth", "cut_sandstone", "cut_red_sandstone", "quartz_block"],
	"!brick",
	"!chiseled",
	...FULL_BLOCK_ONLY,
);
export const CHISELED = searchBlock(
	["chiseled", "quartz_pillar"],
	"!bookshelf",
	"!copper",
	...FULL_BLOCK_ONLY,
);
export const GRASSES = searchBlock(["grass_block", "mycelium", "podzol", "nylium"]);
export const SOIL = searchBlock(
	["clay", "dirt", "gravel", "mud", "sand", "soil", "farmland"],
	"!brick",
	"!path",
);
export const NETHER_ORES = searchBlock([
	"ancient_debris",
	"nether_gold_ore",
	"nether_quartz_ore",
]);
export const STONE_ORES = searchBlock("ore", "!deepslate", "!nether");
export const DEEPSLATE_ORES = searchBlock("deepslate", "ore");
export const COPPER = searchBlock("copper", "!waxed", "!exposed", "!weathered", "!oxidized", ...COPPER_ONLY);
export const WAXED_COPPER = searchBlock("copper", "waxed", "!exposed", "!weathered", "!oxidized", ...COPPER_ONLY);
export const EXPOSED_COPPER = searchBlock("copper", "exposed", "!waxed", ...COPPER_ONLY);
export const WAXED_EXPOSED_COPPER = searchBlock("copper", "waxed", "exposed", ...COPPER_ONLY);
export const WEATHERED_COPPER = searchBlock("copper", "weathered", "!waxed", ...COPPER_ONLY);
export const WAXED_WEATHERED_COPPER = searchBlock("copper", "waxed", "weathered", ...COPPER_ONLY);
export const OXIDIZED_COPPER = searchBlock("copper", "oxidized", "!waxed", ...COPPER_ONLY);
export const WAXED_OXIDIZED_COPPER = searchBlock("copper", "waxed", "oxidized", ...COPPER_ONLY);
export const NETHER_BLOCKS = [
	"bone_block",
	"gilded_blackstone",
	"magma_block",
	"nether_wart_block",
	"shroomlight",
	"warped_wart_block",
];
export const TERRACOTTA = searchBlock("terracotta", "!glazed");
export const GLAZED_TERRACOTTA = searchBlock("glazed");
export const CONCRETE = searchBlock("concrete", "!powder");
export const CONCRETE_POWDER = searchBlock("concrete_powder");
export const WOOL = searchBlock("wool");
export const GLASS = searchBlock("glass", "!pane");
export const COLD_BLOCKS = searchBlock(["ice", "snow"], "!cauldron");
export const CORAL_BLOCKS = searchBlock("coral_block");
export const SHULKER_BOXES = searchBlock("shulker_box");
export const PRISMARINE = searchBlock(
	["prismarine", "sea_lantern"],
	"!brick",
	"!slab",
	"!stairs",
	"!wall",
);

export const minecraftBlockCategories: BlockCategories = {
	woods: {
		log: LOG,
		planks: PLANKS,
		wood: WOOD,
		stripped: {
			log: STRIPPED_LOG,
			wood: STRIPPED_WOOD,
		},
	},
	leaves: LEAVES,
	stones: {
		natural: [
			"stone",
			"tuff",
			"andesite",
			"blackstone",
			"sandstone",
			"red_sandstone",
			"cobbled_deepslate",
			"basalt",
			"calcite",
			"cobblestone",
			"mossy_cobblestone",
			"dripstone_block",
			"deepslate",
			"diorite",
			"granite",
			"infested_cobblestone",
			"infested_deepslate",
			"infested_stone",
			"netherrack",
			"end_stone",
			"obsidian",
			"crying_obsidian",
		],
	},
	masonry_blocks: {
		bricks: BRICKS,
		polished: POLISHED,
		chiseled: CHISELED,
	},
	grasses: GRASSES,
	soil: SOIL,
	ores: {
		nether: NETHER_ORES,
		stone: STONE_ORES,
		deepslate: DEEPSLATE_ORES,
	},
	precious_blocks: [
		"amethyst_block",
		"budding_amethyst",
		"coal_block",
		"diamond_block",
		"emerald_block",
		"gold_block",
		"raw_gold_block",
		"iron_block",
		"raw_iron_block",
		"lapis_block",
		"netherite_block",
		"redstone_block",
		"resin_block",
		"raw_copper_block",
	],
	copper_blocks: {
		base: {
			unwaxed: COPPER,
			waxed: WAXED_COPPER,
		},
		exposed: {
			unwaxed: EXPOSED_COPPER,
			waxed: WAXED_EXPOSED_COPPER,
		},
		weathered: {
			unwaxed: WEATHERED_COPPER,
			waxed: WAXED_WEATHERED_COPPER,
		},
		oxidized: {
			unwaxed: OXIDIZED_COPPER,
			waxed: WAXED_OXIDIZED_COPPER,
		},
	},
	nether_blocks: NETHER_BLOCKS,
	terracotta: TERRACOTTA,
	glazed_terracotta: GLAZED_TERRACOTTA,
	concrete: {
		hardened: CONCRETE,
		powder: CONCRETE_POWDER,
	},
	wool: WOOL,
	glass: GLASS,
	vegetation_blocks: [
		"brown_mushroom_block",
		"red_mushroom_block",
		"mushroom_stem",
		"cactus",
		"dried_kelp_block",
		"hay_block",
		"mangrove_roots",
		"muddy_mangrove_roots",
		"melon",
		"moss_block",
		"pale_moss_block",
		"pumpkin",
		"carved_pumpkin",
		"jack_o_lantern",
		"sculk",
		"sculk_catalyst",
		"sculk_shrieker",
		"sculk_sensor",
		"calibrated_sculk_sensor",
		"sponge",
		"wet_sponge",
		"vine",
		"glow_lichen",
	],
	cold_block: COLD_BLOCKS,
	coral_blocks: CORAL_BLOCKS,
	utility_blocks: [
		"barrel",
		"beacon",
		"bee_nest",
		"beehive",
		"blast_furnace",
		"bookshelf",
		"chiseled_bookshelf",
		"brewing_stand",
		"cartography_table",
		"cauldron",
		"chest",
		"composter",
		"conduit",
		"crafting_table",
		"crafter",
		"daylight_detector",
		"decorated_pot",
		"dispenser",
		"dropper",
		"enchanting_table",
		"ender_chest",
		"fletching_table",
		"furnace",
		"grindstone",
		"heavy_core",
		"hopper",
		"jukebox",
		"lectern",
		"lodestone",
		"loom",
		"note_block",
		"observer",
		"piston",
		"sticky_piston",
		"redstone_lamp",
		"respawn_anchor",
		"slime_block",
		"smithing_table",
		"smoker",
		"spawner",
		"stonecutter",
		"target",
		"tnt",
		"trapped_chest",
		"trial_spawner",
		"vault",
	],
	shulker_boxes: SHULKER_BOXES,
	prismarine: PRISMARINE,
	misc_blocks: [
		"bedrock",
		"cobweb",
		"honey_block",
		"honeycomb_block",
		"ochre_froglight",
		"pearlescent_froglight",
		"verdant_froglight",
		"command_block",
		"chain_command_block",
		"repeating_command_block",
		"jigsaw",
		"structure_block",
		"test_block",
		"test_instance_block",
	],
};
