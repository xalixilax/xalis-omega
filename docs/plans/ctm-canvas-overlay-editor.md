# Plan: CTM Canvas Overlay Editor

A single-page editor for authoring Continuity `overlay` connected-texture sheets.
Built in the `clients/ctm-canvas` TanStack Start project.

## Goal

Upload a 16/32/64px square block texture, edit a 7x3 overlay tile sheet for the
Continuity `overlay` method (17 used cells + 4 padding), preview every one of
the 17 connection states composited over the uploaded base texture, and export a
ready-to-use overlay PNG plus a minimal `.properties` file.

Continuity Connected Textures Spec:
https://github.com/PepperCode1/Continuity/wiki/Continuity-Connected-Textures-Specification

## Sheet layout

- 7 columns x 3 rows = 21 cells (17 used, indices 0-16, 4 padding cells).
- Matches the existing `resourcepacks/xalis_enhanced_vanilla/textures/amethyst_0.png`
  (112 x 48 = 7x3 of 16px tiles).
- Tile index `i` (0..16) describes which sides/corners are connected (see
  `clients/tooling/src/data/ctm-overlay.ts` for the canonical descriptor).

## Layered state model

Three sheets live in a TanStack Store:

1. `base` — read-only ImageData of the uploaded image, copied unchanged into
   every used cell of the 7x3 grid. Used as the background for the left canvas
   and the center block of each right-panel mini 3x3 field.
2. `alpha` — `Uint8Array(21 * N * N)` of binary 1/0 values per pixel per cell.
   1 = overlay color visible at that pixel; 0 = overlay absent. No partial
   transparency (Continuity masks are strictly binary).
3. `color` — `Uint8Array(21 * N * N * 4)` RGBA per pixel per cell. Initialised
   by copying the uploaded image into every cell.

Composited left-canvas pixel = `base` underneath, then `color` where `alpha`==1.

## Upload flow

1. User picks a square 16/32/64px PNG.
2. Palette is extracted: exact-match unique colours sorted by occurrence count,
   top N shown as swatches.
3. `base` sheet = uploaded image copied into all 17 used cells.
4. `color` sheet = same copied image into all 17 used cells.
5. `alpha` sheet = the bundled `soft-stone.png` template split into 17 cells.
   A small picker lists available templates (only soft-stone initially) so the
   folder can grow later.

## Left canvas (the editor)

- One HTML5 `<canvas>` at native sheet resolution (e.g. 112x48 for 16px input),
  scaled up to fit the viewport via `image-rendering: pixelated`.
- Each frame repaints base + (color x alpha) per cell.
- A second overlaid `<canvas>` (or SVG) draws the faint side/corner guide
  markers per cell based on that tile's descriptor. These guides are NOT
  burned into the export.
- Active cell highlighted with a border.

### Tools

Toolbar on the left of the editor:

- **Paint** — set `alpha[pixel] = 1` AND `color[pixel] = activeColor` (from
  palette) in the current cell.
- **Erase** — set `alpha[pixel] = 0`.
- **Picker** — sample `color[pixel]` of clicked pixel, set it as active palette
  slot if it exists in palette, else append.
- **Pan** — drag-scroll the canvas if it exceeds viewport.

Only one tool is active at a time. 1px brush (the tiles are 16x16).

## Right panel (the preview)

- 17 mini 3x3 block-fields arranged in the same 7x3 grid layout.
- Each mini 3x3 configures the 8 neighbors of its center block to the
  connection pattern that triggers that tile index, using the
  `clients/tooling/src/data/ctm-overlay.ts` descriptors as the canonical
  lookup from neighbor pattern to tile index.
- Each block in every mini renders base texture (tiled) and the center block
  additionally composites the overlay tile (color x alpha) on top.
- Repaints whenever any of `base`, `color`, `alpha` changes.

## Overlay lookup

Reuse `clients/tooling/src/data/ctm-overlay.ts` as the descriptor table.
Algorithm (in `src/routes/-lib/overlay.ts`):

1. For a given center block's 8 neighbors, compute the 4 side booleans and
   4 corner booleans (a corner counts only if both adjacent sides are
   connected — confirmed against the existing descriptors).
2. Find the tile index in `ctm-overlay.ts` whose `sides` / `corners` arrays
   equal the computed booleans. Returns tile index 0..16.
3. Used by the right panel to render each preview block and by the export
   pipeline only as a sanity reference.

## Persistence

Local-only autosave (debounced):

- Serialise `alpha` + `color` arrays, `palette`, active cell / tool / color,
  and the `base` image data URL into `localStorage` under a single key
  (e.g. `ctm-canvas:v1`).
- On mount, if a saved state exists and the user confirms, restore it.
- ~400KB worst case (64px input) — well under localStorage quota.

No server persistence. No accounts. Reload-safe.

## Export

Two artifacts delivered via JS-triggered downloads:

1. **Overlay PNG**: a single 7x3 sheet where each used cell is the
   `color` pixels gated by `alpha` (binary). Padding cells fully transparent.
   Dimensions scale with input (112x48 for 16px, 224x96 for 32px, 448x192 for
   64px).
2. **`.properties` file**: minimal valid Continuity overlay config:

   ```
   method=overlay
   tiles=0-16
   matchBlocks=<from UI input>
   connectBlocks=<from UI input>
   layer=cutout_mipped
   ```

   Filename follows the resourcepack convention (`<startIndex>_<block>.properties`).
   UI form collects `matchBlocks` and `connectBlocks` strings.

## Routing

Single route at `/`. `src/routes/index.tsx` is the editor page; no other
routes for v1. Existing `__root.tsx` stays as the shell.

## File structure (per docs/FILE_STRUCTURE.md)

```
clients/ctm-canvas/src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx                      # Editor page
│   ├── -components/
│   │   ├── editor-uploader.tsx        # Image + template picker
│   │   ├── editor-toolbar.tsx         # Paint/Erase/Picker/Pan + palette
│   │   ├── editor-palette.tsx         # Palette swatches
│   │   ├── editor-pixel-canvas.tsx    # Left 7x3 editor canvas + guide overlay
│   │   ├── editor-preview-panel.tsx   # Right 17 mini 3x3 block-fields
│   │   └── editor-export-bar.tsx      # Export PNG + .properties form
│   ├── -hooks/
│   │   ├── use-editor-store.ts         # typed accessor around TanStack Store
│   │   ├── use-pixel-pointer.ts        # canvas mouse -> cell/pixel coords
│   │   └── use-autosave.ts             # debounced localStorage persistence
│   ├── -lib/
│   │   ├── image.ts                    # decode / encode / split PNG / palette extraction
│   │   ├── overlay.ts                  # neighbor pattern -> tile index via ctm-overlay descriptors
│   │   ├── templates/
│   │   │   ├── soft-stone.png          # bundled default alpha template
│   │   │   └── index.ts                # template registry (future adds go here)
│   │   └── store.ts                    # TanStack Store definition
│   └── -tests/
│       ├── overlay.test.ts             # neighbor -> tile lookup
│       └── export.test.ts             # round-trip PNG/properties
└── ... (existing files: router.tsx, routeTree.gen.ts, styles.css)
```

## Out of scope for v1

- Other CTM methods (`ctm` full 47-tile, `ctm_compact`, `random`, `repeat`,
  `vertical`, `overlay_ctm`, `overlay_random`).
- Server persistence / accounts.
- Multiple document tabs.
- Undo/redo history stack (single-step state per edit).
- Tinting, biomes, faces, connectTiles (the `.properties` form only exposes
  method, tiles, matchBlocks, connectBlocks, layer for v1).

## Open considerations (deferred)

- Brush sizes > 1px (bucket fill / Npx brush).
- Per-tile color quantisation vs free palette restriction relaxation.
- Resume from a previously exported PNG (re-parse into sheets).
- Side-by-side base-only vs overlaid preview toggle.

## Implementation notes (v1 shipped)

Implemented in `clients/ctm-canvas` with TanStack Start 1.x, TanStack Store,
Tailwind v4, and Vitest (`pnpm --filter ctm-canvas dev|build|test|typecheck`).
Deviations from the sections above:

- **Corner semantics** — corners in the descriptor table are literal
  diagonal-neighbour flags, not derived from adjacent sides. Tiles 0/2/14/16
  cover diagonal-only patterns; side strips carry their own corner pixels
  (tile 11 lists top + left and no corner). `tileIndexForNeighbors`
  mirrors this convention and returns null for isolated blocks and for the
  straight-line pairs left+right / top+bottom.
- **Sheet arrays** — `alpha` is `Uint8Array(17 * N * N)`; padding cells are
  never materialised because the export composes used cells only.
- **Template decoding** — a template counts as visible either through its
  alpha channel (>127) or, when fully opaque, through luminance (>127). The
  bundled `soft-stone.png` uses opaque black on transparent.
- **Tests** — pure logic only (overlay lookup, properties builder, sheet
  composition). PNG encode/decode runs in the browser via canvas APIs and is
  not covered by Node tests.

## Layer-aware editing (feedback round 1)

- The toolbar gained **Draw on** (alpha / color layer) and **View**
  (result / color / alpha) switches. The alpha view renders the binary mask
  as black/white at runtime; the color view shows base + full color ignoring
  the mask.
- Strokes are per-layer: on the alpha layer, paint shows pixels and erase
  hides them (colors untouched). On the color layer, paint writes the active
  palette colour and erase restores the base sprite pixel (visibility
  untouched). Right-click forces an erase on either layer.
- The palette is disabled while the alpha layer is selected.

```