import type { tiles as overlayTiles } from "./ctm-overlay";

export const TEST_GRID_W = 8;
export const TEST_GRID_H = 6;

export type TestGridCell = {
	x: number;
	y: number;
	tile: keyof typeof overlayTiles;
};

export const overlayTestGrid: TestGridCell[] = [
	{ x: 0, y: 0, tile: 0 },
	{ x: 2, y: 0, tile: 1 },
	{ x: 7, y: 0, tile: 2 },
	{ x: 1, y: 1, tile: 3 },
	{ x: 2, y: 1, tile: 8 },
	{ x: 3, y: 1, tile: 5 },
	{ x: 4, y: 1, tile: 5 },
	{ x: 5, y: 1, tile: 5 },
	{ x: 6, y: 1, tile: 4 },
	{ x: 1, y: 2, tile: 12 },
	{ x: 2, y: 2, tile: 8 },
	{ x: 3, y: 2, tile: 8 },
	{ x: 4, y: 2, tile: 8 },
	{ x: 5, y: 2, tile: 8 },
	{ x: 6, y: 2, tile: 8 },
	{ x: 7, y: 2, tile: 9 },
	{ x: 0, y: 3, tile: 7 },
	{ x: 1, y: 3, tile: 8 },
	{ x: 2, y: 3, tile: 8 },
	{ x: 3, y: 3, tile: 8 },
	{ x: 4, y: 3, tile: 8 },
	{ x: 5, y: 3, tile: 8 },
	{ x: 6, y: 3, tile: 6 },
	{ x: 1, y: 4, tile: 10 },
	{ x: 2, y: 4, tile: 13 },
	{ x: 3, y: 4, tile: 8 },
	{ x: 4, y: 4, tile: 13 },
	{ x: 5, y: 4, tile: 13 },
	{ x: 6, y: 4, tile: 11 },
	{ x: 0, y: 5, tile: 14 },
	{ x: 3, y: 5, tile: 15 },
	{ x: 7, y: 5, tile: 16 },
];
