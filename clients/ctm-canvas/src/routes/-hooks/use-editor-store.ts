import { useStore } from '@tanstack/react-store'
import { editorStore } from '../-lib/store'
import type { EditorState } from '../-lib/store'

export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useStore(editorStore, selector)
}
