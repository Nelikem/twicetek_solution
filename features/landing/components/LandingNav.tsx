import Link from "next/link"
import { Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
      <div className="flex items-center gap-2.5">
        <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <div aria-hidden className="absolute inset-0 rounded-lg bg-primary opacity-60 blur-md" />
          <Building2 className="relative size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Twicetek</span>
      </div>
      <nav className="flex items-center gap-2">
        <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
          Sign in
        </Button>
        <Button render={<Link href="/onboarding/register" />} nativeButton={false} size="sm">
          Get started
        </Button>
      </nav>
    </header>
  )
}
