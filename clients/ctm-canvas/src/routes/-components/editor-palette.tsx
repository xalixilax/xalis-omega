import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils.ts"
import { editorStore } from "@/routes/-lib/store"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

export function EditorPalette() {
  const state = useEditorState()
  if (state.palette.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Palette</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-8 gap-0.5">
          {state.palette.map((hex) => (
            <Button
              key={hex}
              type="button"
              variant="outline"
              size="icon-xs"
              title={hex}
              onClick={() =>
                editorStore.setState((prev) => ({
                  ...prev,
                  activeColor: hex,
                  tool: "paint",
                }))
              }
              className={cn(
                state.activeColor === hex && "border-ring ring-2 ring-ring",
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {state.activeColor && (
          <p className="text-sm text-muted-foreground">
            Active: <code>{state.activeColor}</code>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
