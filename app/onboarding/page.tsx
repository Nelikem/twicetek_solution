import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOrganizationByOwner } from "@/services/organizations.service"

export default async function OnboardingIndexPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/onboarding/register")
  }

  // An authenticated visitor here has either never started onboarding, has an
  // in-progress draft, or already completed it -- only the org's own status says
  // which. Without this check, an already-onboarded user landing here (e.g.
  // middleware bouncing them off /login) would be sent straight back into the
  // wizard instead of the post-onboarding workspace selector.
  const org = await getOrganizationByOwner(supabase, user.id)
  redirect(org?.status === "active" ? "/welcome" : "/onboarding/step-1")
}
