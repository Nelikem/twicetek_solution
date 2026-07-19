import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/lib/env"

const AUTH_ROUTES = ["/login", "/onboarding/register"]
// /onboarding itself branches on auth state in its own page component, and
// /onboarding/register is the pre-auth registration step — neither belongs here.
const PROTECTED_EXACT_EXCLUSIONS = ["/onboarding", "/onboarding/register"]
const PROTECTED_PREFIXES = ["/onboarding"]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Required: revalidates the session token on every request. Do not remove or
  // move this call — Supabase SSR relies on it to refresh expiring auth cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected =
    !PROTECTED_EXACT_EXCLUSIONS.includes(pathname) &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/onboarding"
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
