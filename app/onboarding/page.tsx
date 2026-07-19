import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function OnboardingIndexPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? "/onboarding/step-1" : "/onboarding/register")
}
