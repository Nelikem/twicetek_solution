import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function ProtectedOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Defense in depth: middleware.ts already redirects unauthenticated visitors away
  // from the numbered wizard steps; this is the same check enforced again at the
  // layout boundary. /onboarding/register (the sibling, unauthenticated route) is
  // outside this route group and unaffected.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/onboarding")
  }

  return <>{children}</>
}
