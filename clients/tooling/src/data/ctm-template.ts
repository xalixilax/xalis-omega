import type { Tile } from "@/types/Tile";


export const tiles: Record<number, Tile> = {
  0: {
    sides: ["top", "bottom", "left", "right"],
    corners: [],
  },
  1: {
    sides: ["top", "bottom", "left"],
    corners: ["bottom-right"],
  },
  2: {
    sides: ["top", "bottom"],
    corners: [],
  },
  3: {
    sides: ["top", "bottom", "right"],
    corners: [],
  },
  4: {
    sides: ["top", "left"],
    corners: ["bottom-right"],
  },
  5: {
    sides: ["top", "right"],
    corners: ["bottom-left"],
  },
  6: {
    sides: ["left"],
    corners: ["top-right", "bottom-right"],
  },
  7: {
    sides: ["top"],
    corners: ["bottom-left", "bottom-right"],
  },
  8: {
    sides: [],
    corners: ["top-left", "bottom-left", "bottom-right"],
  },
  9: {
    sides: [],
    corners: ["top-left", "top-right", "bottom-left"],
  },
  10: {
    sides: [],
    corners: ["top-right", "bottom-right"],
  },
  11: {
    sides: [],
    corners: ["bottom-left", "bottom-right"],
  },
  12: {
    sides: ["top", "left", "right"],
    corners: [],
  },
  13: {
    sides: ["top", "left"],
    corners: [],
  },
  14: {
    sides: ["top"],
    corners: [],
  },
  15: {
    sides: ["top", "right"],
    corners: [],
  },
  16: {
    sides: ["left", "bottom"],
    corners: ["top-right"],
  },
  17: {
    sides: ["right", "bottom"],
    corners: ["top-left"],
  },
  18: {
    sides: ["bottom"],
    corners: ["top-left", "top-right"],
  },
  19: {
    sides: ["right"],
    corners: ["top-left", "bottom-left"],
  },
  20: {
    sides: [],
    corners: ["top-right", "bottom-left", "bottom-right"],
  },
  21: {
    sides: [],
    corners: ["top-left", "top-right", "bottom-right"],
  },
  22: {
    sides: [],
    corners: ["top-left", "top-right"],
  },
  23: {
    sides: [],
    corners: ["bottom-left", "top-left"],
  },
  24: {
    sides: ["right", "left"],
    corners: [],
  },
  25: {
    sides: ["left"],
    corners: [],
  },
  26: {
    sides: [],
    corners: [],
  },
  27: {
    sides: ["right"],
    corners: [],
  },
  28: {
    sides: ["left"],
    corners: ["top-right"],
  },
  29: {
    sides: ["top"],
    corners: ["bottom-right"],
  },
  30: {
    sides: ["left"],
    corners: ["bottom-right"],
  },
  31: {
    sides: ["top"],
    corners: ["bottom-left"],
  },
  32: {
    sides: [],
    corners: ["bottom-right"],
  },
  33: {
    sides: [],
    corners: ["bottom-left"],
  },
  34: {
    sides: [],
    corners: ["top-left", "bottom-right"],
  },
  35: {
    sides: [],
    corners: ["top-right", "bottom-left"],
  },
  36: {
    sides: ["left", "right", "bottom"],
    corners: [],
  },
  37: {
    sides: ["left", "bottom"],
    corners: [],
  },
  38: {
    sides: ["bottom"],
    corners: [],
  },
  39: {
    sides: ["right", "bottom"],
    corners: [],
  },
  40: {
    sides: ["bottom"],
    corners: ["top-left"],
  },
  41: {
    sides: ["right"],
    corners: ["bottom-left"],
  },
  42: {
    sides: ["bottom"],
    corners: ["top-right"],
  },
  43: {
    sides: ["right"],
    corners: ["top-left"],
  },
  44: {
    sides: [],
    corners: ["top-right"],
  },
  45: {
    sides: [],
    corners: ["top-left"],
  },
  46: {
    sides: [],
    corners: ["top-left", "top-right", "bottom-right", "bottom-left"],
  },
};
