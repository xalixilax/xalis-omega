import { useStore } from "@tanstack/react-store"
import { editorStore, type EditorState } from "#/routes/-lib/store"

export function useEditorState(): EditorState {
  return useStore(editorStore, (s) => s)
}