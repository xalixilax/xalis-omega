import { Download, FileText, ImageOff } from 'lucide-react'
import { Button } from '@design-system/components/button'
import { Card, CardContent } from '@design-system/components/card'
import { Input } from '@design-system/components/input'
import { Label } from '@design-system/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@design-system/components/select'
import { setExportConfig } from '../-lib/actions'
import { useEditor } from '../-hooks/use-editor-store'
import {
  buildProperties,
  composeAlphaSheet,
  composeOverlaySheet,
  downloadBlob,
  downloadText,
  propertiesFileName,
  sheetToImageData,
} from '../-lib/export'
import { encodePng } from '../-lib/image'
import type { LayerOption } from '../-lib/store'

const LAYERS: LayerOption[] = ['cutout_mipped', 'cutout', 'translucent']

/** Export bar: result PNG + alpha PNG + `.properties` form. */
export function EditorExportBar() {
  const tileSize = useEditor((state) => state.tileSize)
  const base = useEditor((state) => state.base)
  const alpha = useEditor((state) => state.alpha)
  const color = useEditor((state) => state.color)
  const baseName = useEditor((state) => state.baseName)
  const matchBlocks = useEditor((state) => state.matchBlocks)
  const connectBlocks = useEditor((state) => state.connectBlocks)
  const startIndex = useEditor((state) => state.startIndex)
  const layer = useEditor((state) => state.layer)

  async function handleDownloadPng() {
    if (tileSize === null || base === null || alpha === null || color === null) {
      return
    }
    const sheet = composeOverlaySheet(tileSize, base, color, alpha)
    const blob = await encodePng(sheetToImageData(sheet))
    downloadBlob(`${baseName}.png`, blob)
  }

  async function handleDownloadAlphaPng() {
    if (tileSize === null || alpha === null || color === null) {
      return
    }
    const sheet = composeAlphaSheet(tileSize, color, alpha)
    const blob = await encodePng(sheetToImageData(sheet))
    downloadBlob(`${baseName}_alpha.png`, blob)
  }

  function handleDownloadProperties() {
    downloadText(
      propertiesFileName(startIndex, matchBlocks),
      buildProperties({ matchBlocks, connectBlocks, layer }),
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="match-blocks" className="text-xs">
            matchBlocks
          </Label>
          <Input
            id="match-blocks"
            value={matchBlocks}
            onChange={(event) =>
              setExportConfig({ matchBlocks: event.target.value })
            }
            placeholder="minecraft:stone"
            className="h-10 w-44 px-3"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="connect-blocks" className="text-xs">
            connectBlocks
          </Label>
          <Input
            id="connect-blocks"
            value={connectBlocks}
            onChange={(event) =>
              setExportConfig({ connectBlocks: event.target.value })
            }
            placeholder="optional"
            className="h-10 w-44 px-3"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="start-index" className="text-xs">
            startIndex
          </Label>
          <Input
            id="start-index"
            type="number"
            min={0}
            value={Number.isNaN(startIndex) ? 0 : startIndex}
            onChange={(event) =>
              setExportConfig({ startIndex: Number(event.target.value) })
            }
            className="h-10 w-20 px-3"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="export-layer" className="text-xs">
            Layer
          </Label>
          <Select
            value={layer}
            onValueChange={(value) =>
              setExportConfig({ layer: value as LayerOption })
            }
          >
            <SelectTrigger id="export-layer" className="h-10 w-44 px-3">
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

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleDownloadPng}
            disabled={tileSize === null}
            title="Final result: base with alpha applied, hand-painted colours on top"
          >
            <Download />
            PNG
          </Button>
          <Button
            size="sm"
            variant="neutral"
            onClick={handleDownloadAlphaPng}
            disabled={tileSize === null}
            title="Black/white alpha: mask plus hand-painted pixels as white"
          >
            <ImageOff />
            Alpha PNG
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadProperties}>
            <FileText />
            .properties
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
