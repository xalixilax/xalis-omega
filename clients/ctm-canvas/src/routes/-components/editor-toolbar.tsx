import { Eraser, Hand, Paintbrush, Pipette } from 'lucide-react'
import { setTool } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import type { Tool } from '../-lib/store'

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Paintbrush }> = [
  { id: 'paint', label: 'Paint', icon: Paintbrush },
  { id: 'erase', label: 'Erase', icon: Eraser },
  { id: 'picker', label: 'Picker', icon: Pipette },
  { id: 'pan', label: 'Pan', icon: Hand },
]

export function EditorToolbar() {
  const tool = useEditor((state) => state.tool)

  return (
    <div className="flex flex-wrap items-center gap-2">
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
      <span className="text-xs text-zinc-500">Right-click always erases.</span>
    </div>
  )
}
