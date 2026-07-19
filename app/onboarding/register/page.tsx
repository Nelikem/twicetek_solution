"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, useReducedMotion } from "framer-motion"
import { Loader2, MailCheck, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { createClient } from "@/lib/supabase/client"

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function OnboardingRegisterPage() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterValues) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return (
      <StepTransition stepKey="register-submitted">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
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
            We sent a verification link to confirm your email. Once confirmed, sign in to continue
            setting up your organization.
          </p>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            className="mt-2"
          >
            Back to sign in
          </Button>
        </div>
      </StepTransition>
    )
  }

  return (
    <StepTransition stepKey="register">
      <motion.div
        className="space-y-8"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainerVariants}
      >
        <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="size-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This account becomes the owner of your organization — you&apos;ll set up its details
              next.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <motion.div variants={staggerItemVariants}>
              <Field data-invalid={!!errors.fullName}>
                <FieldContent>
                  <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    {...register("fullName")}
                  />
                  <FieldError errors={[errors.fullName]} />
                </FieldContent>
              </Field>
            </motion.div>

            <motion.div variants={staggerItemVariants}>
              <Field data-invalid={!!errors.email}>
                <FieldContent>
                  <FieldLabel htmlFor="email">Work email</FieldLabel>
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
            </motion.div>

            <motion.div variants={staggerItemVariants} className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.password}>
                <FieldContent>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <FieldError errors={[errors.password]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldContent>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </FieldContent>
              </Field>
            </motion.div>

            {serverError && (
              <motion.p
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="text-sm text-destructive"
              >
                {serverError}
              </motion.p>
            )}

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-between border-t border-border/60 pt-6"
            >
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Create account
              </Button>
            </motion.div>
          </FieldGroup>
        </form>
      </motion.div>
    </StepTransition>
  )
}
