import { useEffect, useRef } from "react"
import { editorStore } from "#/routes/-lib/store"
import {
  imageDataToDataUrl,
  fillBaseSheetFromImage,
  loadImage,
  decodeImage,
} from "#/routes/-lib/image"
import { templates, defaultTemplateId } from "#/routes/-lib/templates"
import { SHEET_COLS, SHEET_ROWS } from "#/routes/-lib/overlay"

const STORAGE_KEY = "ctm-canvas:v1"
const DEBOUNCE_MS = 600

type Serializable = {
  tileSize: number
  templateId: string
  basePngDataUrl: string | null
  alpha: number[]
  color: number[]
  palette: string[]
  activeColor: string | null
  tool: string
  editing: string
  matchBlocks: string
  connectBlocks: string
  blockName: string
  layer: string
}

export function serializeState(): Serializable | null {
  const state = editorStore.state
  if (!state.ready || !state.alpha || !state.color) return null

  let basePngDataUrl: string | null = null
  if (state.base) {
    basePngDataUrl = imageDataToDataUrl({
      width: state.tileSize,
      height: state.tileSize,
      data: state.base,
    })
  }

  return {
    tileSize: state.tileSize,
    templateId: state.templateId,
    basePngDataUrl,
    alpha: Array.from(state.alpha),
    color: Array.from(state.color),
    palette: state.palette,
    activeColor: state.activeColor,
    tool: state.tool,
    editing: state.editing,
    matchBlocks: state.matchBlocks,
    connectBlocks: state.connectBlocks,
    blockName: state.blockName,
    layer: state.layer,
  }
}

export function writeAutosave(value: Serializable): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (err) {
    console.warn("autosave failed", err)
  }
}

export function clearAutosave(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function readAutosave(): Serializable | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Serializable
  } catch {
    return null
  }
}

export type RestoreResult = {
  ok: boolean
  reason?: string
}

export async function restoreFromAutosave(
  saved: Serializable,
): Promise<RestoreResult> {
  const templateId = templates.find((t) => t.id === saved.templateId)
    ? saved.templateId
    : defaultTemplateId

  // Re-decode base PNG into Uint8ClampedArray
  let base: Uint8ClampedArray | null = null
  let baseImage: HTMLImageElement | null = null
  if (saved.basePngDataUrl) {
    baseImage = await loadImage(saved.basePngDataUrl)
    const decoded = decodeImage(baseImage)
    base = fillBaseSheetFromImage(decoded)
  }

  editorStore.setState((prev) => ({
    ...prev,
    ready: true,
    tileSize: saved.tileSize,
    templateId,
    base,
    baseImage,
    alpha: new Uint8Array(saved.alpha),
    color: new Uint8Array(saved.color),
    palette: saved.palette,
    activeColor: saved.activeColor,
    tool: saved.tool as typeof editorStore.state.tool,
    editing: saved.editing === "alpha" ? "alpha" : "color",
    matchBlocks: saved.matchBlocks,
    connectBlocks: saved.connectBlocks,
    blockName: saved.blockName,
    layer: saved.layer,
    sheetWidth: SHEET_COLS * saved.tileSize,
    sheetHeight: SHEET_ROWS * saved.tileSize,
  }))
  return { ok: true }
}

/**
 * Watch the store; when state.ready and stable for DEBOUNCE_MS, persist.
 */
export function useAutosave(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const sub = editorStore.subscribe(() => {
      if (!editorStore.state.ready) return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const snapshot = serializeState()
        if (snapshot) writeAutosave(snapshot)
      }, DEBOUNCE_MS)
    })
    return () => sub.unsubscribe()
  }, [])
}