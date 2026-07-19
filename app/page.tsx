import { redirect } from "next/navigation"

import { LandingPage } from "@/features/landing/components/LandingPage"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Signed-in visitors skip the marketing page and go straight back into the
  // wizard; everyone else sees the landing page first.
  if (user) {
    redirect("/onboarding")
  }

  return <LandingPage />
}
