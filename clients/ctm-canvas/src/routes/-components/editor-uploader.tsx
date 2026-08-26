import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { initDocument } from '../-lib/actions'
import {
  alphaTemplates,
  DEFAULT_TEMPLATE_ID,
} from '../-lib/templates'

/** Image + template picker shown when no document is loaded. */
export function EditorUploader() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const templateId = String(form.get('template') ?? '')
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Pick a square PNG texture first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const templateUrl =
        alphaTemplates.find((template) => template.id === templateId)?.url ??
        null
      await initDocument(file, templateUrl, file.name)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not load the image.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-24 flex w-full max-w-md flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6"
    >
      <div>
        <h2 className="text-base font-semibold">New overlay document</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Pick a square Minecraft sprite (16x, 32x, 64x...). It is copied into
          all 17 overlay cells.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Base texture</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          name="texture"
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Alpha template</span>
        <select
          name="template"
          defaultValue={DEFAULT_TEMPLATE_ID}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="">None (empty alpha)</option>
          {alphaTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </label>

      {error !== null && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
      >
        <Upload size={16} />
        {busy ? 'Loading...' : 'Open editor'}
      </button>
    </form>
  )
}
