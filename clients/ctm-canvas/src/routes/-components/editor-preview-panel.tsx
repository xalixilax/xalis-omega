import { useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GRID_COLS, GRID_ROWS, USED_CELLS } from "@/routes/-lib/sheet"
import { tiles } from "@/routes/-lib/tiles"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

const MINI_BLOCK_PX = 16 // base block size in each mini 3x3
const MINI_PX = MINI_BLOCK_PX * 3

/** 3x3 solid grid for a tile descriptor: sides on cardinals, corners on diagonals. */
function patternForTile(cell: number): boolean[][] {
  const solid = [
    [false, false, false],
    [false, true, false],
    [false, false, false],
  ]
  for (const side of tiles[cell].sides) {
    if (side === "top") solid[0][1] = true
    if (side === "bottom") solid[2][1] = true
    if (side === "left") solid[1][0] = true
    if (side === "right") solid[1][2] = true
  }
  for (const corner of tiles[cell].corners) {
    if (corner === "top-left") solid[0][0] = true
    if (corner === "top-right") solid[0][2] = true
    if (corner === "bottom-left") solid[2][0] = true
    if (corner === "bottom-right") solid[2][2] = true
  }
  return solid
}

export function EditorPreviewPanel() {
  const state = useEditorState()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (state.tileSize === null || !state.alpha || !state.color || !state.base) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const width = GRID_COLS * MINI_PX
    const height = GRID_ROWS * MINI_PX
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = false

    const tileSize = state.tileSize
    const pixels = tileSize * tileSize
    const tileImage = ctx.createImageData(tileSize, tileSize)

    for (let cell = 0; cell < USED_CELLS; cell++) {
      const cellCol = cell % GRID_COLS
      const cellRow = Math.floor(cell / GRID_COLS)
      const originX = cellCol * MINI_PX
      const originY = cellRow * MINI_PX
      const solid = patternForTile(cell)

      // Composite of the cell: painted colour wins, else the base pixel where
      // the alpha mask shows it.
      tileImage.data.fill(0)
      for (let i = 0; i < pixels; i++) {
        const target = i * 4
        const source = (cell * pixels + i) * 4
        if (state.color[source + 3] === 255) {
          tileImage.data[target] = state.color[source]
          tileImage.data[target + 1] = state.color[source + 1]
          tileImage.data[target + 2] = state.color[source + 2]
          tileImage.data[target + 3] = 255
        } else if (state.alpha[cell * pixels + i] === 1) {
          tileImage.data[target] = state.base[source]
          tileImage.data[target + 1] = state.base[source + 1]
          tileImage.data[target + 2] = state.base[source + 2]
          tileImage.data[target + 3] = state.base[source + 3]
        }
      }
      const overlay = document.createElement("canvas")
      overlay.width = tileSize
      overlay.height = tileSize
      const overlayCtx = overlay.getContext("2d")
      if (!overlayCtx) continue
      overlayCtx.putImageData(tileImage, 0, 0)

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const bx = originX + col * MINI_BLOCK_PX
          const by = originY + row * MINI_BLOCK_PX
          const isCenter = row === 1 && col === 1
          if (!isCenter && !solid[row][col]) {
            drawChecker(ctx, bx, by, MINI_BLOCK_PX)
            continue
          }
          drawBase(ctx, bx, by, tileSize, state.base)
          if (isCenter) {
            ctx.drawImage(overlay, bx, by, MINI_BLOCK_PX, MINI_BLOCK_PX)
          }
        }
      }
      // tile index label
      ctx.fillStyle = "rgba(23,58,64,0.8)"
      ctx.font = "10px Manrope, sans-serif"
      ctx.textBaseline = "top"
      ctx.fillText(`#${cell}`, originX + 2, originY + 2)
    }
  }, [
    state.tileSize,
    state.base,
    state.alpha,
    state.color,
    state.revision,
  ])

  const displayH = 360 // fixed preview height
  const displayW = displayH * (GRID_COLS / GRID_ROWS)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview (17 mini 3x3 fields)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
        {state.tileSize === null && (
          <p className="text-sm text-muted-foreground">
            Upload a texture to render the 17 connection states.
          </p>
        )}
      </CardContent>
    </Card>
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
  tmpCtx.putImageData(
    new ImageData(new Uint8ClampedArray(base.subarray(0, tile * tile * 4)), tile, tile),
    0,
    0,
  )
  ctx.drawImage(tmp, x, y, MINI_BLOCK_PX, MINI_BLOCK_PX)
}
