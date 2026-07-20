import { SessionsList } from "@/app/dashboard/security/sessions/SessionsList"

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Active sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">Devices currently signed in to your account.</p>
      <div className="mt-8">
        <SessionsList />
      </div>
    </div>
  )
}
