type Sides = "top" | "bottom" | "left" | "right";
type Corners = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type Tile = {
  sides?: Sides[];
  corners?: Corners[];
};

export function isTile(tile: any): tile is Tile {
  return (
    typeof tile === "object" &&
    (Array.isArray(tile.sides) || tile.sides === undefined) &&
    (Array.isArray(tile.corners) || tile.corners === undefined)
  );
}
