import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { setExportConfig } from "@/routes/-lib/actions"
import {
  buildProperties,
  composeOverlaySheet,
  downloadBlob,
  downloadText,
  propertiesFileName,
  sheetToImageData,
} from "@/routes/-lib/export"
import { encodePng } from "@/routes/-lib/image"
import { editorStore, type LayerOption } from "@/routes/-lib/store"
import { useEditorState } from "@/routes/-hooks/use-editor-store"

const LAYERS: LayerOption[] = ["cutout_mipped", "cutout", "translucent"]

export function EditorExportBar() {
  const state = useEditorState()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ready =
    state.tileSize !== null &&
    state.base !== null &&
    state.alpha !== null &&
    state.color !== null

  async function onExportPng() {
    const { tileSize, base, color, alpha, baseName } = editorStore.state
    if (tileSize === null || base === null || color === null || alpha === null) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const sheet = composeOverlaySheet(tileSize, base, color, alpha)
      const blob = await encodePng(sheetToImageData(sheet))
      downloadBlob(`${baseName || "block"}.png`, blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  function onExportProperties() {
    if (!ready) return
    downloadText(
      propertiesFileName(state.startIndex, state.matchBlocks),
      buildProperties({
        matchBlocks: state.matchBlocks,
        connectBlocks: state.connectBlocks,
        layer: state.layer,
      }),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-name">Block name</Label>
            <Input
              id="block-name"
              value={state.baseName}
              onChange={(e) =>
                editorStore.setState((prev) => ({
                  ...prev,
                  baseName: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="layer">Layer</Label>
            <Select
              value={state.layer}
              onValueChange={(value) => {
                if (value)
                  setExportConfig({ layer: value as LayerOption })
              }}
            >
              <SelectTrigger id="layer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYERS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-index">Start index</Label>
            <Input
              id="start-index"
              type="number"
              min={0}
              value={Number.isNaN(state.startIndex) ? 0 : state.startIndex}
              onChange={(e) =>
                setExportConfig({ startIndex: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="connect-blocks">Connect blocks</Label>
            <Input
              id="connect-blocks"
              value={state.connectBlocks}
              onChange={(e) =>
                setExportConfig({ connectBlocks: e.target.value })
              }
              placeholder="optional"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="match-blocks">Match blocks</Label>
            <Input
              id="match-blocks"
              value={state.matchBlocks}
              onChange={(e) => setExportConfig({ matchBlocks: e.target.value })}
              placeholder="minecraft:stone"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onExportPng}
            disabled={!ready || busy}
            className="flex-1"
          >
            {busy ? "Exporting…" : "Download PNG"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportProperties}
            disabled={!ready}
            className="flex-1"
          >
            Download .properties
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Export failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
