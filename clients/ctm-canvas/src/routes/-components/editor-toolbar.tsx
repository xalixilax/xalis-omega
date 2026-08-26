import { Eraser, Hand, Paintbrush, Pipette } from 'lucide-react'
import { setActiveLayer, setTool, setViewMode } from '../-lib/actions'
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
      <p className="text-xs text-zinc-500">
        {activeLayer === 'alpha'
          ? 'Alpha layer: paint shows pixels, erase hides them. Colors are untouched.'
          : 'Color layer: paint applies the active colour, erase restores the sprite pixel. Visibility is untouched.'}{' '}
        Right-click always erases.
      </p>
    </div>
  )
}
