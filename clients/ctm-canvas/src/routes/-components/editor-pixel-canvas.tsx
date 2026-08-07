import { useEffect, useRef, useState } from "react"
import {
  SHEET_COLS,
  TILE_COUNT,
  overlayTiles,
  allTilePatterns,
  type TileDescriptor,
} from "#/routes/-lib/overlay"
import { useEditorState } from "#/routes/-hooks/use-editor-store"
import { usePixelPointer } from "#/routes/-hooks/use-pixel-pointer"
import { paintAtPixel } from "#/routes/-lib/store"

export function EditorPixelCanvas() {
  const state = useEditorState()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const ts = state.tileSize
  const sheetWidth = SHEET_COLS * ts
  const sheetHeight = 3 * ts

  // Resize observe to set the displayed size with fixed pixel height.
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width)
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Reattach guide canvas when sheet changes.
  useEffect(() => {
    drawGuides()
  }, [ts])

  // Recomposite the editor canvas whenever color/alpha changes.
  // The canvas is WYSIWYG for the exported sheet: checkerboard wherever the
  // alpha mask is 0, the color pixel wherever it is 1.
  useEffect(() => {
    if (!state.ready || !state.alpha || !state.color) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = sheetWidth
    canvas.height = sheetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, sheetWidth, sheetHeight)

    for (let cell = 0; cell < SHEET_COLS * 3; cell++) {
      const cellCol = cell % SHEET_COLS
      const cellRow = Math.floor(cell / SHEET_COLS)
      const dstX = cellCol * ts
      const dstY = cellRow * ts

      drawChecker(ctx, dstX, dstY, ts)

      // Overlay: color × alpha, blended per pixel.
      const overlayData = new Uint8ClampedArray(ts * ts * 4)
      const cellStart = cell * ts * ts
      for (let p = 0; p < ts * ts; p++) {
        const a = state.alpha[cellStart + p]
        if (a !== 1) continue
        const colorIdx = (cellStart + p) * 4
        overlayData[p * 4] = state.color[colorIdx]
        overlayData[p * 4 + 1] = state.color[colorIdx + 1]
        overlayData[p * 4 + 2] = state.color[colorIdx + 2]
        overlayData[p * 4 + 3] = 255
      }
      const tmp = document.createElement("canvas")
      tmp.width = ts
      tmp.height = ts
      const tmpCtx = tmp.getContext("2d")
      if (!tmpCtx) continue
      tmpCtx.putImageData(new ImageData(overlayData, ts, ts), 0, 0)
      ctx.drawImage(tmp, dstX, dstY)
    }
  }, [state.ready, state.alpha, state.color, ts, sheetWidth, sheetHeight])

  function drawGuides() {
    const canvas = guideRef.current
    if (!canvas) return
    canvas.width = sheetWidth
    canvas.height = sheetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, sheetWidth, sheetHeight)

    // Faint connection-edge guides per cell: short marker on connected sides/corners
    ctx.strokeStyle = "rgba(23,58,64,0.45)"
    ctx.lineWidth = 1
    for (let cell = 0; cell < TILE_COUNT; cell++) {
      const desc = overlayTiles[cell] as TileDescriptor
      const cellCol = cell % SHEET_COLS
      const cellRow = Math.floor(cell / SHEET_COLS)
      const x0 = cellCol * ts
      const y0 = cellRow * ts
      const x1 = x0 + ts
      const y1 = y0 + ts
      const inset = Math.max(1, Math.floor(ts / 8))
      // Sides
      for (const side of desc.sides) {
        ctx.beginPath()
        if (side === "top") {
          ctx.moveTo(x0 + inset, y0 + inset)
          ctx.lineTo(x1 - inset, y0 + inset)
        }
        if (side === "bottom") {
          ctx.moveTo(x0 + inset, y1 - inset)
          ctx.lineTo(x1 - inset, y1 - inset)
        }
        if (side === "left") {
          ctx.moveTo(x0 + inset, y0 + inset)
          ctx.lineTo(x0 + inset, y1 - inset)
        }
        if (side === "right") {
          ctx.moveTo(x1 - inset, y0 + inset)
          ctx.lineTo(x1 - inset, y1 - inset)
        }
        ctx.stroke()
      }
      // Corners: a small filled square
      for (const corner of desc.corners) {
        const size = Math.max(2, Math.floor(ts / 6))
        let cx = x0
        let cy = y0
        if (corner === "top-left") {
          cx = x0 + inset
          cy = y0 + inset
        }
        if (corner === "top-right") {
          cx = x1 - inset - size
          cy = y0 + inset
        }
        if (corner === "bottom-left") {
          cx = x0 + inset
          cy = y1 - inset - size
        }
        if (corner === "bottom-right") {
          cx = x1 - inset - size
          cy = y1 - inset - size
        }
        ctx.fillStyle = "rgba(50,143,151,0.55)"
        ctx.fillRect(cx, cy, size, size)
      }
    }

    // Separator grid between cells
    ctx.strokeStyle = "rgba(23,58,64,0.18)"
    ctx.lineWidth = 1
    for (let c = 1; c < SHEET_COLS; c++) {
      ctx.beginPath()
      ctx.moveTo(c * ts + 0.5, 0)
      ctx.lineTo(c * ts + 0.5, sheetHeight)
      ctx.stroke()
    }
    for (let r = 1; r < 3; r++) {
      ctx.beginPath()
      ctx.moveTo(0, r * ts + 0.5)
      ctx.lineTo(sheetWidth, r * ts + 0.5)
      ctx.stroke()
    }
    void allTilePatterns
  }

  const onPaint = (cell: number, px: number, py: number, isRight: boolean) => {
    paintAtPixel(cell, px, py, state.tileSize, isRight)
  }
  const ptr = usePixelPointer({
    tileSize: state.tileSize,
    onPaint,
  })

  // Displayed width scales to container while keeping aspect ratio *7:3.
  const displayW = containerW > 0 ? containerW : sheetWidth * 4
  const displayH = displayW * (sheetHeight / sheetWidth)

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--foam)]"
    >
      <div className="aspect-[7/3] w-full">
        <canvas
          ref={canvasRef}
          style={{
            width: displayW,
            height: displayH,
            imageRendering: "pixelated",
          }}
          className="absolute top-0 left-0"
        />
        <canvas
          ref={guideRef}
          onPointerDown={ptr.onPointerDown}
          onPointerMove={ptr.onPointerMove}
          onPointerUp={ptr.onPointerUp}
          onPointerLeave={ptr.onPointerUp}
          onContextMenu={ptr.onContextMenu}
          style={{
            width: displayW,
            height: displayH,
            imageRendering: "pixelated",
          }}
          className="absolute top-0 left-0 cursor-crosshair"
        />
      </div>
      {!state.ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--sea-ink-soft)]">
          Upload a 16/32/64px square texture to begin.
        </div>
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
  const half = Math.floor(size / 2)
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = "rgba(23,58,64,0.08)"
  ctx.fillRect(x + half, y, half, half)
  ctx.fillRect(x, y + half, half, half)
}