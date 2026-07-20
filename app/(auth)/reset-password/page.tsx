"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { motion } from "framer-motion"
import { Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { PasswordReusedError, useResetPasswordMutation } from "@/features/auth/hooks/useResetPasswordMutation"
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas/security.schema"
import { getPasswordStrength } from "@/features/auth/utils/password-strength"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [linkValid, setLinkValid] = useState<boolean | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const resetPassword = useResetPasswordMutation()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setLinkValid(!!user))
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const password = useWatch({ control, name: "password" }) ?? ""
  const strength = getPasswordStrength(password)

  async function onSubmit(values: ResetPasswordValues) {
    setServerError(null)
    try {
      await resetPassword.mutateAsync(values.password)
      router.push("/login?reset=success")
    } catch (error) {
      if (error instanceof PasswordReusedError) {
        setError("password", { message: error.message })
        return
      }
      setServerError(error instanceof Error ? error.message : "Couldn't reset your password")
    }
  }

  if (linkValid === null) {
    return null
  }

  if (!linkValid) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-border/60 shadow-lg shadow-black/[0.03]">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">This link has expired</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              Password reset links only work once and expire after a short time. Request a new one to
              continue.
            </p>
            <Button render={<Link href="/forgot-password" />} nativeButton={false} className="mt-2">
              Request a new link
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
            <ShieldCheck className="size-4.5" />
          </div>
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>Choose a strong password you haven&apos;t used before.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.password}>
                <FieldContent>
                  <FieldLabel htmlFor="password">New password</FieldLabel>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {password && (
                    <div className="space-y-1">
                      <Progress
                        value={strength.percent}
                        className="[&_[data-slot=progress-track]]:h-1.5"
                      />
                      <p className="text-xs text-muted-foreground">{strength.label}</p>
                    </div>
                  )}
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldContent>
                  <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </FieldContent>
              </Field>

              {serverError && (
                <p role="alert" className="text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Reset password
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
