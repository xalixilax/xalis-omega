#!/usr/bin/env bun
/**
 * Builds + verifies a compact overlay-CTM test grid covering all 17 overlay
 * tile ids from clients/tooling/src/data/ctm-overlay.ts as one connected blob.
 *
 * Layout idea:
 *   - a solid 6x4 rectangle yields tiles 8,3,4,10,11 (interior + corners),
 *     5,13 (top/bottom strips) and 12,6 (left/right strips)
 *   - four single-strip cells stick out N/S/E/W giving 1,15,9,7
 *   - four diagonal-only specks give the corner-dot tiles 0,2,14,16
 *
 * Every filled cell is checked against its real 8-neighbourhood using the
 * overlay convention: side strips follow orthogonal neighbours; a corner dot
 * exists only when there are no orthogonal neighbours and exactly that
 * diagonal neighbour.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { tiles } from "../clients/tooling/src/data/ctm-overlay";

type Sides = "top" | "bottom" | "left" | "right";
type Corners = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const SIDE_BIT: Record<Sides, number> = { top: 1, bottom: 2, left: 4, right: 8 };
const CORNER_BIT: Record<Corners, number> = {
  "top-left": 1,
  "top-right": 2,
  "bottom-left": 4,
  "bottom-right": 8,
};

const table = tiles as Record<
  number,
  { sides?: Sides[]; corners?: Corners[] }
>;
const IDS = Object.keys(table).map(Number).sort((a, b) => a - b);

const SIDES_OF = new Map<number, number>();
const CORNERS_OF = new Map<number, number>();
for (const id of IDS) {
  let s = 0;
  for (const x of table[id].sides ?? []) s |= SIDE_BIT[x];
  let c = 0;
  for (const x of table[id].corners ?? []) c |= CORNER_BIT[x];
  SIDES_OF.set(id, s);
  CORNERS_OF.set(id, c);
}

const EMPTY = -1;

// "." = empty, otherwise glyph -> tile id (0-9, A=10 .. G=16)
//   col    0    1    2    3    4    5    6    7
const SPEC = [
  /* y=0 */ "0.1....2",
  /* y=1 */ ".385554.",
  /* y=2 */ ".C888889",
  /* y=3 */ "7888886.",
  /* y=4 */ ".AD8DDB.",
  /* y=5 */ "E..F...G",
];
const GLYPH_VALUE: Record<string, number> = {};
for (let i = 0; i <= 16; i++) GLYPH_VALUE["0123456789ABCDEFG"[i]] = i;

function parseSpec(): { grid: Int8Array; W: number; H: number } {
  const H = SPEC.length;
  const W = SPEC[0].length;
  const grid = new Int8Array(W * H).fill(EMPTY);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const ch = SPEC[y][x];
      if (ch === ".") continue;
      const v = GLYPH_VALUE[ch];
      if (v === undefined) throw new Error(`bad glyph '${ch}' at ${x},${y}`);
      grid[y * W + x] = v;
    }
  return { grid, W, H };
}

/** tile id the overlay method shows for the neighbourhood of (x,y) */
function expectedIdAt(grid: Int8Array, W: number, H: number, x: number, y: number): number | null {
  const filled = (nx: number, ny: number) =>
    nx >= 0 && ny >= 0 && nx < W && ny < H && grid[ny * W + nx] !== EMPTY;
  let sides = 0;
  for (const [name, bit] of Object.entries(SIDE_BIT))
    if (
      filled(
        x + (name === "right" ? 1 : name === "left" ? -1 : 0),
        y + (name === "bottom" ? 1 : name === "top" ? -1 : 0)
      )
    )
      sides |= bit;
  let corners = 0;
  for (const [name, bit] of Object.entries(CORNER_BIT)) {
    const dx =
      name === "top-left" || name === "bottom-left" ? -1 : 1;
    const dy = name === "top-left" || name === "top-right" ? -1 : 1;
    if (filled(x + dx, y + dy)) corners |= bit;
  }
  for (const id of IDS) {
    if (SIDES_OF.get(id) !== sides) continue;
    if (sides !== 0) {
      if (CORNERS_OF.get(id) === 0) return id;
    } else if (CORNERS_OF.get(id) === corners) {
      return id;
    }
  }
  return null;
}

function verify(grid: Int8Array, W: number, H: number) {
  const counts = new Map<number, number>();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = grid[y * W + x];
      if (p === EMPTY) continue;
      const expected = expectedIdAt(grid, W, H, x, y);
      if (expected !== p)
        throw new Error(
          `inconsistent cell (${x},${y}): placed ${p}, neighbourhood yields ${expected}`
        );
      counts.set(p, (counts.get(p) ?? 0) + 1);
    }
  const missing = IDS.filter((id) => !counts.has(id));
  return { counts, missing };
}

function components(grid: Int8Array, W: number, H: number): number {
  const seen = new Uint8Array(W * H);
  let comps = 0;
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (grid[i] === EMPTY || seen[i]) continue;
    comps++;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const c = stack.pop()!;
      const cx = c % W, cy = (c / W) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const ni = ny * W + nx;
          if (!seen[ni] && grid[ni] !== EMPTY) {
            seen[ni] = 1;
            stack.push(ni);
          }
        }
    }
  }
  return comps;
}

function ascii(grid: Int8Array, W: number, H: number): string {
  const lines: string[] = [];
  for (let y = 0; y < H; y++) {
    let row = "";
    for (let x = 0; x < W; x++)
      row += grid[y * W + x] === EMPTY ? "." : "0123456789ABCDEFG"[grid[y * W + x]];
    lines.push(row);
  }
  return lines.join("\n");
}

function legend(): string {
  return IDS.map((id) => {
    const d = table[id];
    return [
      `"0123456789ABCDEFG"[${id}] -> tile ${String(id).padStart(2)}:`,
      d.sides?.length ? `sides=${d.sides.join("+")}` : "sides=-",
      d.corners?.length ? `corners=${d.corners.join("+")}` : "corners=-",
    ].join(" ");
  }).join("\n");
}

async function main() {
  const { grid, W, H } = parseSpec();
  const { counts, missing } = verify(grid, W, H);
  const comps = components(grid, W, H);
  console.log(`grid ${W}x${H}, blobs=${comps}, distinct tiles=${counts.size}/${IDS.length}`);
  console.log("coverage:", [...counts.entries()].map(([id, n]) => `${id}x${n}`).join(" "));
  if (missing.length) throw new Error(`missing tiles: ${missing.join(",")}`);

  const outDir = join(import.meta.dir, "..", ".tmp", "ctm-overlay-test-grid");
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, "preview.txt"), `${ascii(grid, W, H)}\n\n${legend()}\n`);

  const placements = [] as { x: number; y: number; tile: number }[];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (grid[y * W + x] !== EMPTY) placements.push({ x, y, tile: grid[y * W + x] });

  await writeFile(
    join(outDir, "placement.json"),
    JSON.stringify({ width: W, height: H, placements }, null, 2)
  );

  const rgba = Buffer.alloc(W * H * 4, 0);
  for (let i = 0; i < W * H; i++)
    if (grid[i] !== EMPTY) {
      rgba[i * 4] = 250;
      rgba[i * 4 + 1] = 80;
      rgba[i * 4 + 2] = 240;
      rgba[i * 4 + 3] = 255;
    }
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toFile(join(outDir, "mask.png"));

  console.log(`\npreview:\n${ascii(grid, W, H)}`);
  console.log("\nartifacts in .tmp/ctm-overlay-test-grid/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
