"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation"
import { loginSchema, type LoginValues } from "@/features/auth/schemas/security.schema"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Defaults straight to step-1 rather than the /onboarding redirector page: right
  // after signInWithPassword, an extra server-redirect hop through /onboarding can
  // race the session cookie during a client-side router.push, sometimes stalling on
  // the intermediate route. Going directly to the real destination avoids that hop.
  const next = searchParams.get("next") ?? "/onboarding/step-1"
  const [serverError, setServerError] = useState<string | null>(null)
  const login = useLoginMutation()

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toast.success("Password reset — sign in with your new password.")
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    try {
      await login.mutateAsync(values)
      router.push(next)
      router.refresh()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't sign in")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/60 shadow-lg shadow-black/[0.03]">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Continue setting up your organization.</CardDescription>
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

              <Field data-invalid={!!errors.password}>
                <FieldContent>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </Field>

              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FieldLabel className="w-fit items-center gap-2">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <span className="text-sm font-normal">Remember me</span>
                  </FieldLabel>
                )}
              />

              {serverError && (
                <p role="alert" className="text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
