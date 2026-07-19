"use client"

import { useReducedMotion } from "framer-motion"

/**
 * Three soft, slowly-drifting color fields plus a faint dot-grid — the ambient
 * "premium enterprise SaaS" atmosphere behind the onboarding shell and landing
 * page. Reduced-motion users get the gradient without the drift.
 */
export function MeshGradientBackground() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className={
          "absolute -top-1/4 left-[8%] size-[36rem] rounded-full opacity-[0.14] blur-3xl " +
          (prefersReducedMotion ? "" : "animate-mesh-drift")
        }
        style={{ background: "radial-gradient(circle, var(--accent-mesh-1), transparent 70%)" }}
      />
      <div
        className={
          "absolute top-[5%] right-[4%] size-[30rem] rounded-full opacity-[0.12] blur-3xl " +
          (prefersReducedMotion ? "" : "animate-mesh-drift")
        }
        style={{
          background: "radial-gradient(circle, var(--accent-mesh-2), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
      <div
        className={
          "absolute bottom-[-10%] left-[30%] size-[34rem] rounded-full opacity-[0.1] blur-3xl " +
          (prefersReducedMotion ? "" : "animate-mesh-drift")
        }
        style={{
          background: "radial-gradient(circle, var(--accent-mesh-3), transparent 70%)",
          animationDelay: "-12s",
        }}
      />
      <div className="absolute inset-0 [background-image:radial-gradient(color-mix(in_oklch,var(--foreground),transparent_92%)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
    </div>
  )
}
