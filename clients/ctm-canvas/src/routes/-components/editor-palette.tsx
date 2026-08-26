import { Plus } from 'lucide-react'
import { addPaletteColor, setActiveColor } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'

/** Palette swatches extracted from the base sprite, plus a custom colour input. */
export function EditorPalette() {
  const palette = useEditor((state) => state.palette)
  const activeColor = useEditor((state) => state.activeColor)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {palette.map((hex) => (
        <button
          key={hex}
          type="button"
          title={hex}
          aria-label={`Use colour ${hex}`}
          onClick={() => setActiveColor(hex)}
          style={{ backgroundColor: hex }}
          className={`h-7 w-7 rounded-sm border ${
            activeColor === hex
              ? 'border-white ring-2 ring-white/40'
              : 'border-black/40'
          }`}
        />
      ))}
      <label
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-dashed border-zinc-600 text-zinc-400 hover:border-zinc-400"
        title="Add custom colour"
      >
        <Plus size={14} />
        <input
          type="color"
          value={activeColor}
          onChange={(event) => addPaletteColor(event.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  )
}
