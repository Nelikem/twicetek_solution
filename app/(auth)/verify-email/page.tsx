"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation"

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS)
  const resend = useResendVerificationMutation()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((value) => value - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  async function handleResend() {
    if (!email) return
    try {
      await resend.mutateAsync(email)
      setCountdown(RESEND_COOLDOWN_SECONDS)
      toast.success("Verification email sent")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't resend the email")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/60 shadow-lg shadow-black/[0.03]">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="relative flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <div aria-hidden className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
            <MailCheck className="relative size-6" />
          </motion.div>
          <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {email ? (
              <>
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account.
              </>
            ) : (
              "We sent you a verification link. Click it to activate your account."
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-2"
            disabled={countdown > 0 || resend.isPending || !email}
            onClick={handleResend}
          >
            {resend.isPending && <Loader2 className="size-4 animate-spin" />}
            {countdown > 0 ? `Resend email in ${countdown}s` : "Resend email"}
          </Button>

          <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
