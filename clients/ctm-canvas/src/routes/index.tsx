import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@design-system/components/button'
import { Kicker } from '@design-system/components/kicker'
import { EditorExportBar } from './-components/editor-export-bar'
import { EditorPalette } from './-components/editor-palette'
import { EditorPixelCanvas } from './-components/editor-pixel-canvas'
import { EditorPreviewPanel } from './-components/editor-preview-panel'
import { EditorToolbar } from './-components/editor-toolbar'
import { EditorUploader } from './-components/editor-uploader'
import { resetDocument } from './-lib/actions'
import { useAutosave } from './-hooks/use-autosave'
import { useEditor } from './-hooks/use-editor-store'
import { useKeyboardShortcuts } from './-hooks/use-keyboard-shortcuts'

export const Route = createFileRoute('/')({
  component: EditorPage,
})

function EditorPage() {
  useAutosave()
  useKeyboardShortcuts()
  const tileSize = useEditor((state) => state.tileSize)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white card-shadow">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-black tracking-wider text-gray-dark uppercase">
              CTM Canvas
            </span>
            <Kicker>Continuity overlay editor</Kicker>
          </div>
          {tileSize !== null && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Discard the current document?')) {
                  resetDocument()
                }
              }}
            >
              New document
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] p-4">
        {tileSize === null ? (
          <EditorUploader />
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="flex min-w-0 flex-col gap-4">
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
    </div>
  )
}
