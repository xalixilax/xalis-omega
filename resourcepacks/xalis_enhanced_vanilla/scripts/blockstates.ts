import { type Files } from "@lib/files/utils";
import {
	type BrickWallCfg,
	type VariantCfg,
} from "./block-templates";

const Mc = (name: string) => ({ name, ns: "minecraft" });

const WOODS = [
	"oak",
	"spruce",
	"birch",
	"jungle",
	"acacia",
	"dark_oak",
	"crimson",
	"warped",
	"iron",
];

const BRICK_WALLS: [string, BrickWallCfg][] = [
	["stone_brick", { post: "stone_bricks_post", wall: "stone_bricks_wall", opposite: "stone_bricks_wall_opposite", end: "stone_bricks_wall_end" }],
	["mossy_stone_brick", { post: "mossy_stone_bricks_post", wall: "mossy_stone_bricks_wall", opposite: "mossy_stone_bricks_wall_opposite", end: "mossy_stone_bricks_wall_end" }],
	["end_stone_brick", { post: "end_stone_bricks_post", wall: "end_stone_bricks_wall", opposite: "end_stone_bricks_wall_opposite", end: "end_stone_bricks_wall_end" }],
	["polished_blackstone", { post: "polished_blackstone_post", wall: "polished_blackstone_wall", opposite: "polished_blackstone_wall_opposite", end: "polished_blackstone_bricks_wall_end" }],
	["polished_blackstone_brick", { post: "polished_blackstone_bricks_post", wall: "polished_blackstone_bricks_wall", opposite: "polished_blackstone_bricks_wall_opposite", end: "polished_blackstone_bricks_wall_end" }],
];

const SANDSTONE_WALLS = ["sandstone", "red_sandstone"];

const cubeAll = (folder: string) => (name: string) => ({
	parent: "block/cube_all",
	textures: { all: `block/${folder}/${name}` },
});

const VARIANT_SETS: VariantCfg[] = [
	{
		block: "bricks",
		folder: "bricks",
		names: [...Array(6)].map((_, i) => `bricks_${i + 1}`),
		weights: [5, 5, 5, 5, 5, 5],
		base: { model: "block/bricks", weight: 5 },
		modelJson: cubeAll("bricks"),
	},
	{
		block: "cobblestone",
		folder: "cobblestone",
		names: [...Array(16)].map((_, i) => `cobblestone_${i + 1}`),
		weights: [10, 10, 10, 10, 10, 10, 10, 5, 10, 1, 1, 1, 1, 1, 1, 1],
		base: { model: "block/cobblestone", weight: 10 },
		modelJson: cubeAll("cobblestone"),
	},
	{
		block: "dirt",
		folder: "dirt",
		names: [...Array(10)].map((_, i) => `dirt_${i}`),
		weights: [2, 2, 2, 2, 2, 1, 1, 1, 0, 1],
		base: { model: "block/dirt", weight: 300 },
		modelJson: cubeAll("dirt"),
	},
	{
		block: "sand",
		folder: "sand",
		names: [...Array(6)].map((_, i) => `${i}`),
		weights: [1, 1, 1, 1, 1, 1],
		rots: [0, 90, 180, 270],
		alwaysWeight: true,
		base: {
			model: "block/sand",
			weight: 500,
			rots: [0, 90, 180, 270],
			weights: [500, 1, 1, 1],
		},
		modelJson: cubeAll("sand"),
	},
	{
		block: "stone_bricks",
		folder: "stone_bricks",
		names: [...Array(5)].map((_, i) => `${i + 1}`),
		weights: [20, 20, 20, 20, 20],
		base: { model: "block/stone_bricks", weight: 200 },
		modelJson: cubeAll("stone_bricks"),
	},
	{
		block: "netherrack",
		folder: "netherrack",
		names: ["4", "5", "6", "7", "8", "9", "10", "0", "1", "2", "3"],
		weights: [500, 500, 500, 500, 500, 500, 500, 4, 4, 4, 4],
		rots: [0, 90, 180, 270],
		order: "rot",
		base: { model: "block/netherrack", weight: 500, rots: [0, 90, 180, 270] },
		modelJson: cubeAll("netherrack"),
	},
	{
		block: "bookshelf",
		folder: "bookshelf",
		names: [...Array(19)].map((_, i) => `bookshelf_${i + 1}`),
		weights: [1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1],
		base: {
			model: "block/bookshelf/bookshelf",
			weight: 5,
			baseJson: {
				parent: "block/cube_column",
				textures: { end: "block/oak_planks", side: "block/bookshelf/bookshelf" },
			},
		},
		modelJson: (name) => ({
			parent: "block/cube_column",
			textures: { end: "block/oak_planks", side: `block/bookshelf/${name}` },
		}),
	},
	{
		block: "crimson_roots",
		folder: "crimson_roots",
		names: ["crimson_roots_1", "crimson_roots_2", "crimson_roots_3", "crimson_roots_4"],
		weights: [1, 1, 1, 1],
		nsPrefix: true,
		alwaysWeight: false,
		base: { model: "minecraft:block/crimson_roots", weight: 1 },
		modelJson: (name) => ({
			parent: "minecraft:block/cross",
			textures: { cross: `minecraft:block/crimson_roots/${name}` },
		}),
	},
	{
		block: "warped_roots",
		folder: "warped_roots",
		names: ["warped_roots_1", "warped_roots_2", "warped_roots_3", "warped_roots_4"],
		weights: [1, 1, 1, 1],
		nsPrefix: true,
		alwaysWeight: false,
		base: { model: "minecraft:block/warped_roots", weight: 1 },
		modelJson: (name) => ({
			parent: "minecraft:block/cross",
			textures: { cross: `minecraft:block/warped_roots/${name}` },
		}),
	},
	{
		block: "short_grass",
		folder: "short_grass",
		names: ["grass", ...Array.from({ length: 12 }, (_, i) => `grass_${i + 1}`)],
		weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		alwaysWeight: false,
		modelJson: (name) => ({
			parent: "block/tinted_cross_overlay",
			textures: { cross: `block/short_grass/${name}` },
		}),
	},
	{
		block: "dirt_path",
		folder: "dirt_path",
		names: [...Array.from({ length: 8 }, (_, i) => `grass_path_${i}`)],
		weights: [1, 1, 1, 1, 1, 2, 2, 2],
		base: { model: "block/dirt_path", weight: 100 },
		modelJson: (name) => ({
			parent: "block/block",
			textures: {
				particle: "block/dirt",
				top: `block/dirt_path/${name}`,
				side: "block/dirt_path_side",
				bottom: "block/dirt",
			},
			elements: [
				{
					from: [0, 0, 0],
					to: [16, 15, 16],
					faces: {
						down: { uv: [0, 0, 16, 16], texture: "#bottom", cullface: "down" },
						up: { uv: [0, 0, 16, 16], texture: "#top" },
						north: { uv: [0, 1, 16, 16], texture: "#side", cullface: "north" },
						south: { uv: [0, 1, 16, 16], texture: "#side", cullface: "south" },
						west: { uv: [0, 1, 16, 16], texture: "#side", cullface: "west" },
						east: { uv: [0, 1, 16, 16], texture: "#side", cullface: "east" },
					},
				},
			],
		}),
	},
	{
		block: "lily_pad",
		folder: "",
		names: [...Array(7)].map((_, i) => `lily_pad_${i + 1}`),
		weights: [4, 1, 4, 1, 1, 1, 1],
		rots: [0, 90, 180, 270],
		generateModels: false,
		base: { model: "block/lily_pad", weight: 4, rots: [0, 90, 180, 270] },
	},
	{
		block: "red_mushroom",
		folder: "mushroom",
		names: [...Array(4)].map((_, i) => `red_mushroom_${i}`),
		weights: [5, 5, 5, 5],
		rots: [0, 90, 180, 270],
		generateModels: false,
	},
	{
		block: "brown_mushroom",
		folder: "mushroom",
		names: [...Array(3)].map((_, i) => `brown_mushroom_${i}`),
		weights: [5, 5, 5],
		rots: [0, 90, 180, 270],
		generateModels: false,
	},
	{
		block: "crimson_fungus",
		folder: "mushroom",
		names: [...Array(4)].map((_, i) => `crimson_fungus_${i}`),
		weights: [5, 5, 5, 5],
		rots: [0, 90, 180, 270],
		generateModels: false,
	},
	{
		block: "warped_fungus",
		folder: "mushroom",
		names: [...Array(4)].map((_, i) => `warped_fungus_${i}`),
		weights: [5, 5, 5, 5],
		rots: [0, 90, 180, 270],
		generateModels: false,
	},
];

/** tall_grass: two variants; upper has 3 texture variants. */
function tallGrass(ctx: ReturnType<typeof Mc>): Files[] {
	const name = (suffix = "") =>
		`block/tall_grass_top/tall_grass_top${suffix}`;
	const modelJson = (texture: string) => ({
		parent: "block/tinted_cross_overlay",
		textures: { cross: texture },
	});
	return [
		{
			path: `assets/${ctx.ns}/models/${name()}.json`,
			content: modelJson("block/tall_grass_top"),
		},
		{
			path: `assets/${ctx.ns}/models/${name("_1")}.json`,
			content: modelJson("block/tall_grass_top_1"),
		},
		{
			path: `assets/${ctx.ns}/models/${name("_2")}.json`,
			content: modelJson("block/tall_grass_top_2"),
		},
		{
			path: `assets/${ctx.ns}/blockstates/tall_grass.json`,
			content: {
				variants: {
					"half=lower": { model: "block/tall_grass_bottom" },
					"half=upper": [
						{ model: name() },
						{ model: name("_1") },
						{ model: name("_2") },
					],
				},
			},
		},
	];
}
