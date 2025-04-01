import type { Tile } from "@/types/Tile";

export const tiles: Record<number, Tile> = {
  0: {
    sides: [],
    corners: ["bottom-right"],
  },
  1: {
    sides: ["bottom"],
    corners: []
  },
  2: {
    sides: [],
    corners: ["bottom-left"],
  },
  3: {
    sides: ["bottom", "right"],
    corners: []
  },
  4: {
    sides: ["bottom", "left"],
    corners: []
  },
  5: {
    sides: ["bottom", "left", "right"],
    corners: []
  },
  6: {
    sides: ["top", "left", "bottom"],
    corners: []
  },
  7: {
    sides: ["right"],
    corners: []
  },
  8: {
    sides: ["top", "right", "bottom", "left"],
    corners: []
  },
  9: {
    sides: ["left"],
    corners: []
  },
  10: {
    sides: ["top", "right"],
    corners: []
  },
  11: {
    sides: ["top", "left"],
    corners: []
  },
  12: {
    sides: ["top", "bottom", "right"],
    corners: []
  },
  13: {
    sides: ["top", "left", "right"],
    corners: []
  },
  14: {
    sides: [],
    corners: ["top-right"],
  },
  15: {
    sides: ["top"],
    corners: []
  },
  16: {
    sides: [],
    corners: ["top-left"],
  },
};
