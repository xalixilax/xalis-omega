import { useEffect, useRef, useState } from 'react'
import { applyTemplateAlpha } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import { editorStore } from '../-lib/store'
import {
  templateViewSize,
  TEMPLATE_VIEW_BASE_TILE,
  templateViewComposition,
} from '../-lib/template-view'
import { alphaTemplates } from '../-lib/templates'

/**
 * Right panel: a block field that shows the final result. The field size
 * comes from the coordinates in templateViewComposition. Every block is
 * the result composite over the background layer: hand-painted colours, else
 * the base sprite where the alpha mask shows it, else the background (or
 * transparency when no background is set). The view repaints on every
 * revision.
 */
export function EditorPreviewPanel() {
  const tileSize = useEditor((state) => state.tileSize)
  const revision = useEditor((state) => state.revision)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null || tileSize === null) {
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

    const [cols, rows] = templateViewSize
    const width = cols * tileSize
    const height = rows * tileSize
    const pixels = tileSize * tileSize
    const image = new ImageData(width, height)

    // Layer 0: the background texture covers the whole field.
    if (background !== null) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const source = ((y % tileSize) * tileSize + (x % tileSize)) * 4
          const target = (y * width + x) * 4
          image.data[target] = background[source]
          image.data[target + 1] = background[source + 1]
          image.data[target + 2] = background[source + 2]
          image.data[target + 3] = 255
        }
      }
    }

    for (const cell of templateViewComposition) {
      const [col, row] = cell.coords
      for (const tile of cell.tiles) {
        // The base tile (17) shows the plain sprite, without overlay pixels.
        const isBaseTile = tile === TEMPLATE_VIEW_BASE_TILE
        const cellBase = isBaseTile ? 0 : tile * pixels
        for (let y = 0; y < tileSize; y++) {
          for (let x = 0; x < tileSize; x++) {
            const pixel = cellBase + y * tileSize + x
            const source = pixel * 4
            const target =
              ((row * tileSize + y) * width + col * tileSize + x) * 4
            if (!isBaseTile && color[source + 3] === 255) {
              // Hand-painted colour: independent of the alpha mask.
              image.data[target] = color[source]
              image.data[target + 1] = color[source + 1]
              image.data[target + 2] = color[source + 2]
              image.data[target + 3] = 255
            } else if (isBaseTile || alpha[pixel] === 1) {
              // Source-over: the base pixel blends onto the background; a
              // fully transparent base pixel keeps what is underneath. The
              // base is per cell, so it reads at the same index as the
              // colour; the base tile shows cell 0's plain pixels.
              const baseSource = (cellBase + y * tileSize + x) * 4
              const alphaBase = base[baseSource + 3] / 255
              if (alphaBase > 0) {
                const alphaBg = image.data[target + 3] / 255
                const alphaOut = alphaBase + alphaBg * (1 - alphaBase)
                for (let c = 0; c < 3; c++) {
                  const blended =
                    (base[baseSource + c] * alphaBase +
                      image.data[target + c] * alphaBg * (1 - alphaBase)) /
                    alphaOut
                  image.data[target + c] = Math.round(blended)
                }
                image.data[target + 3] = Math.round(alphaOut * 255)
              }
            }
          }
        }
      }
    }
    context.putImageData(image, 0, 0)
  }, [tileSize, revision])

  if (tileSize === null) {
    return null
  }

  const [cols, rows] = templateViewSize
  const width = cols * tileSize
  const height = rows * tileSize

  async function loadTemplate(url: string): Promise<void> {
    setError(null)
    try {
      await applyTemplateAlpha(url)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not load template.',
      )
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) {
      return
    }
    void loadTemplate(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-400">Result preview</h2>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        title={`${cols}x${rows} composition of the sheet tiles over the background`}
        className="pixelated block h-auto w-full rounded-sm border border-zinc-800"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value=""
          onChange={(event) => {
            const template = alphaTemplates.find(
              (entry) => entry.id === event.target.value,
            )
            if (template !== undefined) {
              void loadTemplate(template.url)
            }
          }}
          className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300"
        >
          <option value="">Apply alpha template...</option>
          {alphaTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        <label className="cursor-pointer rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500">
          Load PNG...
          <input
            type="file"
            accept="image/png"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </div>
      {error !== null && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        {cols}x{rows} blocks over the background. Tiles merge per block; 17 =
        base tile.
      </p>
    </div>
  )
}
