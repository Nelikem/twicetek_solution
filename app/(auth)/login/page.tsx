"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})

type LoginValues = z.infer<typeof loginSchema>

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(values)

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      )
      return
    }

    router.push(next)
    router.refresh()
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </Field>

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
