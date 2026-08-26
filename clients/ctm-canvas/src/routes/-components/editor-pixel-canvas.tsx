import { useEffect, useRef } from 'react'
import { useEditor } from '../-hooks/use-editor-store'
import { usePixelPointer } from '../-hooks/use-pixel-pointer'
import { cellOffsetPx, GRID_COLS, GRID_ROWS, USED_CELLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'
import { tiles } from '../-lib/tiles'

/**
 * Left editor canvas: the full 7x3 sheet at native resolution, scaled up with
 * nearest-neighbour rendering. The underlay texture (custom background or the
 * sprite) sits underneath; overlay pixels show where the binary mask is 1.
 * Guide markers live on a separate canvas so they never reach the export, and
 * a crisp SVG line grid marks the tile boundaries.
 */
export function EditorPixelCanvas() {
  const tileSize = useEditor((state) => state.tileSize)
  const revision = useEditor((state) => state.revision)
  const tool = useEditor((state) => state.tool)
  const viewMode = useEditor((state) => state.viewMode)
  const maskDim = useEditor((state) => state.maskDim)
  const overlayVisible = useEditor((state) => state.overlayVisible)
  const guidesVisible = useEditor((state) => state.guidesVisible)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const handlers = usePixelPointer(canvasRef, scrollRef)

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
    const underlay = state.background ?? base
    const dimFactor =
      mode === 'result' && state.overlayVisible ? 1 - state.maskDim / 100 : 1
    const tileImage = context.createImageData(tileSize, tileSize)
    const pixels = tileSize * tileSize
    for (let cell = 0; cell < USED_CELLS; cell++) {
      const origin = cellOffsetPx(cell, tileSize)
      const cellBase = cell * pixels
      for (let i = 0; i < pixels; i++) {
        const target = i * 4
        if (mode === 'alpha') {
          // Black/white mask view: white = overlay pixel visible.
          const visible = alpha[cellBase + i] === 1
          tileImage.data[target] = visible ? 255 : 0
          tileImage.data[target + 1] = visible ? 255 : 0
          tileImage.data[target + 2] = visible ? 255 : 0
          tileImage.data[target + 3] = 255
          continue
        }
        let r = underlay[target]
        let g = underlay[target + 1]
        let b = underlay[target + 2]
        if (
          mode === 'result' &&
          !state.overlayVisible
        ) {
          // Overlay hidden: pure underlay for comparison.
        } else if (alpha[cellBase + i] === 1) {
          const source = (cellBase + i) * 4
          r = color[source]
          g = color[source + 1]
          b = color[source + 2]
        }
        if (dimFactor < 1 && alpha[cellBase + i] !== 1) {
          // Dim everything outside the mask so the overlay region pops.
          r = Math.round(r * dimFactor)
          g = Math.round(g * dimFactor)
          b = Math.round(b * dimFactor)
        }
        tileImage.data[target] = r
        tileImage.data[target + 1] = g
        tileImage.data[target + 2] = b
        tileImage.data[target + 3] = 255
      }
      context.putImageData(tileImage, origin.x, origin.y)
    }
    void revision
  }, [tileSize, revision, viewMode, maskDim, overlayVisible])

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
      </div>
    </div>
  )
}
