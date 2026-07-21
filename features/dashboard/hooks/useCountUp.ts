import { useEffect, useState } from "react"
import { animate, useMotionValue } from "framer-motion"

/** Animates from the previous value to `target`. Returns `target` immediately
 * (no animation) when `target` is null -- callers gate rendering on `null`
 * separately (see KpiCard), this hook only owns the count-up motion. */
export function useCountUp(target: number | null, durationMs = 700): number {
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(target ?? 0)

  useEffect(() => {
    if (target === null) return
    const controls = animate(motionValue, target, { duration: durationMs / 1000, ease: "easeOut" })
    const unsubscribe = motionValue.on("change", (latest) => setDisplay(Math.round(latest)))
    return () => {
      controls.stop()
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return target === null ? 0 : display
}
