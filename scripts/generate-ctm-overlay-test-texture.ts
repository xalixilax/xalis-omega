#!/usr/bin/env bun
/**
 * Composites the 17 overlay tiles of a resourcepack overlay template
 * (default: calcite_0.png, 7x3 sheet of 16px tiles) onto the verified 8x6
 * test-grid placement from .tmp/ctm-overlay-test-grid/placement.json.
 *
 * Checks:
 *  1. placement consistency (neighbourhood -> tile id, overlay convention)
 *  2. seam continuity: for every pair of orthogonally adjacent filled cells,
 *     the opaque pixel masks on both sides of the shared edge must match
 *
 * Outputs (in .tmp/ctm-overlay-test-grid/):
 *  - test-grid-calcite.png       native 128x96, overlay only, transparent bg
 *  - test-grid-calcite-x6.png    6x preview over tiled base calcite blocks
 *  - test-grid-calcite-annotated-x6.png  same + tile id printed per cell
 *  - test-grid-report.txt        verification report
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { tiles } from "../clients/tooling/src/data/ctm-overlay";

type Sides = "top" | "bottom" | "left" | "right";
type Corners = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const INPUT = "resourcepacks/xalis_enhanced_vanilla/textures/calcite_0.png";
const OUT_DIR = ".tmp/ctm-overlay-test-grid";
const S = 16; // tile size in px
const COLS = 7; // template sheet layout

const SIDE_BIT: Record<Sides, number> = { top: 1, bottom: 2, left: 4, right: 8 };
const CORNER_BIT: Record<Corners, number> = {
  "top-left": 1,
  "top-right": 2,
  "bottom-left": 4,
  "bottom-right": 8,
};

const table = tiles as Record<number, { sides?: Sides[]; corners?: Corners[] }>;
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

type Placement = { width: number; height: number; placements: { x: number; y: number; tile: number }[] };

function buildGrid(p: Placement) {
  const grid = new Int8Array(p.width * p.height).fill(EMPTY);
  for (const c of p.placements) grid[c.y * p.width + c.x] = c.tile;
  return grid;
}

function expectedIdAt(grid: Int8Array, W: number, H: number, x: number, y: number): number | null {
  const filled = (nx: number, ny: number) =>
    nx >= 0 && ny >= 0 && nx < W && ny < H && grid[ny * W + nx] !== EMPTY;
  let sides = 0;
  for (const [name, bit] of Object.entries(SIDE_BIT))
    if (filled(x + (name === "right" ? 1 : name === "left" ? -1 : 0), y + (name === "bottom" ? 1 : name === "top" ? -1 : 0))) sides |= bit;
  let corners = 0;
  for (const [name, bit] of Object.entries(CORNER_BIT)) {
    const dx = name === "top-left" || name === "bottom-left" ? -1 : 1;
    const dy = name === "top-left" || name === "top-right" ? -1 : 1;
    if (filled(x + dx, y + dy)) corners |= bit;
  }
  for (const id of IDS) {
    if (SIDES_OF.get(id) !== sides) continue;
    if (sides !== 0 ? CORNERS_OF.get(id) === 0 : CORNERS_OF.get(id) === corners) return id;
  }
  return null;
}

const report: string[] = [];
function log(line = "") {
  console.log(line);
  report.push(line);
}

async function main() {
  const placement: Placement = JSON.parse(await readFile(join(OUT_DIR, "placement.json"), "utf8"));
  const { width: W, height: H } = placement;
  const grid = buildGrid(placement);

  // ---- check 1: placement consistency -------------------------------------
  let placementErrors = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = grid[y * W + x];
      if (p === EMPTY) continue;
      const expected = expectedIdAt(grid, W, H, x, y);
      if (expected !== p) {
        placementErrors++;
        log(`PLACEMENT ERROR (${x},${y}): placed ${p}, neighbourhood yields ${expected}`);
      }
    }
  log(`check 1 placement consistency: ${placementErrors === 0 ? "OK" : `${placementErrors} ERRORS`}`);

  // ---- load template tiles -------------------------------------------------
  const sheet = sharp(INPUT).ensureAlpha();
  const meta = await sheet.metadata();
  if (!meta.width || !meta.height) throw new Error("cannot read sheet metadata");
  const raw = await sheet.raw().toBuffer();
  const sw = meta.width;
  log(`template sheet ${sw}x${meta.height}, tile ${S}px`);

  const alphaAt = (tile: number, x: number, y: number) => {
    const px = ((tile % COLS) * S + x) * 4;
    const py = ((tile / COLS) | 0) * S + y;
    return raw[py * sw * 4 + px + 3];
  };

  // ---- check 2: seam continuity -------------------------------------------
  let seamCount = 0;
  let seamErrors = 0;
  const diff = (xa: number, xb: number) => (xa > 127) !== (xb > 127);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const a = grid[y * W + x];
      if (a === EMPTY) continue;
      // vertical seam: a's right edge vs neighbour b's left edge
      if (x + 1 < W && grid[y * W + x + 1] !== EMPTY) {
        const b = grid[y * W + x + 1];
        seamCount++;
        const mismatches: number[] = [];
        for (let yy = 0; yy < S; yy++)
          if (diff(alphaAt(a, S - 1, yy), alphaAt(b, 0, yy))) mismatches.push(yy);
        if (mismatches.length) {
          seamErrors++;
          log(`SEAM ERROR (${x},${y}|${x + 1},${y}) tiles ${a}|${b}: right|left mismatch at y=${mismatches.join(",")}`);
        }
      }
      // horizontal seam: a's bottom edge vs neighbour b's top edge
      if (y + 1 < H && grid[(y + 1) * W + x] !== EMPTY) {
        const b = grid[(y + 1) * W + x];
        seamCount++;
        const mismatches: number[] = [];
        for (let xx = 0; xx < S; xx++)
          if (diff(alphaAt(a, xx, S - 1), alphaAt(b, xx, 0))) mismatches.push(xx);
        if (mismatches.length) {
          seamErrors++;
          log(`SEAM ERROR (${x},${y}|${x},${y + 1}) tiles ${a}|${b}: bottom|top mismatch at x=${mismatches.join(",")}`);
        }
      }
    }
  log(`check 2 seam continuity: ${seamCount} seams, ${seamErrors === 0 ? "all OK" : `${seamErrors} ERRORS`}`);

  // ---- composite ------------------------------------------------------------
  const canvas = Buffer.alloc(W * S * H * S * 4, 0);
  for (const c of placement.placements)
    for (let yy = 0; yy < S; yy++)
      for (let xx = 0; xx < S; xx++) {
        const src = ((((c.tile / COLS) | 0) * S + yy) * sw + (c.tile % COLS) * S + xx) * 4;
        const dst = ((c.y * S + yy) * W * S + c.x * S + xx) * 4;
        canvas[dst] = raw[src];
        canvas[dst + 1] = raw[src + 1];
        canvas[dst + 2] = raw[src + 2];
        canvas[dst + 3] = raw[src + 3];
      }

  await sharp(canvas, { raw: { width: W * S, height: H * S, channels: 4 } })
    .png()
    .toFile(join(OUT_DIR, "test-grid-calcite.png"));

  // 6x preview: tiled vanilla base calcite beneath the overlay, as in game
  const SCALE = 6;
  const baseTile = await sharp(join(OUT_DIR, "base", "calcite.png"))
    .ensureAlpha()
    .raw()
    .toBuffer();
  const scene = Buffer.alloc(W * S * H * S * 4, 0);
  for (let y = 0; y < H * S; y++)
    for (let x = 0; x < W * S; x++) {
      const d = (y * W * S + x) * 4;
      const s = ((y % S) * S + (x % S)) * 4;
      scene[d] = baseTile[s];
      scene[d + 1] = baseTile[s + 1];
      scene[d + 2] = baseTile[s + 2];
      scene[d + 3] = 255;
      const o = (y * W * S + x) * 4;
      if (canvas[o + 3] > 127) {
        scene[d] = canvas[o];
        scene[d + 1] = canvas[o + 1];
        scene[d + 2] = canvas[o + 2];
      }
    }
  await sharp(scene, { raw: { width: W * S, height: H * S, channels: 4 } })
    .resize(W * S * SCALE, H * S * SCALE, { kernel: "nearest" })
    .png()
    .toFile(join(OUT_DIR, "test-grid-calcite-x6.png"));

  // annotated variant: tile id printed on every filled cell
  const labelSvgs: string[] = [];
  for (const c of placement.placements)
    labelSvgs.push(
      `<text x="${c.x * S + S / 2}" y="${c.y * S + S / 2 + 3}" font-family="monospace" font-size="9" font-weight="bold" fill="black" fill-opacity="0.85" stroke="white" stroke-width="0.5" paint-order="stroke" text-anchor="middle">${c.tile}</text>`
    );
  const labelLayer = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W * S}" height="${H * S}">${labelSvgs.join("")}</svg>`
  );
  const annotated = await sharp(
    await sharp(scene, { raw: { width: W * S, height: H * S, channels: 4 } })
      .resize(W * S * SCALE, H * S * SCALE, { kernel: "nearest" })
      .png()
      .toBuffer()
  )
    .composite([
      {
        input: await sharp(labelLayer)
          .resize(W * S * SCALE, H * S * SCALE, { kernel: "nearest" })
          .png()
          .toBuffer(),
      },
    ])
    .png()
    .toFile(join(OUT_DIR, "test-grid-calcite-annotated-x6.png"));
  void annotated;

  const used = new Set(placement.placements.map((p) => p.tile));
  log(`tiles used: ${used.size}/17`);
  if (placementErrors || seamErrors) throw new Error("verification failed, see report");
  log("RESULT: OK");

  await writeFile(join(OUT_DIR, "test-grid-report.txt"), report.join("\n") + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
