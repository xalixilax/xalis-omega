import { useEffect, useRef } from "react"
import {
  SHEET_COLS,
  TILE_COUNT,
  allTilePatterns,
} from "#/routes/-lib/overlay"
import { useEditorState } from "#/routes/-hooks/use-editor-store"

const MINI_BLOCK_PX = 16 // base block size in each mini 3x3
const MINI_PX = MINI_BLOCK_PX * 3

export function EditorPreviewPanel() {
  const state = useEditorState()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ts = state.tileSize
  const baseTile = ts

  useEffect(() => {
    if (!state.ready || !state.alpha || !state.color || !state.base) return
    const canvas = canvasRef.current
    if (!canvas) return
    // One row of 7 mini 3x3 scenes, three rows total -> sheet 7*3 × 3*3 at MINI_BLOCK_PX
    const cols = SHEET_COLS
    const rows = 3
    const width = cols * MINI_PX
    const height = rows * MINI_PX
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = false

    for (let tile = 0; tile < TILE_COUNT; tile++) {
      const cellCol = tile % SHEET_COLS
      const cellRow = Math.floor(tile / SHEET_COLS)
      const originX = cellCol * MINI_PX
      const originY = cellRow * MINI_PX

      const pattern = allTilePatterns[tile]
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const bx = originX + col * MINI_BLOCK_PX
          const by = originY + row * MINI_BLOCK_PX
          const isCenter = row === 1 && col === 1
          const isSolidNeighbor = isCenter || pattern.solid[row][col]
          if (!isSolidNeighbor) {
            drawChecker(ctx, bx, by, MINI_BLOCK_PX)
            continue
          }
          // Base block (scaled to MINI_BLOCK_PX x MINI_BLOCK_PX)
          drawBase(ctx, bx, by, baseTile, state.base as Uint8ClampedArray)

          if (isCenter) {
            // Composite overlay tile (cell index = tile index)
            const overlayData = new Uint8ClampedArray(baseTile * baseTile * 4)
            const cellStart = tile * baseTile * baseTile
            for (let p = 0; p < baseTile * baseTile; p++) {
              const a = state.alpha[cellStart + p]
              if (a !== 1) continue
              const colorIdx = (cellStart + p) * 4
              overlayData[p * 4] = state.color![colorIdx]
              overlayData[p * 4 + 1] = state.color![colorIdx + 1]
              overlayData[p * 4 + 2] = state.color![colorIdx + 2]
              overlayData[p * 4 + 3] = 255
            }
            const tmp = document.createElement("canvas")
            tmp.width = baseTile
            tmp.height = baseTile
            const tmpCtx = tmp.getContext("2d")
            if (!tmpCtx) continue
            tmpCtx.putImageData(new ImageData(overlayData, baseTile, baseTile), 0, 0)
            ctx.drawImage(tmp, bx, by, MINI_BLOCK_PX, MINI_BLOCK_PX)
          }
        }
      }
      // tile index label
      ctx.fillStyle = "rgba(23,58,64,0.8)"
      ctx.font = "10px Manrope, sans-serif"
      ctx.textBaseline = "top"
      ctx.fillText(`#${tile}`, originX + 2, originY + 2)
    }
  }, [state.ready, state.alpha, state.color, state.base, baseTile])

  const displayH = 360 // fixed preview height
  const aspectW = (SHEET_COLS * MINI_PX) / (3 * MINI_PX)
  const displayW = displayH * aspectW

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="island-kicker">Preview (17 mini 3x3 fields)</div>
      <div className="w-full overflow-auto">
        <canvas
          ref={canvasRef}
          style={{
            width: displayW,
            height: displayH,
            imageRendering: "pixelated",
          }}
        />
      </div>
      {!state.ready && (
        <p className="text-xs text-[var(--sea-ink-soft)]">
          Upload a texture to render the 17 connection states.
        </p>
      )}
    </div>
  )
}

function drawChecker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = "rgba(23,58,64,0.06)"
  ctx.fillRect(x, y, size, size)
}

function drawBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  base: Uint8ClampedArray,
) {
  const tmp = document.createElement("canvas")
  tmp.width = tile
  tmp.height = tile
  const tmpCtx = tmp.getContext("2d")
  if (!tmpCtx) return
  tmpCtx.putImageData(new ImageData(new Uint8ClampedArray(base), tile, tile), 0, 0)
  ctx.drawImage(tmp, x, y, MINI_BLOCK_PX, MINI_BLOCK_PX)
}