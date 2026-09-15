import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { editorStore, type EditingMode, type Tool } from "@/routes/-lib/store"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: "paint", label: "Paint", hint: "Color mode: write color + reveal. Alpha mode: reveal mask" },
  { id: "erase", label: "Erase", hint: "Set alpha=0 (transparent). Right-click always erases" },
  { id: "picker", label: "Picker", hint: "Sample pixel into active palette slot" },
  { id: "pan", label: "Pan", hint: "Drag the canvas when overflow" },
]

const MODES: { id: EditingMode; label: string; hint: string }[] = [
  { id: "color", label: "Color", hint: "Paint writes the active palette color and reveals it" },
  { id: "alpha", label: "Alpha", hint: "Paint reveals the existing color, erase makes transparent" },
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
          value={[state.editing]}
          onValueChange={(v) => {
            if (v.length === 0) return
            editorStore.setState((prev) => ({ ...prev, editing: v[0] as EditingMode }))
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
            editorStore.setState((prev) => ({ ...prev, tool: v[0] as Tool }))
          }}
          className="w-full flex-wrap"
        >
          {TOOLS.map((t) => (
            <ToggleGroupItem key={t.id} value={t.id} title={t.hint} className="flex-1">
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">
          Editing: <span className="font-medium text-foreground">{state.editing}</span>
          {" · "}Tool:{" "}
          <span className="font-medium text-foreground">{state.tool}</span>
        </p>
      </CardContent>
    </Card>
  )
}
