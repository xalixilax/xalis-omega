import type { BlockContext, GenFile, Template } from "../utils/blockGen";

const parent = (parent: string, textures: Record<string, string>) => ({
	parent,
	textures,
});

const entry = (
	model: string,
	y: number | undefined,
	weight: number | undefined,
	x?: number,
) => ({
	model,
	...(x ? { x, y } : y ? { y } : {}),
	...(weight !== undefined ? { weight } : {}),
});

function fModel(ctx: BlockContext, model: string, json: object): GenFile {
	return {
		path: `assets/${ctx.ns}/models/${model}.json`,
		json,
	};
}

/**
 * Door: blockstate (facing/half/hinge/open) + 4 panels + item model.
 * ctx.name is the wood ("oak" → oak_door).
 * cfg.hinge "same" for woods without dedicated panel textures (warped).
 */
export interface DoorCfg {
	hinge?: "rh" | "same";
}

export const Door: Template<DoorCfg> = (ctx, cfg = {}) => {
	const block = `${ctx.name}_door`;
	const side = `block/door/${block}_side`;
	const hingeTextures =
		cfg.hinge === "same"
			? {
				bottom: `block/${block}_bottom`,
				top: `block/${block}_top`,
				side,
			}
			: {
				bottom: `block/${block}_bottom_rh`,
				side,
			};
	const topHingeTextures =
		cfg.hinge === "same"
			? hingeTextures
			: {
				top: `block/${block}_top_rh`,
				side,
			};
	const files: GenFile[] = [
		fModel(ctx, `block/door/${block}`, {
			parent: "item/generated",
			textures: { layer0: `item/${block}` },
		}),
		fModel(ctx, `block/door/${block}_bottom`, {
			parent: "block/door/door_bottom",
			textures: {
				bottom: `block/${block}_bottom`,
				top: `block/${block}_top`,
				side,
			},
		}),
		fModel(ctx, `block/door/${block}_bottom_hinge`, {
			parent: "block/door/door_bottom_rh",
			textures: hingeTextures,
		}),
		fModel(ctx, `block/door/${block}_top`, {
			parent: "block/door/door_top",
			textures: {
				bottom: `block/${block}_bottom`,
				top: `block/${block}_top`,
				side,
			},
		}),
		fModel(ctx, `block/door/${block}_top_hinge`, {
			parent: "block/door/door_top_rh",
			textures: topHingeTextures,
		}),
		{
			path: `assets/${ctx.ns}/blockstates/${block}.json`,
			json: { variants: doorVariants(block) },
		},
	];
	return files;
};

/** Vanilla door rotation rules: hinge-left opens to the left of the door panel. */
function doorVariants(block: string): object {
	const facingY: Record<string, number> = {
		east: 0,
		south: 90,
		west: 180,
		north: 270,
	};
	const variants: Record<string, object> = {};
	for (const [facing, y] of Object.entries(facingY)) {
		for (const half of ["lower", "upper"]) {
			for (const hinge of ["left", "right"]) {
				for (const open of [false, true]) {
					const panel = half === "lower" ? "bottom" : "top";
					const suffix = open
						? hinge === "left"
							? "_hinge"
							: ""
						: hinge === "left"
							? ""
							: "_hinge";
					const rot = open
						? (y + (hinge === "left" ? 90 : 270)) % 360
						: y;
					variants[
						`facing=${facing},half=${half},hinge=${hinge},open=${open}`
					] = entry(
						`minecraft:block/door/${block}_${panel}${suffix}`,
						rot,
						undefined,
					);
				}
			}
		}
	}
	return variants;
}

/**
 * Trapdoor: blockstate (facing/half/open) + bottom/open/top models.
 * ctx.name is the wood. Crimson/warped/acacia/... use the orientable plank template.
 */
export const Trapdoor: Template = (ctx) => {
	const block = `${ctx.name}_trapdoor`;
	const orientable = new Set([
		"acacia",
		"birch",
		"crimson",
		"jungle",
		"spruce",
		"warped",
	]);
	const tpl = (suffix: string) =>
		`block/trapdoor/template${orientable.has(ctx.name) ? "_orientable" : ""}_trapdoor_${suffix}`;
	const textures = {
		texture: `block/${block}`,
		side: `block/trapdoor/${block}_side`,
	};

	const openY: Record<string, number> = {
		east: 90,
		south: 180,
		west: 270,
		north: 0,
	};
	const variants: Record<string, object> = {};
	for (const facing of ["east", "north", "south", "west"]) {
		const fy = openY[facing];
		for (const half of ["bottom", "top"]) {
			for (const open of [false, true]) {
				const model = `minecraft:block/trapdoor/${block}_${open ? "open" : half
					}`;
				const rot = orientable.has(ctx.name)
					? half === "top" && open
						? { x: 180, y: (fy + 180) % 360 }
						: { y: fy }
					: open
						? { y: fy }
						: {};
				variants[`facing=${facing},half=${half},open=${open}`] = {
					model,
					...(rot.x ? { x: rot.x, y: rot.y } : rot.y ? { y: rot.y } : {}),
				};
			}
		}
	}

	return [
		fModel(ctx, `block/trapdoor/${block}_bottom`, parent(tpl("bottom"), textures)),
		fModel(ctx, `block/trapdoor/${block}_open`, parent(tpl("open"), textures)),
		fModel(ctx, `block/trapdoor/${block}_top`, parent("block/trapdoor/template_orientable_trapdoor_top", textures)),
		{
			path: `assets/${ctx.ns}/blockstates/${block}.json`,
			json: { variants },
		},
	];
};

export interface BrickWallCfg {
	post: string;
	wall: string;
	opposite: string;
	end: string;
}

/**
 * Brick-family wall (stone_bricks, end_stone_bricks, ...).
 * Models reference the custom walls/* textures; tall parts fall back to vanilla models.
 */
export const WallBrick: Template<BrickWallCfg> = (ctx, cfg) => {
	const block = `${ctx.name}_wall`;
	const side = `${ctx.ns}:block/${block}_side`;
	const sideOpposite = `${ctx.ns}:block/${block}_side_opposite`;
	const post = `${ctx.ns}:block/${block}_post`;
	const sideTall = `${ctx.ns}:block/${block}_side_tall`;

	const multipart = [
		{ when: { up: "true" }, apply: { model: post } },
		{ when: { north: "low" }, apply: { model: side, uvlock: false } },
		{ when: { east: "low" }, apply: { model: side, y: 90, uvlock: false } },
		{ when: { south: "low" }, apply: { model: sideOpposite, y: 180, uvlock: false } },
		{ when: { west: "low" }, apply: { model: sideOpposite, y: 270, uvlock: false } },
		{
			when: { west: "low", east: "low", south: "low", north: "low" },
			apply: { model: post, uvlock: false },
		},
		{ when: { north: "tall" }, apply: { model: sideTall, uvlock: true } },
		{ when: { east: "tall" }, apply: { model: sideTall, y: 90, uvlock: true } },
		{ when: { south: "tall" }, apply: { model: sideTall, y: 180, uvlock: true } },
		{ when: { west: "tall" }, apply: { model: sideTall, y: 270, uvlock: true } },
	];

	const walls = (key: keyof BrickWallCfg) =>
		`minecraft:block/walls/${cfg[key]}`;
	return [
		fModel(ctx, `block/${block}_post`, parent("minecraft:block/template_wall_post_bricks", { wall: walls("post") })),
		fModel(ctx, `block/${block}_side`, parent("minecraft:block/template_wall_side_bricks", { wall: walls("wall"), opposite: walls("opposite"), end: walls("end") })),
		fModel(ctx, `block/${block}_side_opposite`, parent("minecraft:block/template_wall_side_bricks_opposite", { wall: walls("wall"), opposite: walls("opposite"), end: walls("end") })),
		{
			path: `assets/${ctx.ns}/blockstates/${block}.json`,
			json: { multipart },
		},
	];
};

/**
 * Sandstone-family wall (sandstone, red_sandstone).
 * Full custom models (post/side/tall) in the block/wall/ folder.
 */
export const WallSandstone: Template = (ctx) => {
	const { name } = ctx;
	const block = `${name}_wall`;
	const wall = `minecraft:block/${name}`;
	const top = `minecraft:block/${name}_top`;
	const yFor = (facing: string) =>
		({ east: 90, south: 180, west: 270, north: 0 })[facing];

	const multipart = [
		{ when: { up: "true" }, apply: { model: `block/wall/${block}_post` } },
		...["north", "east", "south", "west"].map((facing) => ({
			when: { [facing]: "low" },
			apply: {
				model: `block/wall/${block}_side`,
				...(yFor(facing) ? { y: yFor(facing) } : {}),
				uvlock: true,
			},
		})),
		...["north", "east", "south", "west"].map((facing) => ({
			when: { [facing]: "tall" },
			apply: {
				model: `block/wall/${block}_side_tall`,
				...(yFor(facing) ? { y: yFor(facing) } : {}),
				uvlock: true,
			},
		})),
	];

	return [
		fModel(ctx, `block/wall/${block}_post`, parent("block/wall/template_wall_post", { wall, top })),
		fModel(ctx, `block/wall/${block}_side`, parent("block/wall/template_wall_side", { wall, top })),
		fModel(ctx, `block/wall/${block}_side_tall`, parent("block/wall/template_wall_side_tall", { wall })),
		{
			path: `assets/${ctx.ns}/blockstates/${block}.json`,
			json: { multipart },
		},
	];
};

export interface VariantCfg {
	/** Blockstate name, written to blockstates/<block>.json */
	block: string;
	/** Model subfolder under models/block/ ("" for root) */
	folder: string;
	/** Model file names without extension */
	names: string[];
	/** Weight per variant (0 = model still generated, but not listed in the blockstate) */
	weights: number[];
	/** Rotations applied to every variant (default [0]) */
	rots?: number[];
	/** Optional base entry (a vanilla or pack model usually with high weight) */
	base?: {
		model: string;
		weight: number;
		rots?: number[];
		/** Per-rotation weights when rotations have different weights (e.g. sand [500, 1, 1, 1]) */
		weights?: number[];
		/** Generate this model file too (when the base model is part of this pack) */
		baseJson?: object;
	};
	/** Generate variant model files (default true; set false when models are art from elsewhere) */
	generateModels?: boolean;
	/** Model paths in the blockstate get a "minecraft:" prefix (default false) */
	nsPrefix?: boolean;
	/** Always write the weight field, even when 1 (default true; v2 pads every entry except some plant arrays) */
	alwaysWeight?: boolean;
	/** More model JSON for each variant file (parent + textures); required when generateModels */
	modelJson?: (name: string) => object;
	/** Entry ordering: rotations per variant ("variant", default) or variants per rotation ("rot", e.g. netherrack) */
	order?: "variant" | "rot";
}

/**
 * Weighted-random variant block + per-variant model files.
 * Covers cube_all/cube_column/cross/tinted_cross via cfg.modelJson.
 */
export const VariantSet: Template<VariantCfg> = (ctx, cfg) => {
	const files: GenFile[] = [];
	const rots = cfg.rots ?? [0];
	const prefix = cfg.nsPrefix ? `${ctx.ns}:` : "";
	const variants: Record<string, object[]> = { "": [] };
	const modelPath = (name: string) =>
		`${prefix}block/${cfg.folder ? cfg.folder + "/" : ""}${name}`;
	const push = (model: string, rot: number, w: number) => {
		if (w === 0) return;
		variants[""].push(
			entry(
				model,
				rot || undefined,
				cfg.alwaysWeight !== false || w !== 1 ? w : undefined,
			),
		);
	};

	if (cfg.base) {
		if (cfg.base.baseJson) {
			files.push({
				path: `assets/${ctx.ns}/models/${cfg.base.model}.json`,
				json: cfg.base.baseJson,
			});
		}
		const baseWeights =
			cfg.base.weights ?? rots.map(() => cfg.base!.weight);
		if (cfg.order === "rot") {
			rots.forEach((r, ri) => {
				push(cfg.base!.model, r, baseWeights[ri]);
				cfg.names.forEach((name, i) => push(modelPath(name), r, cfg.weights[i]));
			});
		} else {
			rots.forEach((r, ri) => push(cfg.base!.model, r, baseWeights[ri]));
			cfg.names.forEach((name, i) => {
				for (const r of rots) push(modelPath(name), r, cfg.weights[i]);
			});
		}
	} else {
		cfg.names.forEach((name, i) => {
			for (const r of rots) push(modelPath(name), r, cfg.weights[i]);
		});
	}

	cfg.names.forEach((name, i) => {
		if (cfg.generateModels !== false && cfg.modelJson) {
			files.push({
				path: `assets/${ctx.ns}/models/block/${cfg.folder}/${name}.json`,
				json: cfg.modelJson(name),
			});
		}
	});

	files.push({
		path: `assets/${ctx.ns}/blockstates/${cfg.block}.json`,
		json: { variants },
	});
	return files;
};
