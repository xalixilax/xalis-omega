import { useRef, useState } from 'react'
import { Eraser, Hand, Paintbrush, Pipette, X } from 'lucide-react'
import { Button, buttonVariants } from '@design-system/components/button'
import { Card, CardContent } from '@design-system/components/card'
import { Checkbox } from '@design-system/components/checkbox'
import { Label } from '@design-system/components/label'
import { Slider } from '@design-system/components/slider'
import { Tabs, TabsList, TabsTrigger } from '@design-system/components/tabs'
import { cn } from '@design-system/lib/utils'
import {
  setActiveLayer,
  setBackground,
  setBackgroundOpacity,
  setBrushSize,
  setGuidesVisible,
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
  const brushSize = useEditor((state) => state.brushSize)
  const activeLayer = useEditor((state) => state.activeLayer)
  const viewMode = useEditor((state) => state.viewMode)
  const backgroundOpacity = useEditor((state) => state.backgroundOpacity)
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
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <Label>Tool</Label>
            <Tabs value={tool} onValueChange={(value) => setTool(value as Tool)}>
              <TabsList>
                {TOOLS.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger key={id} value={id} className="flex-none">
                    <Icon />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Label>Brush</Label>
            <Slider
              value={brushSize}
              onValueChange={setBrushSize}
              min={1}
              max={64}
              className="w-28"
            />
            <span
              className="w-12 text-xs tabular-nums text-muted-foreground"
              title="Brush size (Ctrl/Cmd + mouse wheel over the canvas)"
            >
              {brushSize} px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Label>Draw on</Label>
            <Tabs
              value={activeLayer}
              onValueChange={(value) => setActiveLayer(value as ActiveLayer)}
            >
              <TabsList>
                {LAYERS.map(({ id, label }) => (
                  <TabsTrigger key={id} value={id} className="flex-none">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Label>View</Label>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList>
                {VIEW_MODES.map(({ id, label }) => (
                  <TabsTrigger key={id} value={id} className="flex-none">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-dark">
            <Checkbox
              checked={overlayVisible}
              onCheckedChange={(checked) => setOverlayVisible(checked === true)}
            />
            Overlay
          </label>

          <label
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-dark"
            title="Per-tile connection guides (dashed side/corner markers)"
          >
            <Checkbox
              checked={guidesVisible}
              onCheckedChange={(checked) => setGuidesVisible(checked === true)}
            />
            Guides
          </label>

          <label
            className={cn(
              'flex items-center gap-2 text-sm font-semibold text-gray-dark',
              hasBackground ? '' : 'opacity-40',
            )}
            title="Opacity of the background layer used to test overlays"
          >
            Background
            <Slider
              value={backgroundOpacity}
              onValueChange={setBackgroundOpacity}
              min={0}
              max={100}
              step={5}
              disabled={!hasBackground}
              className="w-32"
            />
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
              {backgroundOpacity}%
            </span>
          </label>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'size-2',
                hasBackground ? 'bg-yellow' : 'bg-[var(--border)]',
              )}
              title={hasBackground ? 'Custom background set' : 'No background'}
            />
            <label
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'cursor-pointer',
              )}
              title="Load a background texture to test the overlay"
            >
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setBackgroundError(null)
                  void setBackground(null)
                }}
                title="Remove the custom background"
              >
                <X />
              </Button>
            )}
          </div>

          {backgroundError !== null && (
            <span className="text-xs text-destructive" role="alert">
              {backgroundError}
            </span>
          )}

          <span className="text-xs tracking-[0.03em] text-muted-foreground">
            {activeLayer === 'alpha'
              ? 'Alpha layer: paint shows base pixels, erase hides them.'
              : 'Color layer: paint hand colours, erase removes them. The alpha mask never applies here.'}{' '}
            Right-click always erases. Ctrl/Cmd+wheel resizes the brush.
            Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
