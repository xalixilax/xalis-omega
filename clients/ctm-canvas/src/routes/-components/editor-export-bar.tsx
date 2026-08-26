import { Download, FileText } from 'lucide-react'
import { setExportConfig } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import {
  buildProperties,
  composeOverlaySheet,
  downloadBlob,
  downloadText,
  propertiesFileName,
  sheetToImageData,
} from '../-lib/export'
import { encodePng } from '../-lib/image'
import type { LayerOption } from '../-lib/store'

const LAYERS: LayerOption[] = ['cutout_mipped', 'cutout', 'translucent']

/** Export bar: PNG sheet + `.properties` form. */
export function EditorExportBar() {
  const tileSize = useEditor((state) => state.tileSize)
  const alpha = useEditor((state) => state.alpha)
  const color = useEditor((state) => state.color)
  const baseName = useEditor((state) => state.baseName)
  const matchBlocks = useEditor((state) => state.matchBlocks)
  const connectBlocks = useEditor((state) => state.connectBlocks)
  const startIndex = useEditor((state) => state.startIndex)
  const layer = useEditor((state) => state.layer)

  async function handleDownloadPng() {
    if (tileSize === null || alpha === null || color === null) {
      return
    }
    const sheet = composeOverlaySheet(tileSize, color, alpha)
    const blob = await encodePng(sheetToImageData(sheet))
    downloadBlob(`${baseName}.png`, blob)
  }

  function handleDownloadProperties() {
    downloadText(
      propertiesFileName(startIndex, matchBlocks),
      buildProperties({ matchBlocks, connectBlocks, layer }),
    )
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        matchBlocks
        <input
          value={matchBlocks}
          onChange={(event) =>
            setExportConfig({ matchBlocks: event.target.value })
          }
          placeholder="minecraft:stone"
          className="w-44 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        connectBlocks
        <input
          value={connectBlocks}
          onChange={(event) =>
            setExportConfig({ connectBlocks: event.target.value })
          }
          placeholder="optional"
          className="w-44 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        startIndex
        <input
          type="number"
          min={0}
          value={Number.isNaN(startIndex) ? 0 : startIndex}
          onChange={(event) =>
            setExportConfig({ startIndex: Number(event.target.value) })
          }
          className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        layer
        <select
          value={layer}
          onChange={(event) =>
            setExportConfig({ layer: event.target.value as LayerOption })
          }
          className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        >
          {LAYERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={tileSize === null}
          className="flex items-center gap-1.5 rounded bg-sky-600 px-3 py-1.5 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          <Download size={14} />
          PNG
        </button>
        <button
          type="button"
          onClick={handleDownloadProperties}
          className="flex items-center gap-1.5 rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium hover:bg-zinc-600"
        >
          <FileText size={14} />
          .properties
        </button>
      </div>
    </div>
  )
}
