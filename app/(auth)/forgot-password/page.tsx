"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion, useReducedMotion } from "framer-motion"
import { KeyRound, Loader2, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas/security.schema"

export default function ForgotPasswordPage() {
  const prefersReducedMotion = useReducedMotion()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const forgotPassword = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(values: ForgotPasswordValues) {
    await forgotPassword.mutateAsync(values.email)
    setSubmittedEmail(values.email)
  }

  if (submittedEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-border/60 shadow-lg shadow-black/[0.03]">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <motion.div
              initial={prefersReducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="relative flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <div aria-hidden className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
              <MailCheck className="relative size-6" />
            </motion.div>
            <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              If an account exists for {submittedEmail}, we sent a link to reset your password.
            </p>
            <Button render={<Link href="/login" />} nativeButton={false} variant="outline" className="mt-2">
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/60 shadow-lg shadow-black/[0.03]">
        <CardHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-4.5" />
          </div>
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldContent>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <FieldError errors={[errors.email]} />
                </FieldContent>
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Send reset link
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
