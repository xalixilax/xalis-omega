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
import { editorStore } from "@/routes/-lib/store"
import { useEditorState } from "@/routes/-hooks/use-editor-store"
import {
  composeSheetImage,
  downloadBlob,
  propertiesFileContent,
  sheetImageToPngBlob,
} from "@/routes/-lib/image"

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
              value={state.blockName}
              onChange={setField("blockName")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="layer">Layer</Label>
            <Input
              id="layer"
              value={state.layer}
              onChange={setField("layer")}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="match-blocks">Match blocks</Label>
            <Input
              id="match-blocks"
              value={state.matchBlocks}
              onChange={setField("matchBlocks")}
              placeholder="amethyst_blocks grass_block"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="connect-blocks">Connect blocks</Label>
            <Input
              id="connect-blocks"
              value={state.connectBlocks}
              onChange={setField("connectBlocks")}
              placeholder="amethyst_block budding_amethyst"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onExportPng}
            disabled={!state.ready || busy}
            className="flex-1"
          >
            {busy ? "Exporting…" : "Download PNG"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportProperties}
            disabled={!state.ready}
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
