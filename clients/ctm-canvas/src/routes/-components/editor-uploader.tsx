import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@design-system/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@design-system/components/card'
import { Kicker } from '@design-system/components/kicker'
import { Label } from '@design-system/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@design-system/components/select'
import { initDocument } from '../-lib/actions'
import {
  alphaTemplates,
  DEFAULT_TEMPLATE_ID,
} from '../-lib/templates'

const fileInputClass =
  'h-[50px] w-full cursor-pointer rounded-[3px] border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--gray-darker)] file:mr-3 file:rounded-none file:border-0 file:border-b-4 file:border-b-[var(--yellow-dark)] file:bg-yellow file:px-3 file:py-1 file:font-bold file:tracking-wider file:uppercase file:text-white'

/** Image upload form shown when no document is loaded. */
export function EditorUploader() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [templateId, setTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const backgroundInputRef = useRef<HTMLInputElement | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Pick a square PNG texture first.')
      return
    }
    const backgroundFile = backgroundInputRef.current?.files?.[0] ?? null
    setBusy(true)
    setError(null)
    try {
      const template = alphaTemplates.find((entry) => entry.id === templateId)
      await initDocument(file, template?.url ?? null, file.name, backgroundFile)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not load the image.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card className="mx-auto mt-16 w-full max-w-md">
      <CardHeader>
        <Kicker>New document</Kicker>
        <CardTitle>New overlay document</CardTitle>
        <CardDescription>
          Pick a square Minecraft sprite (16x, 32x, 64x...), or a full 7x3
          sheet to tweak an existing texture. A sheet with its base tile in
          slot 18 restores the cutout mask and painted colours. The select
          below only applies to other uploads.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="base-texture">Base texture</Label>
          <input
            ref={fileInputRef}
            id="base-texture"
            type="file"
            accept="image/png"
            name="texture"
            className={fileInputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template">
            Starting alpha{' '}
            <span className="font-normal normal-case tracking-normal">
              (initial mask for all 17 tiles)
            </span>
          </Label>
          <Select
            value={templateId}
            onValueChange={(value) => setTemplateId(value ?? '')}
          >
            <SelectTrigger id="template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (show full texture)</SelectItem>
              {alphaTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="background-texture">
            Background texture{' '}
            <span className="font-normal normal-case tracking-normal">
              (optional, same size)
            </span>
          </Label>
          <input
            ref={backgroundInputRef}
            id="background-texture"
            type="file"
            accept="image/png"
            name="background"
            className={fileInputClass}
          />
        </div>

        {error !== null && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          <Upload />
          {busy ? 'Loading...' : 'Open editor'}
        </Button>
        </form>
      </CardContent>
    </Card>
  )
}
