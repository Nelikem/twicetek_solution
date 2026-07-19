export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_86%),transparent)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(color-mix(in_oklch,var(--foreground),transparent_94%)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black_30%,transparent_100%)]" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
