import { Plus } from 'lucide-react'
import { Card, CardContent } from '@design-system/components/card'
import { Kicker } from '@design-system/components/kicker'
import { cn } from '@design-system/lib/utils'
import { addPaletteColor, setActiveColor } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'

/** Palette swatches extracted from the base sprite, plus a custom colour input. */
export function EditorPalette() {
  const palette = useEditor((state) => state.palette)
  const activeColor = useEditor((state) => state.activeColor)
  const activeLayer = useEditor((state) => state.activeLayer)

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={cn(
            'flex flex-wrap items-center gap-1.5',
            activeLayer === 'alpha' ? 'pointer-events-none opacity-40' : '',
          )}
          title={
            activeLayer === 'alpha'
              ? 'Switch to the color layer to use the palette'
              : undefined
          }
        >
          <Kicker className="mr-2">Palette</Kicker>
          {palette.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              aria-label={`Use colour ${hex}`}
              onClick={() => setActiveColor(hex)}
              style={{ backgroundColor: hex }}
              className={cn(
                'size-7 rounded-[3px] border transition-all',
                activeColor === hex
                  ? 'border-white ring-2 ring-[var(--yellow-dark)]'
                  : 'border-black/40',
              )}
            />
          ))}
          <label
            className="flex size-7 cursor-pointer items-center justify-center rounded-[3px] border border-dashed border-[var(--gray)] text-muted-foreground transition-colors hover:border-[var(--yellow-dark)] hover:text-[var(--yellow-dark)]"
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
      </CardContent>
    </Card>
  )
}
