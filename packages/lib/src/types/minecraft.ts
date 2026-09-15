import type { Brand } from "./utils";

export type Namespace = string;

export type Block = string;

export type BlockCategories = {
    woods: {
        log: Block[],
        planks: Block[],
        wood: Block[],
        stripped: {
            log: Block[],
            wood: Block[],
        },
    },
    leaves: Block[],
    stones: {
        natural: Block[],
    },
    masonry_blocks: {
        bricks: Block[],
        polished: Block[],
        chiseled: Block[],
    },
    grasses: Block[],
    soil: Block[],
    ores: {
        nether: Block[],
        stone: Block[],
        deepslate: Block[],
    },
    precious_blocks: Block[],
    copper_blocks: {
        base: {
            unwaxed: Block[],
            waxed: Block[],
        },
        exposed: {
            unwaxed: Block[],
            waxed: Block[],
        },
        weathered: {
            unwaxed: Block[],
            waxed: Block[],
        },
        oxidized: {
            unwaxed: Block[],
            waxed: Block[],
        },
    },
    nether_blocks: Block[],
    terracotta: Block[],
    glazed_terracotta: Block[],
    concrete: {
        hardened: Block[],
        powder: Block[],
    },
    wool: Block[],
    glass: Block[],
    vegetation_blocks: Block[],
    cold_block: Block[],
    coral_blocks: Block[],
    utility_blocks: Block[],
    shulker_boxes: Block[],
    prismarine: Block[],
    misc_blocks: Block[],
};