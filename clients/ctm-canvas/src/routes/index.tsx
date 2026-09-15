import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { EditorUploader } from "@/routes/-components/editor-uploader"
import { EditorToolbar } from "@/routes/-components/editor-toolbar"
import { EditorPalette } from "@/routes/-components/editor-palette"
import { EditorPixelCanvas } from "@/routes/-components/editor-pixel-canvas"
import { EditorPreviewPanel } from "@/routes/-components/editor-preview-panel"
import { EditorExportBar } from "@/routes/-components/editor-export-bar"
import {
  useAutosave,
  readAutosave,
  restoreFromAutosave,
  clearAutosave,
  type Serializable,
} from "@/routes/-hooks/use-autosave"
import { useKeyboardShortcuts } from "@/routes/-hooks/use-keyboard-shortcuts"
import { resetDocument } from "@/routes/-lib/actions"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  useAutosave()
  useKeyboardShortcuts()
  const [prompted, setPrompted] = useState(false)
  const [saved, setSaved] = useState<Serializable | null>(null)
  const [clearOpen, setClearOpen] = useState(false)

  useEffect(() => {
    if (prompted) return
    setPrompted(true)
    setSaved(readAutosave())
  }, [prompted])

  const onRestore = () => {
    if (!saved) return
    restoreFromAutosave(saved).catch((err) => {
      console.warn("restore failed", err)
    })
    setSaved(null)
  }

  const onClearSession = () => {
    clearAutosave()
    resetDocument()
  }

  return (
    <div className="page-wrap py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">Continuity overlay editor</p>
          <h1 className="display-title text-4xl">CTM Canvas</h1>
        </div>
        <p className="hidden md:block text-sm text-muted-foreground max-w-xl">
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
          <p className="text-sm text-muted-foreground">
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

      <footer className="mt-10 flex items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground">
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
        <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
          <AlertDialogTrigger
            render={
              <Button variant="link" size="sm" className="h-auto p-0" />
            }
          >
            Clear session
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear saved session?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the autosaved texture from this browser and resets
                the editor.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onClearSession}>
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>

      <AlertDialog
        open={!!saved}
        onOpenChange={(open) => {
          if (!open) setSaved(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore saved session?</AlertDialogTitle>
            <AlertDialogDescription>
              A saved session was found in this browser. Restore it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Skip</AlertDialogCancel>
            <AlertDialogAction onClick={onRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
