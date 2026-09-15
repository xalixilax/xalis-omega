#!/usr/bin/env bun
import type { Block, BlockCategories } from "../packages/lib/src/types/minecraft";
import { minecraftBlock } from "../packages/lib/src/minecraft/blocks";
import { globalConfig } from "../configs";

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

const searched = {
	LOG: searchBlock("log", "!stripped"),
	WOOD: searchBlock(
		["wood", "stem", "hyphae", "bamboo_block"],
		"!stripped",
		"!mushroom",
		"!melon",
		"!pumpkin",
		"!dripleaf",
	),
	PLANKS: searchBlock(["planks", "bamboo_mosaic"], "!slab", "!stairs"),
	STRIPPED_LOG: searchBlock("stripped", "log"),
	STRIPPED_WOOD: searchBlock("stripped", ["wood", "stem", "hyphae", "bamboo_block"]),
	LEAVES: searchBlock("leaves"),
	BRICKS: searchBlock(["brick", "purpur", "tiles"], "!chiseled", ...FULL_BLOCK_ONLY),
	POLISHED: searchBlock(
		["polished", "smooth", "cut_sandstone", "cut_red_sandstone", "quartz_block"],
		"!brick",
		"!chiseled",
		...FULL_BLOCK_ONLY,
	),
	CHISELED: searchBlock(
		["chiseled", "quartz_pillar"],
		"!bookshelf",
		"!copper",
		...FULL_BLOCK_ONLY,
	),
	GRASSES: searchBlock(["grass_block", "mycelium", "podzol", "nylium"]),
	SOIL: searchBlock(
		["clay", "dirt", "gravel", "mud", "sand", "soil", "farmland"],
		"!brick",
		"!path",
	),
	NETHER_ORES: searchBlock(["ancient_debris", "nether_gold_ore", "nether_quartz_ore"]),
	STONE_ORES: searchBlock("ore", "!deepslate", "!nether"),
	DEEPSLATE_ORES: searchBlock("deepslate", "ore"),
	COPPER: searchBlock("copper", "!waxed", "!exposed", "!weathered", "!oxidized", ...COPPER_ONLY),
	WAXED_COPPER: searchBlock("copper", "waxed", "!exposed", "!weathered", "!oxidized", ...COPPER_ONLY),
	EXPOSED_COPPER: searchBlock("copper", "exposed", "!waxed", ...COPPER_ONLY),
	WAXED_EXPOSED_COPPER: searchBlock("copper", "waxed", "exposed", ...COPPER_ONLY),
	WEATHERED_COPPER: searchBlock("copper", "weathered", "!waxed", ...COPPER_ONLY),
	WAXED_WEATHERED_COPPER: searchBlock("copper", "waxed", "weathered", ...COPPER_ONLY),
	OXIDIZED_COPPER: searchBlock("copper", "oxidized", "!waxed", ...COPPER_ONLY),
	WAXED_OXIDIZED_COPPER: searchBlock("copper", "waxed", "oxidized", ...COPPER_ONLY),
	TERRACOTTA: searchBlock("terracotta", "!glazed"),
	GLAZED_TERRACOTTA: searchBlock("glazed"),
	CONCRETE: searchBlock("concrete", "!powder"),
	CONCRETE_POWDER: searchBlock("concrete_powder"),
	WOOL: searchBlock("wool"),
	GLASS: searchBlock("glass", "!pane"),
	COLD_BLOCKS: searchBlock(["ice", "snow"], "!cauldron"),
	CORAL_BLOCKS: searchBlock("coral_block"),
	SHULKER_BOXES: searchBlock("shulker_box"),
	PRISMARINE: searchBlock(
		["prismarine", "sea_lantern"],
		"!brick",
		"!slab",
		"!stairs",
		"!wall",
	),
} satisfies Record<string, Block[]>;

const STONES_NATURAL: Block[] = [
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
];

const PRECIOUS_BLOCKS: Block[] = [
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
];

const NETHER_BLOCKS: Block[] = [
	"bone_block",
	"gilded_blackstone",
	"magma_block",
	"nether_wart_block",
	"shroomlight",
	"warped_wart_block",
];

const VEGETATION_BLOCKS: Block[] = [
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
];

const UTILITY_BLOCKS: Block[] = [
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
];

const MISC_BLOCKS: Block[] = [
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
];

const manual = {
	STONES_NATURAL,
	PRECIOUS_BLOCKS,
	NETHER_BLOCKS,
	VEGETATION_BLOCKS,
	UTILITY_BLOCKS,
	MISC_BLOCKS,
};

class Ref {
	constructor(public name: keyof typeof searched) {}
}

type Table<T> = T extends Block[] ? T | Ref : { [K in keyof T]: Table<T[K]> };

const table: Table<BlockCategories> = {
	woods: {
		log: new Ref("LOG"),
		planks: new Ref("PLANKS"),
		wood: new Ref("WOOD"),
		stripped: {
			log: new Ref("STRIPPED_LOG"),
			wood: new Ref("STRIPPED_WOOD"),
		},
	},
	leaves: new Ref("LEAVES"),
	stones: {
		natural: STONES_NATURAL,
	},
	masonry_blocks: {
		bricks: new Ref("BRICKS"),
		polished: new Ref("POLISHED"),
		chiseled: new Ref("CHISELED"),
	},
	grasses: new Ref("GRASSES"),
	soil: new Ref("SOIL"),
	ores: {
		nether: new Ref("NETHER_ORES"),
		stone: new Ref("STONE_ORES"),
		deepslate: new Ref("DEEPSLATE_ORES"),
	},
	precious_blocks: PRECIOUS_BLOCKS,
	copper_blocks: {
		base: {
			unwaxed: new Ref("COPPER"),
			waxed: new Ref("WAXED_COPPER"),
		},
		exposed: {
			unwaxed: new Ref("EXPOSED_COPPER"),
			waxed: new Ref("WAXED_EXPOSED_COPPER"),
		},
		weathered: {
			unwaxed: new Ref("WEATHERED_COPPER"),
			waxed: new Ref("WAXED_WEATHERED_COPPER"),
		},
		oxidized: {
			unwaxed: new Ref("OXIDIZED_COPPER"),
			waxed: new Ref("WAXED_OXIDIZED_COPPER"),
		},
	},
	nether_blocks: NETHER_BLOCKS,
	terracotta: new Ref("TERRACOTTA"),
	glazed_terracotta: new Ref("GLAZED_TERRACOTTA"),
	concrete: {
		hardened: new Ref("CONCRETE"),
		powder: new Ref("CONCRETE_POWDER"),
	},
	wool: new Ref("WOOL"),
	glass: new Ref("GLASS"),
	vegetation_blocks: VEGETATION_BLOCKS,
	cold_block: new Ref("COLD_BLOCKS"),
	coral_blocks: new Ref("CORAL_BLOCKS"),
	utility_blocks: UTILITY_BLOCKS,
	shulker_boxes: new Ref("SHULKER_BOXES"),
	prismarine: new Ref("PRISMARINE"),
	misc_blocks: MISC_BLOCKS,
};

function serialize(value: unknown, indent = 0): string {
	const pad = "    ".repeat(indent);
	if (value instanceof Ref) return value.name;
	if (Array.isArray(value)) {
		const items = value.map((item) => `${pad}    ${serialize(item, indent + 1)}`);
		return items.length ? `[\n${items.join(",\n")},\n${pad}]` : "[]";
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value).map(
			([key, item]) => `${pad}    ${key}: ${serialize(item, indent + 1)}`,
		);
		return `{\n${entries.join(",\n")},\n${pad}}`;
	}
	return JSON.stringify(value);
}

function assertManualBlocksExist(): void {
	const known = new Set<string>(minecraftBlock);
	for (const [name, blocks] of Object.entries(manual)) {
		for (const block of blocks) {
			if (!known.has(block)) throw new Error(`${name}: unknown block "${block}"`);
		}
	}
}

export function buildFile(): string {
	assertManualBlocksExist();

	const constants = Object.entries(searched)
		.map(([name, blocks]) => `export const ${name}: Block[] = ${serialize(blocks)};`)
		.join("\n\n");

	return `/**
 * Minecraft Version ${globalConfig.minecraftVersion}
 * Generated by scripts/generate-block-categories.ts. Do not edit by hand.
 */
import type { Block, BlockCategories } from "@lib/types/minecraft";

${constants}

export const minecraftBlockCategories: BlockCategories = ${serialize(table)};
`;
}

if (import.meta.main) {
	const outputFile = new URL(
		"../packages/lib/src/minecraft/blocks-categories.ts",
		import.meta.url,
	).pathname;
	await Bun.write(outputFile, buildFile());
	console.log(`block categories saved to ${outputFile}`);
}
