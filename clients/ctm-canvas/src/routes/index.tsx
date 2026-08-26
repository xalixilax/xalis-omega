import { createFileRoute } from '@tanstack/react-router'
import { EditorExportBar } from './-components/editor-export-bar'
import { EditorPalette } from './-components/editor-palette'
import { EditorPixelCanvas } from './-components/editor-pixel-canvas'
import { EditorPreviewPanel } from './-components/editor-preview-panel'
import { EditorToolbar } from './-components/editor-toolbar'
import { EditorUploader } from './-components/editor-uploader'
import { resetDocument } from './-lib/actions'
import { useAutosave } from './-hooks/use-autosave'
import { useEditor } from './-hooks/use-editor-store'

export const Route = createFileRoute('/')({
  component: EditorPage,
})

function EditorPage() {
  useAutosave()
  const tileSize = useEditor((state) => state.tileSize)

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          CTM Canvas
          <span className="ml-2 text-sm font-normal text-zinc-500">
            Continuity overlay editor
          </span>
        </h1>
        {tileSize !== null && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Discard the current document?')) {
                resetDocument()
              }
            }}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm hover:border-zinc-600"
          >
            New document
          </button>
        )}
      </header>

      {tileSize === null ? (
        <EditorUploader />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="flex min-w-0 flex-col gap-3">
            <EditorToolbar />
            <EditorPalette />
            <EditorPixelCanvas />
            <EditorExportBar />
          </section>
          <aside className="min-w-0">
            <EditorPreviewPanel />
          </aside>
        </div>
      )}
    </main>
  )
}
