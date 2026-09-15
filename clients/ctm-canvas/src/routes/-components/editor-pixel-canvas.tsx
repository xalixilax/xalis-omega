import { useEffect, useRef, useState } from "react"
import {
  cellOffsetPx,
  GRID_COLS,
  GRID_ROWS,
  USED_CELLS,
} from "@/routes/-lib/sheet"
import { tiles } from "@/routes/-lib/tiles"
import { useEditorState } from "@/routes/-hooks/use-editor-store"
import {
  usePixelPointer,
  type PointerTarget,
} from "@/routes/-hooks/use-pixel-pointer"

export function EditorPixelCanvas() {
  const state = useEditorState()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [hover, setHover] = useState<PointerTarget | null>(null)

  const ts = state.tileSize ?? 0
  const sheetWidth = GRID_COLS * ts
  const sheetHeight = GRID_ROWS * ts

  const ptr = usePixelPointer(guideRef, containerRef, setHover)

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

  // Recomposite the editor canvas whenever the sheet changes. The canvas is
  // WYSIWYG for the exported sheet: hand-painted colour wins, else the base
  // pixel where the alpha mask shows it, over a checkerboard.
  useEffect(() => {
    if (state.tileSize === null || !state.base || !state.alpha || !state.color) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = sheetWidth
    canvas.height = sheetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, sheetWidth, sheetHeight)

    const mode = state.viewMode
    const background = state.background
    const bgAlpha = Math.round((state.backgroundOpacity / 100) * 255)
    const pixels = ts * ts
    const tmp = document.createElement("canvas")
    tmp.width = ts
    tmp.height = ts
    const tmpCtx = tmp.getContext("2d")
    if (!tmpCtx) return
    const tileImage = tmpCtx.createImageData(ts, ts)

    for (let cell = 0; cell < USED_CELLS; cell++) {
      const origin = cellOffsetPx(cell, ts)
      drawChecker(ctx, origin.x, origin.y, ts)
      if (mode === "alpha") {
        // Black/white mask view: white = base pixel shown by the mask.
        for (let i = 0; i < pixels; i++) {
          const visible = state.alpha[cell * pixels + i] === 1
          const value = visible ? 255 : 0
          tileImage.data[i * 4] = value
          tileImage.data[i * 4 + 1] = value
          tileImage.data[i * 4 + 2] = value
          tileImage.data[i * 4 + 3] = 255
        }
        tmpCtx.putImageData(tileImage, 0, 0)
        ctx.drawImage(tmp, origin.x, origin.y)
        continue
      }
      tileImage.data.fill(0)
      for (let i = 0; i < pixels; i++) {
        const target = i * 4
        if (mode === "result" && background !== null) {
          // Layer 0: the background under the composite, at its opacity.
          tileImage.data[target] = background[target]
          tileImage.data[target + 1] = background[target + 1]
          tileImage.data[target + 2] = background[target + 2]
          tileImage.data[target + 3] = bgAlpha
        }
        const source = (cell * pixels + i) * 4
        if (state.color[source + 3] === 255) {
          // Layer 3: hand-painted colour, independent of the alpha mask.
          tileImage.data[target] = state.color[source]
          tileImage.data[target + 1] = state.color[source + 1]
          tileImage.data[target + 2] = state.color[source + 2]
          tileImage.data[target + 3] = 255
        } else if (state.alpha[cell * pixels + i] === 1) {
          // Layer 1: the base pixel blends onto the background; a fully
          // transparent base pixel lets the background show through.
          const alphaBase = state.base[source + 3] / 255
          if (alphaBase > 0) {
            const alphaBg = background === null ? 0 : bgAlpha / 255
            const alphaOut = alphaBase + alphaBg * (1 - alphaBase)
            for (let c = 0; c < 3; c++) {
              const baseChannel = state.base[source + c]
              const bgChannel =
                background === null ? 0 : background[target + c]
              tileImage.data[target + c] = Math.round(
                (baseChannel * alphaBase +
                  bgChannel * alphaBg * (1 - alphaBase)) /
                  alphaOut,
              )
            }
            tileImage.data[target + 3] = Math.round(alphaOut * 255)
          }
        }
      }
      tmpCtx.putImageData(tileImage, 0, 0)
      ctx.drawImage(tmp, origin.x, origin.y)
    }
  }, [
    state.tileSize,
    state.base,
    state.alpha,
    state.color,
    state.revision,
    state.viewMode,
    state.background,
    state.backgroundOpacity,
    ts,
    sheetWidth,
    sheetHeight,
  ])

  // Connection guides per cell, drawn on a separate canvas so they never
  // reach the export.
  useEffect(() => {
    const canvas = guideRef.current
    if (!canvas || state.tileSize === null) return
    canvas.width = sheetWidth
    canvas.height = sheetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, sheetWidth, sheetHeight)
    if (!state.guidesVisible) return

    ctx.strokeStyle = "rgba(23,58,64,0.45)"
    ctx.fillStyle = "rgba(50,143,151,0.55)"
    ctx.lineWidth = 1
    const inset = Math.max(1, Math.floor(ts / 8))
    for (let cell = 0; cell < USED_CELLS; cell++) {
      const origin = cellOffsetPx(cell, ts)
      const tile = tiles[cell]
      const x0 = origin.x
      const y0 = origin.y
      const x1 = x0 + ts
      const y1 = y0 + ts
      for (const side of tile.sides) {
        ctx.beginPath()
        if (side === "top") {
          ctx.moveTo(x0 + inset, y0 + inset)
          ctx.lineTo(x1 - inset, y0 + inset)
        } else if (side === "bottom") {
          ctx.moveTo(x0 + inset, y1 - inset)
          ctx.lineTo(x1 - inset, y1 - inset)
        } else if (side === "left") {
          ctx.moveTo(x0 + inset, y0 + inset)
          ctx.lineTo(x0 + inset, y1 - inset)
        } else {
          ctx.moveTo(x1 - inset, y0 + inset)
          ctx.lineTo(x1 - inset, y1 - inset)
        }
        ctx.stroke()
      }
      const size = Math.max(2, Math.floor(ts / 6))
      for (const corner of tile.corners) {
        let cx = x0 + inset
        let cy = y0 + inset
        if (corner.endsWith("right")) {
          cx = x1 - inset - size
        }
        if (corner.startsWith("bottom")) {
          cy = y1 - inset - size
        }
        ctx.fillRect(cx, cy, size, size)
      }
    }
  }, [state.tileSize, state.revision, state.guidesVisible, ts, sheetWidth, sheetHeight])

  // Displayed width scales to container while keeping the sheet aspect ratio.
  const displayW = containerW > 0 ? containerW : sheetWidth * 4
  const displayH = displayW * (sheetHeight / sheetWidth)

  let brushRect: { x: number; y: number; size: number } | null = null
  if (
    hover !== null &&
    state.tileSize !== null &&
    (state.tool === "paint" || state.tool === "erase")
  ) {
    const size = Math.max(1, state.brushSize)
    const half = Math.floor((size - 1) / 2)
    brushRect = { x: hover.x - half, y: hover.y - half, size }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border bg-muted"
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
          onPointerLeave={ptr.onPointerLeave}
          onPointerCancel={ptr.onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: displayW,
            height: displayH,
            imageRendering: "pixelated",
            touchAction: "none",
            cursor: state.tool === "pan" ? "grab" : "crosshair",
          }}
          className="absolute top-0 left-0"
        />
        {brushRect !== null && (
          <svg
            className="pointer-events-none absolute top-0 left-0"
            width={displayW}
            height={displayH}
            viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {state.tool === "paint" ? (
              <rect
                x={brushRect.x}
                y={brushRect.y}
                width={brushRect.size}
                height={brushRect.size}
                fill={state.activeColor}
                shapeRendering="crispEdges"
              />
            ) : (
              <>
                <rect
                  x={brushRect.x}
                  y={brushRect.y}
                  width={brushRect.size}
                  height={brushRect.size}
                  fill="none"
                  stroke="rgba(0,0,0,0.85)"
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x={brushRect.x}
                  y={brushRect.y}
                  width={brushRect.size}
                  height={brushRect.size}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
        )}
      </div>
      {state.tileSize === null && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
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
