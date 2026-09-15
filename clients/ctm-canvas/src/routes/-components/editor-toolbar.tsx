import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setActiveLayer, setBrushSize, setTool } from "@/routes/-lib/actions"
import type { ActiveLayer, Tool } from "@/routes/-lib/store"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: "paint", label: "Paint", hint: "Paint the active layer with the active color" },
  { id: "erase", label: "Erase", hint: "Erase on the active layer. Right-click always erases" },
  { id: "picker", label: "Picker", hint: "Sample pixel into the palette" },
  { id: "pan", label: "Pan", hint: "Drag the canvas when overflow" },
]

const MODES: { id: ActiveLayer; label: string; hint: string }[] = [
  { id: "color", label: "Color", hint: "Paint writes the active palette color and reveals it" },
  { id: "alpha", label: "Alpha", hint: "Paint reveals the base texture, erase makes transparent" },
]

export function EditorToolbar() {
  const state = useEditorState()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ToggleGroup
          variant="outline"
          value={[state.activeLayer]}
          onValueChange={(v) => {
            if (v.length === 0) return
            setActiveLayer(v[0] as ActiveLayer)
          }}
          className="w-full"
        >
          {MODES.map((m) => (
            <ToggleGroupItem key={m.id} value={m.id} title={m.hint} className="flex-1">
              {m.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          variant="outline"
          value={[state.tool]}
          onValueChange={(v) => {
            if (v.length === 0) return
            setTool(v[0] as Tool)
          }}
          className="w-full flex-wrap"
        >
          {TOOLS.map((t) => (
            <ToggleGroupItem key={t.id} value={t.id} title={t.hint} className="flex-1">
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Label htmlFor="brush-size">Brush</Label>
          <Input
            id="brush-size"
            type="range"
            min={1}
            max={64}
            step={1}
            value={state.brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            title="Brush size (Ctrl/Cmd + mouse wheel over the canvas)"
            className="flex-1"
          />
          <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
            {state.brushSize}px
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Editing:{" "}
          <span className="font-medium text-foreground">{state.activeLayer}</span>
          {" · "}Tool:{" "}
          <span className="font-medium text-foreground">{state.tool}</span>
        </p>
      </CardContent>
    </Card>
  )
}
