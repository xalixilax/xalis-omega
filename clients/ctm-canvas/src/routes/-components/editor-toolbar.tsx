import { editorStore, type EditingMode, type Tool } from "#/routes/-lib/store"
import { useEditorState } from "#/routes/-hooks/use-editor-store"

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
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="island-kicker">Tools</div>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            onClick={() =>
              editorStore.setState((prev) => ({ ...prev, editing: m.id }))
            }
            className={[
              "px-3 py-1.5 rounded-md text-sm font-semibold transition",
              state.editing === m.id
                ? "bg-[var(--lagoon)] text-white"
                : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]",
            ].join(" ")}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.hint}
            onClick={() => editorStore.setState((prev) => ({ ...prev, tool: t.id }))}
            className={[
              "px-3 py-2 rounded-lg text-sm font-medium border transition",
              state.tool === t.id
                ? "bg-[var(--lagoon)] text-white border-[var(--lagoon-deep)]"
                : "bg-white text-[var(--sea-ink)] border-[var(--line)] hover:bg-[var(--surface)]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--sea-ink-soft)]">
        Editing: <strong className="text-[var(--sea-ink)]">{state.editing}</strong>
        {" · "}Tool:{" "}
        <strong className="text-[var(--sea-ink)]">{state.tool}</strong>
      </p>
    </div>
  )
}
