import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils.ts"
import { initDocument, applyTemplateAlpha } from "@/routes/-lib/actions"
import {
  alphaTemplates,
  DEFAULT_TEMPLATE_ID,
} from "@/routes/-lib/templates"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

export function EditorUploader() {
  const state = useEditorState()
  const fileRef = useRef<HTMLInputElement>(null)
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleImage = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const template = alphaTemplates.find((t) => t.id === templateId)
      await initDocument(file, template?.url ?? null, file.name, null)
      setPreviewUrl((previous) => {
        if (previous !== null) URL.revokeObjectURL(previous)
        return URL.createObjectURL(file)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const applyTemplate = (id: string) => {
    setTemplateId(id)
    if (state.tileSize === null) return
    const template = alphaTemplates.find((t) => t.id === id)
    if (!template) return
    setError(null)
    applyTemplateAlpha(template.url).catch((err) => {
      setError(err instanceof Error ? err.message : String(err))
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload texture</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
        <Button
          type="button"
          variant="outline"
          aria-label="Upload base texture"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleImage(file)
          }}
          className={cn(
            "flex min-h-36 w-full cursor-pointer flex-col gap-2 rounded-lg border-2 border-dashed px-3 py-4 text-center",
            dragging && "border-primary bg-muted",
            busy && "pointer-events-none opacity-50",
          )}
        >
          {state.tileSize !== null || previewUrl !== null ? (
            <>
              <div className="grid size-20 place-items-center rounded-md border bg-[repeating-conic-gradient(rgba(23,58,64,0.07)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-2">
                {previewUrl !== null && (
                  <img
                    src={previewUrl}
                    alt="Uploaded base texture"
                    className="max-h-full max-w-full"
                    style={{ imageRendering: "pixelated" }}
                  />
                )}
              </div>
              <p className="text-sm font-semibold">
                {state.tileSize ?? "?"}px base texture loaded
              </p>
              <p className="text-xs text-muted-foreground">
                Drag another PNG here or click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">
                Drop your base texture here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse · 16, 32, or 64 px square PNG
              </p>
            </>
          )}
        </Button>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alpha-template">Alpha template</Label>
          <Select
            value={templateId}
            onValueChange={(id) => {
              if (id) applyTemplate(id)
            }}
          >
            <SelectTrigger id="alpha-template" className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {alphaTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
