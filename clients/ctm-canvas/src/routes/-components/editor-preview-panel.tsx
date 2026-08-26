import { useEffect, useRef } from 'react'
import { setActiveCell } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import { neighborsForTileIndex } from '../-lib/overlay'
import { USED_CELLS } from '../-lib/sheet'
import { editorStore } from '../-lib/store'
import type { Neighbors } from '../-lib/overlay'

const NEIGHBOR_OFFSETS: Record<keyof Neighbors, [number, number]> = {
  top: [1, 0],
  'top-right': [2, 0],
  right: [2, 1],
  'bottom-right': [2, 2],
  bottom: [1, 2],
  'bottom-left': [0, 2],
  left: [0, 1],
  'top-left': [0, 0],
}

/** Right panel: one mini 3x3 block-field per tile index, laid out as a 7x3 grid. */
export function EditorPreviewPanel() {
  const tileSize = useEditor((state) => state.tileSize)
  const revision = useEditor((state) => state.revision)
  const activeCell = useEditor((state) => state.activeCell)

  if (tileSize === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-400">
        Connection states
      </h2>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: USED_CELLS }, (_, index) => (
          <MiniField
            key={index}
            index={index}
            tileSize={tileSize}
            revision={revision}
            active={activeCell === index}
          />
        ))}
      </div>
    </div>
  )
}

type MiniFieldProps = {
  index: number
  tileSize: number
  revision: number
  active: boolean
}

function MiniField({ index, tileSize, revision, active }: MiniFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }
    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }
    const { base, alpha, color, background } = editorStore.state
    if (base === null || alpha === null || color === null) {
      return
    }
    const underlay = background ?? base

    const size = tileSize * 3
    context.clearRect(0, 0, size, size)
    context.fillStyle = '#27272a'
    context.fillRect(0, 0, size, size)

    const neighbors = neighborsForTileIndex(index)
    for (const key of Object.keys(NEIGHBOR_OFFSETS) as Array<keyof Neighbors>) {
      if (!neighbors[key]) {
        continue
      }
      const [col, row] = NEIGHBOR_OFFSETS[key]
      drawBase(context, col * tileSize, row * tileSize, underlay, tileSize)
    }
    drawCompositedCenter(
      context,
      tileSize,
      index,
      alpha,
      color,
      underlay,
    )
    void revision
  }, [tileSize, revision, index])

  return (
    <button
      type="button"
      onClick={() => setActiveCell(index)}
      title={`Tile ${index}`}
      className={`overflow-hidden rounded-sm border ${
        active ? 'border-amber-500' : 'border-zinc-800 hover:border-zinc-600'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={tileSize * 3}
        height={tileSize * 3}
        className="pixelated block h-auto w-full"
      />
    </button>
  )
}

function drawBase(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  base: Uint8ClampedArray,
  tileSize: number,
): void {
  const image = new ImageData(
    new Uint8ClampedArray(
      base.buffer as ArrayBuffer,
      base.byteOffset,
      base.byteLength,
    ),
    tileSize,
    tileSize,
  )
  context.putImageData(image, x, y)
}

function drawCompositedCenter(
  context: CanvasRenderingContext2D,
  tileSize: number,
  index: number,
  alpha: Uint8Array,
  color: Uint8Array,
  base: Uint8ClampedArray,
): void {
  const pixels = tileSize * tileSize
  const image = new ImageData(tileSize, tileSize)
  image.data.set(base.subarray(0, pixels * 4))
  const cellBase = index * pixels
  for (let i = 0; i < pixels; i++) {
    if (alpha[cellBase + i] === 1) {
      const source = (cellBase + i) * 4
      image.data[i * 4] = color[source]
      image.data[i * 4 + 1] = color[source + 1]
      image.data[i * 4 + 2] = color[source + 2]
      image.data[i * 4 + 3] = 255
    }
  }
  context.putImageData(image, tileSize, tileSize)
}
