import { useEffect, useRef } from 'react'
import { useEditor } from '../-hooks/use-editor-store'
import { usePixelPointer } from '../-hooks/use-pixel-pointer'
import { cellOffsetPx, GRID_COLS, GRID_ROWS, USED_CELLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'
import { tiles } from '../-lib/tiles'

/**
 * Left editor canvas: the full 7x3 sheet at native resolution, scaled up with
 * nearest-neighbour rendering. Base texture sits underneath, color pixels are
 * shown where the binary alpha mask is 1. Guide markers live on a separate
 * canvas so they never reach the export.
 */
export function EditorPixelCanvas() {
  const tileSize = useEditor((state) => state.tileSize)
  const revision = useEditor((state) => state.revision)
  const activeCell = useEditor((state) => state.activeCell)
  const tool = useEditor((state) => state.tool)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const handlers = usePixelPointer(canvasRef, scrollRef)
  const viewMode = useEditor((state) => state.viewMode)

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
        // Base texture sits underneath in both other views.
        tileImage.data[target] = base[target]
        tileImage.data[target + 1] = base[target + 1]
        tileImage.data[target + 2] = base[target + 2]
        tileImage.data[target + 3] = 255
        if (mode === 'color' || alpha[cellBase + i] === 1) {
          const source = (cellBase + i) * 4
          tileImage.data[target] = color[source]
          tileImage.data[target + 1] = color[source + 1]
          tileImage.data[target + 2] = color[source + 2]
          tileImage.data[target + 3] = 255
        }
      }
      context.putImageData(tileImage, origin.x, origin.y)
    }
    void revision
  }, [tileSize, revision, viewMode])

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

    // Cell boundaries.
    context.strokeStyle = 'rgba(255, 255, 255, 0.14)'
    context.lineWidth = 1
    for (let col = 1; col < GRID_COLS; col++) {
      context.beginPath()
      context.moveTo(col * tileSize + 0.5, 0)
      context.lineTo(col * tileSize + 0.5, canvas.height)
      context.stroke()
    }
    for (let row = 1; row < GRID_ROWS; row++) {
      context.beginPath()
      context.moveTo(0, row * tileSize + 0.5)
      context.lineTo(canvas.width, row * tileSize + 0.5)
      context.stroke()
    }

    // Connection guides: accent edge lines for connected sides, dots for
    // connected corners.
    const edge = Math.max(1, Math.round(tileSize / 16)) * 2
    context.strokeStyle = 'rgba(56, 189, 248, 0.55)'
    context.fillStyle = 'rgba(56, 189, 248, 0.7)'
    for (let cell = 0; cell < USED_CELLS; cell++) {
      const origin = cellOffsetPx(cell, tileSize)
      const tile = tiles[cell]
      for (const side of tile.sides) {
        context.beginPath()
        if (side === 'top') {
          context.rect(origin.x, origin.y, tileSize, edge)
        } else if (side === 'bottom') {
          context.rect(origin.x, origin.y + tileSize - edge, tileSize, edge)
        } else if (side === 'left') {
          context.rect(origin.x, origin.y, edge, tileSize)
        } else {
          context.rect(origin.x + tileSize - edge, origin.y, edge, tileSize)
        }
        context.fill()
      }
      const dot = Math.max(2, tileSize / 8)
      for (const corner of tile.corners) {
        let cx = origin.x
        let cy = origin.y
        if (corner.endsWith('right')) {
          cx = origin.x + tileSize - dot
        }
        if (corner.startsWith('bottom')) {
          cy = origin.y + tileSize - dot
        }
        context.beginPath()
        context.arc(cx + dot / 2, cy + dot / 2, dot / 2, 0, Math.PI * 2)
        context.fill()
      }
    }

    // Active cell highlight.
    const origin = cellOffsetPx(activeCell, tileSize)
    context.strokeStyle = '#f59e0b'
    context.lineWidth = Math.max(1, tileSize / 16)
    context.strokeRect(origin.x + 0.5, origin.y + 0.5, tileSize - 1, tileSize - 1)
  }, [tileSize, activeCell, revision])

  if (tileSize === null) {
    return null
  }

  const width = GRID_COLS * tileSize
  const height = GRID_ROWS * tileSize

  return (
    <div
      ref={scrollRef}
      className="checkerboard overflow-auto rounded-md border border-zinc-800 p-2"
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
      </div>
    </div>
  )
}
