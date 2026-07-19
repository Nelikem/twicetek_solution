import { useEffect } from "react"

/**
 * Warns before tab close/reload while there are edits the autosave debounce
 * hasn't committed yet. Native `beforeunload` prompts can't be customized or
 * suppressed in modern browsers — presence of the listener is what matters.
 */
export function useUnsavedChangesWarning(shouldWarn: boolean) {
  useEffect(() => {
    if (!shouldWarn) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [shouldWarn])
}
