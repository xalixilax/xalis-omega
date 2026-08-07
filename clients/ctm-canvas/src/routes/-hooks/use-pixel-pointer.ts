import { useCallback, useRef } from "react"
import { SHEET_COLS, TILE_COUNT } from "#/routes/-lib/overlay"

export type PixelPointer = {
  cell: number
  px: number
  py: number
}

type UsePixelPointerOpts = {
  tileSize: number
  onPaint: (cell: number, px: number, py: number, isRight: boolean) => void
}

/**
 * Translate pointer events on a CSS-scaled HTML5 canvas (backed by a native
 * sheetWidth x sheetHeight drawing buffer) into tile-cell + pixel coordinates.
 */
export function usePixelPointer(opts: UsePixelPointerOpts) {
  const { tileSize, onPaint } = opts
  const paintingRef = useRef(false)
  const buttonRef = useRef(0)

  const getCoords = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): PixelPointer | null => {
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return null
      const scaleX = (SHEET_COLS * tileSize) / rect.width
      const scaleY = (3 * tileSize) / rect.height
      const cssX = e.clientX - rect.left
      const cssY = e.clientY - rect.top
      const x = Math.floor(cssX * scaleX)
      const y = Math.floor(cssY * scaleY)
      const cellCol = Math.min(SHEET_COLS - 1, Math.max(0, Math.floor(x / tileSize)))
      const cellRow = Math.min(2, Math.max(0, Math.floor(y / tileSize)))
      const cell = cellRow * SHEET_COLS + cellCol
      const px = x - cellCol * tileSize
      const py = y - cellRow * tileSize
      return { cell, px, py }
    },
    [tileSize],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      const pos = getCoords(e)
      if (!pos) return
      if (pos.cell >= TILE_COUNT) return
      paintingRef.current = true
      buttonRef.current = e.button
      onPaint(pos.cell, pos.px, pos.py, e.button === 2)
    },
    [getCoords, onPaint],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!paintingRef.current) return
      const pos = getCoords(e)
      if (!pos) return
      if (pos.cell >= TILE_COUNT) return
      onPaint(pos.cell, pos.px, pos.py, buttonRef.current === 2)
    },
    [getCoords, onPaint],
  )

  const onPointerUp = useCallback(() => {
    paintingRef.current = false
    buttonRef.current = 0
  }, [])

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, onContextMenu }
}