import { useEffect } from 'react'
import { redo, undo } from '../-lib/history'

/**
 * Global keyboard shortcuts: Cmd/Ctrl+Z undoes, Cmd/Ctrl+Shift+Z redoes the
 * last draw or erase step.
 */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) {
        return
      }
      if (event.key.toLowerCase() !== 'z') {
        return
      }
      event.preventDefault()
      if (event.shiftKey) {
        redo()
      } else {
        undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
