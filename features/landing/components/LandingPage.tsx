import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MeshGradientBackground } from "@/components/shared/MeshGradientBackground"
import { FeatureGrid } from "@/features/landing/components/FeatureGrid"
import { HierarchyShowcase } from "@/features/landing/components/HierarchyShowcase"
import { LandingHero } from "@/features/landing/components/LandingHero"
import { LandingNav } from "@/features/landing/components/LandingNav"

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <MeshGradientBackground />

      <div className="flex min-h-svh flex-col">
        <LandingNav />

        <main className="flex-1">
          <LandingHero />

          <section className="pb-20 lg:pb-28">
            <HierarchyShowcase />
          </section>

          <section className="pb-24 lg:pb-32">
            <div className="mx-auto mb-10 max-w-2xl px-6 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for how enterprises actually work
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Every module in the platform is scoped to this same hierarchy, from day one.
              </p>
            </div>
            <FeatureGrid />
          </section>

          <section className="pb-24 lg:pb-32">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card/60 px-8 py-12 text-center shadow-xl shadow-black/[0.03] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to set up your organization?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                Create your account and start the guided setup — you can pick up where you left off
                any time.
              </p>
              <Button render={<Link href="/onboarding/register" />} nativeButton={false} size="lg" className="gap-1.5">
                Start onboarding
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        </main>

        <footer className="border-t border-border/60 px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Twicetek. Built for enterprise multi-tenant operations.
        </footer>
      </div>
    </div>
  )
}
