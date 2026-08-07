import { editorStore } from "#/routes/-lib/store"
import { useEditorState } from "#/routes/-hooks/use-editor-store"

export function EditorPalette() {
  const state = useEditorState()
  if (state.palette.length === 0) return null
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="island-kicker">Palette</div>
      <div className="grid grid-cols-8 gap-1.5">
        {state.palette.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() =>
              editorStore.setState((prev) => ({
                ...prev,
                activeColor: hex,
                tool: "paint",
              }))
            }
            className={[
              "aspect-square rounded-md border transition",
              state.activeColor === hex
                ? "border-[var(--lagoon-deep)] ring-2 ring-[var(--lagoon)]"
                : "border-[var(--line)] hover:border-[var(--lagoon-deep)]",
            ].join(" ")}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      {state.activeColor && (
        <div className="text-xs text-[var(--sea-ink-soft)]">
          Active: <code>{state.activeColor}</code>
        </div>
      )}
    </div>
  )
}