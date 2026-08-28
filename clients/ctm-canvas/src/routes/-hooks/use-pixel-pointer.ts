import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { paintStroke, pickPixel } from '../-lib/actions'
import { beginStroke, commitStroke } from '../-lib/history'
import { GRID_COLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'

type PixelPoint = { x: number; y: number }

/** Pixel the pointer hovers, in whole-sheet pixel coordinates. */
export type PointerTarget = { x: number; y: number }

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
 * Translate canvas pointer events into whole-sheet pixel coordinates and feed
 * the active tool. Strokes are not clipped at tile boundaries: the sheet is
 * edited as one canvas. The right button always erases, even while a paint
 * drag is in progress. Hover positions are reported through `onHoverChange`
 * so the component can render the brush marker.
 */
export function usePixelPointer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
  onHoverChange: (target: PointerTarget | null) => void,
) {
  const lastPixel = useRef<PixelPoint | null>(null)
  const panning = useRef<{
    pointerX: number
    pointerY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)

  const toSheetPixel = useCallback(
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
      return { x: px, y: py }
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

      const target = toSheetPixel(event)
      if (!target) {
        return
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      if (tool === 'picker' && (event.buttons & 2) === 0) {
        const { tileSize } = editorStore.state
        if (tileSize !== null) {
          const col = Math.floor(target.x / tileSize)
          const row = Math.floor(target.y / tileSize)
          pickPixel(
            row * GRID_COLS + col,
            target.x - col * tileSize,
            target.y - row * tileSize,
          )
        }
        return
      }
      lastPixel.current = target
      beginStroke()
      paintStroke([target], (event.buttons & 2) !== 0)
    },
    [toSheetPixel, scrollRef],
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
      const target = toSheetPixel(event)
      // Brush marker follows the pointer even while not painting.
      onHoverChange(target)
      if ((event.buttons & 3) === 0) {
        lastPixel.current = null
        return
      }
      if (!target) {
        lastPixel.current = null
        return
      }
      const last = lastPixel.current
      const from = last ?? target
      const points =
        from.x === target.x && from.y === target.y
          ? [target]
          : linePoints(from, target)
      lastPixel.current = target
      paintStroke(points, (event.buttons & 2) !== 0)
    },
    [toSheetPixel, scrollRef, onHoverChange],
  )

  const onPointerUp = useCallback(() => {
    lastPixel.current = null
    panning.current = null
    commitStroke()
  }, [])

  const onPointerLeave = useCallback(() => {
    lastPixel.current = null
    onHoverChange(null)
  }, [onHoverChange])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerLeave,
  }
}
