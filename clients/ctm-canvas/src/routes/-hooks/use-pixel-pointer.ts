import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { paintStroke, pickPixel } from '../-lib/actions'
import { GRID_COLS, USED_CELLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'

type PixelPoint = { x: number; y: number }

function linePoints(from: PixelPoint, to: PixelPoint): PixelPoint[] {
  const points: PixelPoint[] = []
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const sx = from.x < to.x ? 1 : -1
  const sy = from.y < to.y ? 1 : -1
  let error = dx - dy
  let x = from.x
  let y = from.y
  for (;;) {
    points.push({ x, y })
    if (x === to.x && y === to.y) {
      break
    }
    const error2 = 2 * error
    if (error2 > -dy) {
      error -= dy
      x += sx
    }
    if (error2 < dx) {
      error += dx
      y += sy
    }
  }
  return points
}

/**
 * Translate canvas pointer events into pixel coordinates of the active sheet
 * cell and feed the active tool. The right button always erases, even while a
 * paint drag is in progress.
 */
export function usePixelPointer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
) {
  const lastPixel = useRef<PixelPoint | null>(null)
  const panning = useRef<{
    pointerX: number
    pointerY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)

  const toCellAndPixel = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      const { tileSize } = editorStore.state
      if (!canvas || tileSize === null) {
        return null
      }
      const rect = canvas.getBoundingClientRect()
      const px = Math.floor(
        ((event.clientX - rect.left) * canvas.width) / rect.width,
      )
      const py = Math.floor(
        ((event.clientY - rect.top) * canvas.height) / rect.height,
      )
      if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) {
        return null
      }
      const cellCol = Math.floor(px / tileSize)
      const cellRow = Math.floor(py / tileSize)
      const cell = cellRow * GRID_COLS + cellCol
      if (cell < 0 || cell >= USED_CELLS) {
        return null
      }
      return {
        cell,
        x: px - cellCol * tileSize,
        y: py - cellRow * tileSize,
      }
    },
    [canvasRef],
  )

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const tool = editorStore.state.tool
      if (tool === 'pan') {
        const container = scrollRef.current
        if (container) {
          panning.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        return
      }

      const target = toCellAndPixel(event)
      if (!target) {
        return
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      if (tool === 'picker' && (event.buttons & 2) === 0) {
        pickPixel(target.cell, target.x, target.y)
        return
      }
      lastPixel.current = { x: target.x, y: target.y }
      paintStroke(target.cell, [lastPixel.current], (event.buttons & 2) !== 0)
    },
    [toCellAndPixel, scrollRef],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const panState = panning.current
      if (panState) {
        const container = scrollRef.current
        if (container) {
          container.scrollLeft =
            panState.scrollLeft - (event.clientX - panState.pointerX)
          container.scrollTop =
            panState.scrollTop - (event.clientY - panState.pointerY)
        }
        return
      }
      if ((event.buttons & 3) === 0) {
        lastPixel.current = null
        return
      }
      const target = toCellAndPixel(event)
      if (!target) {
        lastPixel.current = null
        return
      }
      const current = { x: target.x, y: target.y }
      const from = lastPixel.current ?? current
      const points =
        from.x === current.x && from.y === current.y
          ? [current]
          : linePoints(from, current)
      lastPixel.current = current
      paintStroke(
        target.cell,
        points,
        (event.buttons & 2) !== 0,
      )
    },
    [toCellAndPixel, scrollRef],
  )

  const onPointerUp = useCallback(() => {
    lastPixel.current = null
    panning.current = null
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }
}
