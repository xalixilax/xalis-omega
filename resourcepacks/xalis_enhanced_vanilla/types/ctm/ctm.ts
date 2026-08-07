// =============================================================================
// Helper Types and Enums
// =============================================================================

/**
 * Valid CTM method values.
 */
export type CtmMethod =
	| "ctm"
	| "ctm_compact"
	| "horizontal"
	| "vertical"
	| "horizontal+vertical"
	| "vertical+horizontal"
	| "top"
	| "random"
	| "repeat"
	| "fixed"
	| "overlay" // Note: Base overlay method
	| "overlay_ctm"
	| "overlay_random"
	| "overlay_repeat"
	| "overlay_fixed";

export type CtmMethodOverlay =
	| "overlay"
	| "overlay_ctm"
	| "overlay_random"
	| "overlay_repeat"
	| "overlay_fixed";

/**
 * Types for the 'connect' property.
 */
export type CtmConnectType = "block" | "tile" | "state";

/**
 * Valid values for the 'faces' property.
 */
export type CtmFace =
	| "bottom"
	| "top"
	| "north"
	| "south"
	| "east"
	| "west"
	| "sides" // Shorthand for north, south, east, west
	| "all"; // All faces

/**
 * Valid values for the 'symmetry' property (used in random, repeat).
 */
export type CtmSymmetry = "none" | "opposite" | "all";

/**
 * Valid values for the 'layer' property (used in overlay methods).
 */
export type CtmLayer = "cutout_mipped" | "cutout" | "translucent";

// =============================================================================
// Base CTM Properties Class
// =============================================================================

/**
 * Base class for OptiFine Connected Textures (CTM) properties.
 * Contains properties common to all CTM methods.
 */
export class CtmPropertiesBase {
		/**
		 * Method to use when choosing a block's replacement texture.
		 * This will be narrowed down in specific subclasses.
		 * Required.
		 */
		method: CtmMethod;

		/**
		 * Space-separated list of replacement tiles to use.
		 * Tiles can be names (name -> name.png), ranges (0-3 -> 0.png, 1.png...),
		 * full paths, '<skip>' (for overlays), or '<default>'.
		 * The number of required tiles depends on the method.
		 * Required.
		 */
		tiles: string;

		/**
		 * Optional. List of tiles (e.g., "minecraft:block/stone") this method should apply to.
		 * Space-separated string.
		 */
		matchTiles?: string;

		/**
		 * Optional. List of blocks this method should apply to.
		 * Format: [namespace:]name[:property1=value1,value2...:property2=value1,value2...]
		 * Space-separated string.
		 * Can often be inferred from filename (e.g., /ctm/stone/block_stone.properties -> matchBlocks=stone).
		 */
		matchBlocks?: string;

		/**
		 * Optional. The conditions under which two blocks should connect.
		 * 'block': Connect if block names match.
		 * 'tile': Connect if block tile textures match.
		 * 'state': Connect if block full states match.
		 * Default depends on context (block for matchBlocks, tile for matchTiles).
		 */
		connect?: CtmConnectType;

		/**
		 * Optional. Limit CTM to certain faces of the block.
		 * Space-separated list of 'bottom', 'top', 'north', 'south', 'east', 'west', 'sides', 'all'.
		 */
		faces?: CtmFace[]; // Could be refined to CtmFace[] if parsing is done elsewhere

		/**
		 * Optional. Space-separated list of biome names.
		 * If the first character is '!', the list is inverted (matches biomes *not* in the list).
		 */
		biomes?: string;

		/**
		 * Optional. Space-separated list of height restrictions.
		 * Can be individual integers or ranges (e.g., "0-63 128 200-255").
		 */
		heights?: string;

		/**
		 * Optional. Only applies to blocks with nameable tile entities (chests, furnaces, etc.).
		 * Matches based on the custom name given to the block in-game.
		 * Value can use glob patterns (*, ?). Example: name=ipattern:*Chest*
		 */
		name?: string;

		/**
		 * Optional. If multiple properties files match the same block/tile,
		 * the one with the highest weight is used. Default is 0.
		 * (Note: This 'weight' property is mentioned in the JSON schema but not
		 * explicitly in the general properties text, adding it based on schema).
		 */
		weight?: number;

		// Constructor to initialize properties (optional, but good practice)
		constructor(data: Partial<CtmPropertiesBase>) {
			// Required properties must be provided or handled appropriately
			if (!data.method) throw new Error("CTM property 'method' is required.");
			if (!data.tiles) throw new Error("CTM property 'tiles' is required.");

			this.method = data.method;
			this.tiles = data.tiles;
			this.matchTiles = data.matchTiles;
			this.matchBlocks = data.matchBlocks;
			this.connect = data.connect;
			this.faces = data.faces;
			this.biomes = data.biomes;
			this.heights = data.heights;
			this.name = data.name;
			this.weight = data.weight;
		}

		toString(): string {
			const properties: string[] = [];

			for (const key in this) {
				const value = this[key as keyof this];

				switch (key) {
					case "faces":
						if (value && Array.isArray(value)) {
							properties.push(`faces=${value.join(" ")}`);
						}
						break;
					case "connectBlocks":
						if (value) {
							properties.push(
								`connectBlocks=${Array.from(value as unknown as Set<string>).join(" ")}`,
							);
						}
						break;
					default:
						if (value !== undefined) {
							properties.push(
								`${key}=${CtmPropertiesBase.dedupeTokens(key, String(value))}`,
							);
						}
				}
			}

			return properties.join("\n");
		}

		private static dedupeTokens(key: string, value: string): string {
			if (!["matchBlocks", "biomes", "matchTiles", "tiles", "connectTiles"].includes(key)) {
				return value;
			}

			return [...new Set(value.split(/\s+/).filter(Boolean))].join(" ");
		}

		test(): void {
			console.log(this.toString());
		}
	}

// =============================================================================
// Specific Method Classes
// =============================================================================

// --- Standard CTM ---
export class CtmPropertiesCtm extends CtmPropertiesBase {
	override method: "ctm";
	/**
	 * Requires exactly 47 tiles. The 47th tile (index 46) is unused.
	 */
	override tiles: string;
	/**
	 * Optional. Whether to show seams on inner edges when connecting to adjacent blocks.
	 * Default: false.
	 */
	innerSeams?: boolean;

	constructor(data: Omit<Partial<CtmPropertiesCtm>, "method">) {
		super({ ...data, method: "ctm" });
		this.method = "ctm"; // Ensure correct type
		this.tiles = data.tiles ?? ""; // Required
		this.innerSeams = data.innerSeams;
	}
}

// --- Compact CTM ---
export class CtmPropertiesCtmCompact extends CtmPropertiesBase {
	override method: "ctm_compact";
	/**
	 * Requires exactly 5 tiles by default.
	 */
	override tiles: string;
	/**
	 * Optional. Whether to show seams on inner edges when connecting to adjacent blocks.
	 * Default: false.
	 */
	innerSeams?: boolean;

	/**
	 * Optional. Compact CTM tile replacement. Allows definition of replacement
	 * tile for a specific CTM case (using the index from the full 47-tile CTM).
	 * Example: `ctm.5=my_custom_tile_for_case_5`
	 */
	[key: `ctm.${number}`]:
		| string
		| number
		| undefined
		| boolean
		| CtmConnectType
		| CtmMethod
		| CtmSymmetry
		| CtmLayer; // Index signature for ctm.N properties

	constructor(data: Omit<Partial<CtmPropertiesCtmCompact>, "method">) {
		super({ ...data, method: "ctm_compact" });
		this.method = "ctm_compact"; // Ensure correct type
		this.tiles = data.tiles ?? ""; // Required
		this.innerSeams = data.innerSeams;

		// Assign ctm.N properties
		for (const key in data) {
			if (key.startsWith("ctm.") && !Number.isNaN(Number(key.substring(4)))) {
				this[key as `ctm.${number}`] = data[key as keyof typeof data] as
					| string
					| number
					| undefined;
			}
		}
	}
}

// --- Horizontal ---
export class CtmPropertiesHorizontal extends CtmPropertiesBase {
	override method: "horizontal";
	/**
	 * Requires exactly 4 tiles.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesHorizontal>, "method">) {
		super({ ...data, method: "horizontal" });
		this.method = "horizontal";
		this.tiles = data.tiles ?? "";
	}
}

// --- Vertical ---
export class CtmPropertiesVertical extends CtmPropertiesBase {
	override method: "vertical";
	/**
	 * Requires exactly 4 tiles.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesVertical>, "method">) {
		super({ ...data, method: "vertical" });
		this.method = "vertical";
		this.tiles = data.tiles ?? "";
	}
}

// --- Horizontal+Vertical ---
export class CtmPropertiesHorizontalVertical extends CtmPropertiesBase {
	override method: "horizontal+vertical";
	/**
	 * Requires exactly 7 tiles.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesHorizontalVertical>, "method">) {
		super({ ...data, method: "horizontal+vertical" });
		this.method = "horizontal+vertical";
		this.tiles = data.tiles ?? "";
	}
}

// --- Vertical+Horizontal ---
export class CtmPropertiesVerticalHorizontal extends CtmPropertiesBase {
	override method: "vertical+horizontal";
	/**
	 * Requires exactly 7 tiles.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesVerticalHorizontal>, "method">) {
		super({ ...data, method: "vertical+horizontal" });
		this.method = "vertical+horizontal";
		this.tiles = data.tiles ?? "";
	}
}

// --- Top ---
export class CtmPropertiesTop extends CtmPropertiesBase {
	override method: "top";
	/**
	 * Requires exactly 1 tile.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesTop>, "method">) {
		super({ ...data, method: "top" });
		this.method = "top";
		this.tiles = data.tiles ?? "";
	}
}

// --- Random ---
export class CtmPropertiesRandom extends CtmPropertiesBase {
	override method: "random";
	/**
	 * List of tiles to choose from randomly. Can be any length > 0.
	 */
	override tiles: string;
	/**
	 * Optional. Space-separated list of integer weights for each tile in 'tiles'.
	 * Must have the same number of entries as tiles.
	 */
	weights?: string; // Represented as string, parsing needed
	/**
	 * Optional. Repeats the random function by this amount (0-9) to increase randomness.
	 * Default: 0.
	 */
	randomLoops?: number;
	/**
	 * Optional. Desired level of symmetry for the faces of standard 6-sided blocks.
	 * 'none': All faces independent.
	 * 'opposite': Opposite faces share the same texture.
	 * 'all': All 6 faces share the same texture.
	 * Default: 'none'.
	 */
	symmetry?: CtmSymmetry;
	/**
	 * Optional. If true, links the random choice for contiguous blocks (e.g., tall grass).
	 * Requires multiple matching properties files with linked=true and same tile/weight setup.
	 * Default: false.
	 */
	linked?: boolean;

	constructor(data: Omit<Partial<CtmPropertiesRandom>, "method">) {
		super({ ...data, method: "random" });
		this.method = "random";
		this.tiles = data.tiles ?? "";
		this.weights = data.weights;
		this.randomLoops = data.randomLoops;
		this.symmetry = data.symmetry;
		this.linked = data.linked;
	}
}

// --- Repeat ---
export class CtmPropertiesRepeat extends CtmPropertiesBase {
	override method: "repeat";
	/**
	 * Required. The width of the repeating pattern.
	 */
	width: number;
	/**
	 * Required. The height of the repeating pattern.
	 */
	height: number;
	/**
	 * Required. List of tiles. Must contain exactly `width * height` tiles.
	 */
	override tiles: string;
	/**
	 * Optional. Desired level of symmetry for faces.
	 * 'none': All faces independent.
	 * 'opposite': Opposite faces share the same texture.
	 * Default: 'none'. (Note: 'all' is not listed for repeat in schema)
	 */
	symmetry?: "none" | "opposite";

	constructor(
		data: Omit<Partial<CtmPropertiesRepeat>, "method"> &
			Required<Pick<CtmPropertiesRepeat, "width" | "height">>,
	) {
		super({ ...data, method: "repeat" });
		this.method = "repeat";
		this.width = data.width; // Required
		this.height = data.height; // Required
		this.tiles = data.tiles ?? ""; // Required
		this.symmetry = data.symmetry;
	}
}

// --- Fixed ---
export class CtmPropertiesFixed extends CtmPropertiesBase {
	override method: "fixed";
	/**
	 * Requires exactly 1 tile.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesFixed>, "method">) {
		super({ ...data, method: "fixed" });
		this.method = "fixed";
		this.tiles = data.tiles ?? "";
	}
}

// --- Overlay Base (Common properties for all overlay methods) ---
abstract class CtmPropertiesOverlayBase extends CtmPropertiesBase {
	// Method type will be one of the overlay variants
	override method: CtmMethodOverlay;

	/**
	 * Optional. Connect only to blocks which are using one of the specified tiles.
	 * Space-separated list of tile names.
	 */
	connectTiles?: string;

	/**
	 * Optional. Connect only to blocks specified in this list.
	 * Space-separated list of block names/states.
	 */
	connectBlocks?: Set<string>; // Set of block identifiers

	/**
	 * Optional. What tint index to use for the overlay tile's texture.
	 * Use -1 to disable tinting.
	 * Default: -1.
	 */
	tintIndex?: number;

	/**
	 * Optional. The block used for the tile texture tinting (if tintIndex is >= 0).
	 * Specifies which block's color map to use for the tint.
	 */
	tintBlock?: string; // Block identifier string

	/**
	 * Optional. The rendering layer on which the overlay texture should be rendered.
	 * 'cutout_mipped': Standard transparent textures with mipmaps.
	 * 'cutout': Transparent textures without mipmaps (sharper edges).
	 * 'translucent': Translucent textures (like stained glass).
	 * Default: 'cutout_mipped'.
	 */
	layer?: CtmLayer;

	constructor(data: Partial<CtmPropertiesOverlayBase>) {
		super(data);
		// Ensure method is an overlay type
		if (
			![
				"overlay",
				"overlay_ctm",
				"overlay_random",
				"overlay_repeat",
				"overlay_fixed",
			].includes(data.method as string)
		) {
			throw new Error(
				"Method must be an overlay type for CtmPropertiesOverlayBase",
			);
		}
		this.method = data.method as CtmMethodOverlay;
		this.connectTiles = data.connectTiles;
		this.connectBlocks = data.connectBlocks;
		this.tintIndex = data.tintIndex;
		this.tintBlock = data.tintBlock;
		this.layer = data.layer;
	}
}

// --- Overlay (Standard) ---
export class CtmPropertiesOverlay extends CtmPropertiesOverlayBase {
	override method: "overlay";
	/**
	 * Requires exactly 17 tiles. Can use '<skip>'. Cannot use '<default>'.
	 * Indices 17-20 (if provided) are unused.
	 */
	// override tiles: string;

	constructor(data?: Omit<Partial<CtmPropertiesOverlay>, "method">) {
		super({ ...data, method: "overlay", tiles: data?.tiles ?? "0-16" });
		this.method = "overlay";
	}
}

// --- Overlay CTM ---
export class CtmPropertiesOverlayCtm extends CtmPropertiesOverlayBase {
	override method: "overlay_ctm";
	/**
	 * Tile requirements likely match standard CTM (47 tiles), but documentation isn't explicit.
	 * Can use '<skip>'. Cannot use '<default>'.
	 */
	override tiles: string;
	/**
	 * Optional. Whether to show seams on inner edges when connecting to adjacent blocks.
	 * Default: false.
	 */
	innerSeams?: boolean;

	constructor(data: Omit<Partial<CtmPropertiesOverlayCtm>, "method">) {
		super({ ...data, method: "overlay_ctm" });
		this.method = "overlay_ctm";
		this.tiles = data.tiles ?? "";
		this.innerSeams = data.innerSeams;
	}
}

// --- Overlay Random ---
export class CtmPropertiesOverlayRandom extends CtmPropertiesOverlayBase {
	override method: "overlay_random";
	/**
	 * List of tiles to choose from randomly. Can be any length > 0.
	 * Can use '<skip>'. Cannot use '<default>'.
	 */
	override tiles: string;
	/**
	 * Optional. Space-separated list of integer weights for each tile in 'tiles'.
	 */
	weights?: string;
	/**
	 * Optional. Repeats the random function by this amount (0-9) to increase randomness.
	 * Default: 0.
	 */
	randomLoops?: number;
	/**
	 * Optional. Desired level of symmetry ('none', 'opposite', 'all').
	 * Default: 'none'.
	 */
	symmetry?: CtmSymmetry;
	/**
	 * Optional. Whether to link textures between related blocks.
	 * Default: false.
	 */
	linked?: boolean;

	constructor(data: Omit<Partial<CtmPropertiesOverlayRandom>, "method">) {
		super({ ...data, method: "overlay_random" });
		this.method = "overlay_random";
		this.tiles = data.tiles ?? "";
		this.weights = data.weights;
		this.randomLoops = data.randomLoops;
		this.symmetry = data.symmetry;
		this.linked = data.linked;
	}
}

// --- Overlay Repeat ---
export class CtmPropertiesOverlayRepeat extends CtmPropertiesOverlayBase {
	override method: "overlay_repeat";
	/**
	 * Required. The width of the repeating pattern.
	 */
	width: number;
	/**
	 * Required. The height of the repeating pattern.
	 */
	height: number;
	/**
	 * Required. List of tiles. Must contain exactly `width * height` tiles.
	 * Can use '<skip>'. Cannot use '<default>'.
	 */
	override tiles: string;
	/**
	 * Optional. Desired level of symmetry ('none', 'opposite').
	 * Default: 'none'.
	 */
	symmetry?: "none" | "opposite";

	constructor(
		data: Omit<Partial<CtmPropertiesOverlayRepeat>, "method"> &
			Required<Pick<CtmPropertiesOverlayRepeat, "width" | "height">>,
	) {
		super({ ...data, method: "overlay_repeat" });
		this.method = "overlay_repeat";
		this.width = data.width;
		this.height = data.height;
		this.tiles = data.tiles ?? "";
		this.symmetry = data.symmetry;
	}
}

// --- Overlay Fixed ---
export class CtmPropertiesOverlayFixed extends CtmPropertiesOverlayBase {
	override method: "overlay_fixed";
	/**
	 * Requires exactly 1 tile.
	 * Can use '<skip>'. Cannot use '<default>'.
	 */
	override tiles: string;

	constructor(data: Omit<Partial<CtmPropertiesOverlayFixed>, "method">) {
		super({ ...data, method: "overlay_fixed" });
		this.method = "overlay_fixed";
		this.tiles = data.tiles ?? "";
	}
}

// =============================================================================
// Union Type for Any CTM Properties
// =============================================================================

/**
 * Represents any valid CTM properties configuration object.
 */
export type AnyCtmProperties =
	| CtmPropertiesCtm
	| CtmPropertiesCtmCompact
	| CtmPropertiesHorizontal
	| CtmPropertiesVertical
	| CtmPropertiesHorizontalVertical
	| CtmPropertiesVerticalHorizontal
	| CtmPropertiesTop
	| CtmPropertiesRandom
	| CtmPropertiesRepeat
	| CtmPropertiesFixed
	| CtmPropertiesOverlay
	| CtmPropertiesOverlayCtm
	| CtmPropertiesOverlayRandom
	| CtmPropertiesOverlayRepeat
	| CtmPropertiesOverlayFixed;
