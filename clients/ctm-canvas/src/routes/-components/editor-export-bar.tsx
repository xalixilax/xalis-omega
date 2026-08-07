import { useState } from "react"
import { editorStore } from "#/routes/-lib/store"
import { useEditorState } from "#/routes/-hooks/use-editor-store"
import {
  composeSheetImage,
  downloadBlob,
  propertiesFileContent,
  sheetImageToPngBlob,
} from "#/routes/-lib/image"

export function EditorExportBar() {
  const state = useEditorState()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (key: "matchBlocks" | "connectBlocks" | "blockName" | "layer") => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    editorStore.setState((prev) => ({ ...prev, [key]: value }))
  }

  async function onExportPng() {
    if (!state.ready || !state.alpha || !state.color) return
    setBusy(true)
    setError(null)
    try {
      const composed = composeSheetImage({
        color: state.color,
        alpha: state.alpha,
        tileSize: state.tileSize,
      })
      const blob = await sheetImageToPngBlob(composed)
      downloadBlob(blob, `${state.blockName || "block"}_0.png`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  function onExportProperties() {
    if (!state.ready) return
    const content = propertiesFileContent({
      matchBlocks: state.matchBlocks,
      connectBlocks: state.connectBlocks,
      layer: state.layer,
    })
    const blob = new Blob([content], { type: "text/plain" })
    downloadBlob(blob, `0_${state.blockName || "block"}.properties`)
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="island-kicker">Export</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
            block name
          </span>
          <input
            value={state.blockName}
            onChange={setField("blockName")}
            className="rounded-md border border-[var(--line)] px-2 py-1 bg-white"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
            layer
          </span>
          <input
            value={state.layer}
            onChange={setField("layer")}
            className="rounded-md border border-[var(--line)] px-2 py-1 bg-white"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
            matchBlocks
          </span>
          <input
            value={state.matchBlocks}
            onChange={setField("matchBlocks")}
            placeholder="amethyst_blocks grass_block"
            className="rounded-md border border-[var(--line)] px-2 py-1 bg-white"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--sea-ink-soft)]">
            connectBlocks
          </span>
          <input
            value={state.connectBlocks}
            onChange={setField("connectBlocks")}
            placeholder="amethyst_block budding_amethyst"
            className="rounded-md border border-[var(--line)] px-2 py-1 bg-white"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onExportPng}
          disabled={!state.ready || busy}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold bg-[var(--lagoon)] text-white border border-[var(--lagoon-deep)] disabled:opacity-50"
        >
          {busy ? "Exporting…" : "Download PNG"}
        </button>
        <button
          type="button"
          onClick={onExportProperties}
          disabled={!state.ready}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold bg-white text-[var(--sea-ink)] border border-[var(--line)] disabled:opacity-50"
        >
          Download .properties
        </button>
      </div>
      {error && <div className="text-xs text-[var(--destructive)]">{error}</div>}
    </div>
  )
}