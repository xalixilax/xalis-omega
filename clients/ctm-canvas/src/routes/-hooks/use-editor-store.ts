import { useStore } from "@tanstack/react-store"
import { editorStore, type EditorState } from "@/routes/-lib/store"

export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useStore(editorStore, selector)
}

export function useEditorState(): EditorState {
  return useStore(editorStore, (s) => s)
}
