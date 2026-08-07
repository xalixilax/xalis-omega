import { useRef, useState } from "react"
import {
  decodeImage,
  extractPalette,
  fillAlphaSheetFromTemplate,
  fillBaseSheetFromImage,
  fillColorSheetFromImage,
  loadImage,
  loadImageFromFile,
  validateSquareImage,
} from "#/routes/-lib/image"
import { templates, defaultTemplateId } from "#/routes/-lib/templates"
import { editorStore } from "#/routes/-lib/store"
import { SHEET_COLS, SHEET_ROWS } from "#/routes/-lib/overlay"

export function EditorUploader() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleImage = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const img = await loadImageFromFile(file)
      const decoded = decodeImage(img)
      const tileSize = validateSquareImage(decoded)
      const palette = extractPalette(decoded)
      const colorSheet = fillColorSheetFromImage(decoded)
      const baseSheet = fillBaseSheetFromImage(decoded)
      const templateId = editorStore.state.templateId || defaultTemplateId
      const template = templates.find((t) => t.id === templateId) ?? templates[0]
      const templateImg = await loadImage(template.url)
      const decodedTemplate = decodeImage(templateImg)
      const alphaSheet = fillAlphaSheetFromTemplate(decodedTemplate, tileSize)
      const sheetWidth = SHEET_COLS * tileSize
      const sheetHeight = SHEET_ROWS * tileSize
      editorStore.setState((prev) => ({
        ...prev,
        ready: true,
        tileSize,
        templateId,
        base: baseSheet,
        baseImage: img,
        alpha: alphaSheet,
        color: colorSheet,
        palette: palette.hex,
        activeColor: palette.hex[0] ?? null,
        tool: "paint",
        sheetWidth,
        sheetHeight,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const applyTemplate = async (id: string) => {
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) return
    editorStore.setState((prev) => ({ ...prev, templateId: id }))
    const state = editorStore.state
    if (!state.ready) return
    const tplImg = await loadImage(tpl.url)
    const decoded = decodeImage(tplImg)
    const alpha = fillAlphaSheetFromTemplate(decoded, state.tileSize)
    editorStore.setState((prev) => ({ ...prev, alpha }))
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
      <div className="island-kicker">Upload texture</div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImage(file)
          e.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="rounded-lg px-3 py-2 text-sm font-semibold bg-[var(--lagoon)] text-white border border-[var(--lagoon-deep)] hover:bg-[var(--lagoon-deep)] disabled:opacity-50"
      >
        {busy ? "Loading…" : "Upload PNG texture"}
      </button>
      <p className="text-xs text-[var(--sea-ink-soft)]">
        A 16, 32, or 64 px square PNG. On upload, the sheet is filled with the
        texture and the alpha template is applied — you can then erase or paint
        the mask in Alpha mode.
      </p>
      <div>
        <label className="block text-xs uppercase tracking-wider mb-1 text-[var(--sea-ink-soft)]">
          Alpha template
        </label>
        <select
          className="w-full rounded-md border border-[var(--line)] px-2 py-1 text-sm bg-white"
          value={editorStore.state.templateId}
          onChange={(e) => applyTemplate(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {busy && <div className="text-xs text-[var(--sea-ink-soft)]">Loading…</div>}
      {error && (
        <div className="text-xs text-[var(--destructive)]">{error}</div>
      )}
    </div>
  )
}