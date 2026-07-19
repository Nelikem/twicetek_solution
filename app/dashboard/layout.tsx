import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware.ts already redirects unauthenticated visitors away
  // from /dashboard; this is the same check enforced again at the layout boundary,
  // mirroring app/onboarding/(protected)/layout.tsx.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  return <>{children}</>
}
