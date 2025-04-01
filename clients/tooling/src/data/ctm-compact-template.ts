import type { Tile } from "@/types/Tile";

export const tiles: Record<number, Tile> = {
  0: {
    sides: ["top", "bottom", "left", "right"],
    corners: [],
  },
  1: {
    sides: [],
    corners: [],
  },
  2: {
    sides: ["left", "right"],
    corners: [],
  },
  3: {
    sides: ["top", "bottom"],
    corners: [],
  },
  4: {
    sides: [],
    corners: ["bottom-right", "top-left", "top-right", "bottom-left"],
  },
};
