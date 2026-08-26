import { useRef, useState } from 'react'
import { Eraser, Hand, Paintbrush, Pipette, X } from 'lucide-react'
import {
  setActiveLayer,
  setBackground,
  setGuidesVisible,
  setMaskDim,
  setOverlayVisible,
  setTool,
  setViewMode,
} from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import type { ActiveLayer, Tool, ViewMode } from '../-lib/store'

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Paintbrush }> = [
  { id: 'paint', label: 'Paint', icon: Paintbrush },
  { id: 'erase', label: 'Erase', icon: Eraser },
  { id: 'picker', label: 'Picker', icon: Pipette },
  { id: 'pan', label: 'Pan', icon: Hand },
]

const LAYERS: Array<{ id: ActiveLayer; label: string }> = [
  { id: 'alpha', label: 'Alpha' },
  { id: 'color', label: 'Color' },
]

const VIEW_MODES: Array<{ id: ViewMode; label: string }> = [
  { id: 'result', label: 'Result' },
  { id: 'color', label: 'Color' },
  { id: 'alpha', label: 'Alpha' },
]

export function EditorToolbar() {
  const tool = useEditor((state) => state.tool)
  const activeLayer = useEditor((state) => state.activeLayer)
  const viewMode = useEditor((state) => state.viewMode)
  const maskDim = useEditor((state) => state.maskDim)
  const overlayVisible = useEditor((state) => state.overlayVisible)
  const guidesVisible = useEditor((state) => state.guidesVisible)
  const hasBackground = useEditor((state) => state.background !== null)

  const backgroundInputRef = useRef<HTMLInputElement | null>(null)
  const [backgroundError, setBackgroundError] = useState<string | null>(null)

  async function handleBackgroundChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setBackgroundError(null)
    try {
      await setBackground(file)
    } catch (cause) {
      setBackgroundError(
        cause instanceof Error
          ? cause.message
          : 'Could not load the background texture.',
      )
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tool
        </span>
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            aria-pressed={tool === id}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm ${
              tool === id
                ? 'border-sky-500 bg-sky-950 text-sky-200'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}

        <span className="ml-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Draw on
        </span>
        <div className="flex overflow-hidden rounded border border-zinc-800">
          {LAYERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveLayer(id)}
              aria-pressed={activeLayer === id}
              className={`px-3 py-1.5 text-sm ${
                activeLayer === id
                  ? 'bg-fuchsia-950 text-fuchsia-200'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="ml-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          View
        </span>
        <div className="flex overflow-hidden rounded border border-zinc-800">
          {VIEW_MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              aria-pressed={viewMode === id}
              className={`px-3 py-1.5 text-sm ${
                viewMode === id
                  ? 'bg-emerald-950 text-emerald-200'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={overlayVisible}
            onChange={(event) => setOverlayVisible(event.target.checked)}
            className="accent-sky-500"
          />
          Overlay
        </label>

        <label
          className="flex items-center gap-2"
          title="Per-tile connection guides (dashed side/corner markers)"
        >
          <input
            type="checkbox"
            checked={guidesVisible}
            onChange={(event) => setGuidesVisible(event.target.checked)}
            className="accent-sky-500"
          />
          Guides
        </label>

        <label
          className={`flex items-center gap-2 ${
            viewMode === 'alpha' ? 'opacity-40' : ''
          }`}
          title="Darkness applied to pixels outside the alpha mask"
        >
          Dim
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={maskDim}
            disabled={viewMode === 'alpha'}
            onChange={(event) => setMaskDim(Number(event.target.value))}
            className="w-32 accent-emerald-500"
          />
          <span className="w-9 text-right text-xs tabular-nums text-zinc-400">
            {maskDim}%
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              hasBackground ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
            title={hasBackground ? 'Custom background set' : 'No background'}
          />
          <label className="cursor-pointer rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs hover:border-zinc-600">
            Background...
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/png"
              onChange={handleBackgroundChange}
              className="sr-only"
            />
          </label>
          {hasBackground && (
            <button
              type="button"
              onClick={() => {
                setBackgroundError(null)
                void setBackground(null)
              }}
              title="Remove the custom background"
              className="rounded border border-zinc-800 bg-zinc-900 p-1 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {backgroundError !== null && (
          <span className="text-xs text-red-400" role="alert">
            {backgroundError}
          </span>
        )}

        <span className="text-xs text-zinc-500">
          {activeLayer === 'alpha'
            ? 'Alpha layer: paint shows pixels, erase hides them.'
            : 'Color layer: paint colours and reveals pixels, erase restores the sprite.'}{' '}
          Right-click always erases.
        </span>
      </div>
    </div>
  )
}
