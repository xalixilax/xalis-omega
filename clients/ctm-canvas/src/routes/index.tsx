import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { EditorUploader } from "#/routes/-components/editor-uploader"
import { EditorToolbar } from "#/routes/-components/editor-toolbar"
import { EditorPalette } from "#/routes/-components/editor-palette"
import { EditorPixelCanvas } from "#/routes/-components/editor-pixel-canvas"
import { EditorPreviewPanel } from "#/routes/-components/editor-preview-panel"
import { EditorExportBar } from "#/routes/-components/editor-export-bar"
import { useAutosave, readAutosave, restoreFromAutosave } from "#/routes/-hooks/use-autosave"
import { editorStore } from "#/routes/-lib/store"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  useAutosave()
  const [prompted, setPrompted] = useState(false)

  useEffect(() => {
    if (prompted) return
    const saved = readAutosave()
    if (!saved) {
      setPrompted(true)
      return
    }
    const ok = window.confirm(
      "A saved session was found in this browser. Restore it?",
    )
    setPrompted(true)
    if (!ok) return
    restoreFromAutosave(saved).catch((err) => {
      console.warn("restore failed", err)
    })
  }, [prompted])

  return (
    <div className="page-wrap py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Continuity overlay editor</p>
          <h1 className="display-title text-4xl text-[var(--sea-ink)]">
            CTM Canvas
          </h1>
        </div>
        <p className="hidden md:block text-sm text-[var(--sea-ink-soft)] max-w-xl">
          Upload a 16/32/64px block texture, paint the 17 overlay tiles for the
          Continuity overlay method, preview every connection state, and
          export a ready-to-use PNG + <code>.properties</code>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_minmax(420px,1fr)] gap-6">
        <aside className="flex flex-col gap-4">
          <EditorUploader />
          <EditorToolbar />
          <EditorPalette />
          <EditorExportBar />
        </aside>

        <section className="flex flex-col gap-4">
          <EditorPixelCanvas />
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Tile indices 0..16 follow the Continuity overlay layout. Padding
            cells (17..20) are not exported. Paint, Erase, Pick, and Pan live in
            the toolbar; right-click erases. Use the Color/Alpha toggle to edit
            colors or the mask — the canvas shows exactly what is exported.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <EditorPreviewPanel />
        </section>
      </div>

      <footer className="mt-10 pt-6 border-t border-[var(--line)] text-xs text-[var(--sea-ink-soft)] flex items-center justify-between">
        <span>
          Built for the Continuity connected-textures spec ·{" "}
          <a
            href="https://github.com/PepperCode1/Continuity/wiki/Continuity-Connected-Textures-Specification"
            target="_blank"
            rel="noreferrer"
          >
            spec
          </a>
        </span>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm("Clear saved session?")) return
            localStorage.removeItem("ctm-canvas:v1")
            editorStore.setState((prev) => ({ ...prev, ready: false }))
            window.location.reload()
          }}
          className="underline"
        >
          Clear session
        </button>
      </footer>
    </div>
  )
}