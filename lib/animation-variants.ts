import type { Variants } from "framer-motion"

/** Shared entrance choreography: parent staggers, each child fades/slides up in
 * sequence. Used across the landing page and onboarding forms. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}
