import { useEffect, useRef, useState } from 'react'
import { useEditor } from '../-hooks/use-editor-store'
import { usePixelPointer } from '../-hooks/use-pixel-pointer'
import type { PointerTarget } from '../-hooks/use-pixel-pointer'
import { setBrushSize } from '../-lib/actions'
import { cellOffsetPx, GRID_COLS, GRID_ROWS, USED_CELLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'
import { tiles } from '../-lib/tiles'

/**
 * Left editor canvas: the full 7x3 sheet at native resolution, scaled up with
 * nearest-neighbour rendering. Result view composites layer 0 (background at
 * its opacity), layer 1 (base sprite where the alpha mask is 1) and layer 3
 * (hand-painted colours, independent of the mask). The Color view shows the
 * masked base with painted colours on top, the Alpha view shows the raw mask.
 * Guide markers live on a separate canvas so they never reach the export, and
 * a crisp SVG line grid marks the tile boundaries.
 */
export function EditorPixelCanvas() {
  const tileSize = useEditor((state) => state.tileSize)
  const revision = useEditor((state) => state.revision)
  const tool = useEditor((state) => state.tool)
  const brushSize = useEditor((state) => state.brushSize)
  const activeColor = useEditor((state) => state.activeColor)
  const viewMode = useEditor((state) => state.viewMode)
  const backgroundOpacity = useEditor((state) => state.backgroundOpacity)
  const overlayVisible = useEditor((state) => state.overlayVisible)
  const guidesVisible = useEditor((state) => state.guidesVisible)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState<PointerTarget | null>(null)
  const handlers = usePixelPointer(canvasRef, scrollRef, setHover)

  // Ctrl/Cmd + wheel resizes the square brush. The native listener must be
  // non-passive: ctrl+wheel is the browser page-zoom gesture by default.
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }
      event.preventDefault()
      const direction = event.deltaY < 0 ? 1 : -1
      setBrushSize(editorStore.state.brushSize + direction)
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null || tileSize === null) {
      return
    }
    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }
    const state = editorStore.state
    const { base, alpha, color } = state
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (base === null || alpha === null || color === null) {
      return
    }

    const mode = state.viewMode
    const background = state.background
    const bgAlpha = Math.round((state.backgroundOpacity / 100) * 255)
    const tileImage = context.createImageData(tileSize, tileSize)
    const pixels = tileSize * tileSize
    for (let cell = 0; cell < USED_CELLS; cell++) {
      // Without a background, pixels that are neither painted nor masked get
      // no write below, so the reused buffer must start empty each cell.
      tileImage.data.fill(0)
      const origin = cellOffsetPx(cell, tileSize)
      const cellBase = cell * pixels
      for (let i = 0; i < pixels; i++) {
        const target = i * 4
        if (mode === 'alpha') {
          // Black/white mask view: white = base pixel shown by the mask.
          const visible = alpha[cellBase + i] === 1
          tileImage.data[target] = visible ? 255 : 0
          tileImage.data[target + 1] = visible ? 255 : 0
          tileImage.data[target + 2] = visible ? 255 : 0
          tileImage.data[target + 3] = 255
          continue
        }
        if (mode === 'result' && !state.overlayVisible) {
          // Composite hidden: pure underlay for comparison, keeping its own
          // alpha so transparent pixels do not turn black. The base is per
          // cell; the background is a single tile.
          const underlay = background === null ? base : background
          const source = background === null ? (cellBase + i) * 4 : target
          tileImage.data[target] = underlay[source]
          tileImage.data[target + 1] = underlay[source + 1]
          tileImage.data[target + 2] = underlay[source + 2]
          tileImage.data[target + 3] =
            background === null ? underlay[source + 3] : 255
          continue
        }
        // Result and Color views, bottom to top: (Result only) background at
        // its opacity, base texture with the alpha mask applied, hand-painted
        // colour on top. The mask never gates the colour itself.
        if (mode === 'result' && background !== null) {
          tileImage.data[target] = background[target]
          tileImage.data[target + 1] = background[target + 1]
          tileImage.data[target + 2] = background[target + 2]
          tileImage.data[target + 3] = bgAlpha
        }
        const source = (cellBase + i) * 4
        if (color[source + 3] === 255) {
          tileImage.data[target] = color[source]
          tileImage.data[target + 1] = color[source + 1]
          tileImage.data[target + 2] = color[source + 2]
          tileImage.data[target + 3] = 255
        } else if (alpha[cellBase + i] === 1) {
          // Source-over: the base pixel blends onto the background; a fully
          // transparent base pixel lets the background show through. The
          // base is per cell, so it reads at the same index as the colour.
          const alphaBase = base[source + 3] / 255
          if (alphaBase > 0) {
            const alphaBg = background === null ? 0 : bgAlpha / 255
            const alphaOut = alphaBase + alphaBg * (1 - alphaBase)
            for (let c = 0; c < 3; c++) {
              const baseChannel = base[source + c]
              const bgChannel =
                background === null ? 0 : background[target + c]
              const blended =
                (baseChannel * alphaBase +
                  bgChannel * alphaBg * (1 - alphaBase)) /
                alphaOut
              tileImage.data[target + c] = Math.round(blended)
            }
            tileImage.data[target + 3] = Math.round(alphaOut * 255)
          }
        }
      }
      context.putImageData(tileImage, origin.x, origin.y)
    }
    void revision
  }, [tileSize, revision, viewMode, backgroundOpacity, overlayVisible])

  useEffect(() => {
    const canvas = guideCanvasRef.current
    if (canvas === null || tileSize === null) {
      return
    }
    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (!guidesVisible) {
      return
    }

    // Connection guides: faint dashed lines along connected sides, tiny
    // squares in connected corners.
    context.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    context.fillStyle = 'rgba(56, 189, 248, 0.45)'
    context.lineWidth = 1
    context.setLineDash([2, 3])
    const inset = 1.5
    const tick = Math.max(2, Math.round(tileSize / 8))
    for (let cell = 0; cell < USED_CELLS; cell++) {
      const origin = cellOffsetPx(cell, tileSize)
      const tile = tiles[cell]
      for (const side of tile.sides) {
        context.beginPath()
        if (side === 'top') {
          context.moveTo(origin.x + inset, origin.y + inset)
          context.lineTo(origin.x + tileSize - inset, origin.y + inset)
        } else if (side === 'bottom') {
          context.moveTo(origin.x + inset, origin.y + tileSize - inset)
          context.lineTo(
            origin.x + tileSize - inset,
            origin.y + tileSize - inset,
          )
        } else if (side === 'left') {
          context.moveTo(origin.x + inset, origin.y + inset)
          context.lineTo(origin.x + inset, origin.y + tileSize - inset)
        } else {
          context.moveTo(origin.x + tileSize - inset, origin.y + inset)
          context.lineTo(
            origin.x + tileSize - inset,
            origin.y + tileSize - inset,
          )
        }
        context.stroke()
      }
      for (const corner of tile.corners) {
        let cx = origin.x + inset
        let cy = origin.y + inset
        if (corner.endsWith('right')) {
          cx = origin.x + tileSize - inset - tick
        }
        if (corner.startsWith('bottom')) {
          cy = origin.y + tileSize - inset - tick
        }
        context.fillRect(cx, cy, tick, tick)
      }
    }
    context.setLineDash([])
  }, [tileSize, guidesVisible])

  if (tileSize === null) {
    return null
  }

  const width = GRID_COLS * tileSize
  const height = GRID_ROWS * tileSize

  // Brush marker geometry in sheet-pixel coordinates, same space the strokes
  // use. A 2 px brush renders exactly 2x2 pixels and crosses tile boundaries;
  // painting fills it with the active colour, erasing shows a crisp outline.
  let brushRect: { x: number; y: number; size: number } | null = null
  if (hover !== null && (tool === 'paint' || tool === 'erase')) {
    const size = Math.max(1, brushSize)
    const half = Math.floor((size - 1) / 2)
    brushRect = {
      x: hover.x - half,
      y: hover.y - half,
      size,
    }
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-auto rounded-md border border-zinc-800 bg-zinc-900 p-2"
    >
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: `${width * 10}px` }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="pixelated block h-auto w-full"
          style={{
            cursor: tool === 'pan' ? 'grab' : 'crosshair',
            touchAction: 'none',
          }}
          onContextMenu={(event) => event.preventDefault()}
          {...handlers}
        />
        <canvas
          ref={guideCanvasRef}
          width={width}
          height={height}
          className="pixelated pointer-events-none absolute inset-0 h-full w-full"
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${GRID_COLS} ${GRID_ROWS}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {Array.from({ length: GRID_COLS - 1 }, (_, index) => (
            <line
              key={`v-${index}`}
              x1={index + 1}
              y1={0}
              x2={index + 1}
              y2={GRID_ROWS}
              stroke="#3f3f46"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {Array.from({ length: GRID_ROWS - 1 }, (_, index) => (
            <line
              key={`h-${index}`}
              x1={0}
              y1={index + 1}
              x2={GRID_COLS}
              y2={index + 1}
              stroke="#3f3f46"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {brushRect !== null && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {tool === 'paint' ? (
              <rect
                x={brushRect.x}
                y={brushRect.y}
                width={brushRect.size}
                height={brushRect.size}
                fill={activeColor}
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
    </div>
  )
}
