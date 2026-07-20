import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/lib/env"

const AUTH_ROUTES = ["/login", "/onboarding/register", "/forgot-password", "/verify-email"]
// /onboarding itself branches on auth state in its own page component, and
// /onboarding/register is the pre-auth registration step — neither belongs here.
const PROTECTED_EXACT_EXCLUSIONS = ["/onboarding", "/onboarding/register"]
const PROTECTED_PREFIXES = ["/onboarding", "/dashboard", "/welcome"]
// /reset-password is intentionally in neither list above: Supabase's password-
// recovery link flow (/auth/callback -> exchangeCodeForSession) signs the user
// into a normal authenticated session before they ever reach this page, so
// AUTH_ROUTES's redirect-signed-in-users-away rule would bounce them before they
// can set a new password. It's also not gated by PROTECTED_PREFIXES so an
// expired-recovery-cookie visitor sees the page's own "link expired" state
// instead of a bare /login redirect.

const REMEMBER_COOKIE = "tk-remember"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // "Remember me": @supabase/ssr always writes its own cookies with a hardcoded
  // 400-day maxAge (confirmed in lib/supabase/client.ts's comment), including the
  // silent background token-refresh writes that happen on every navigation here
  // in middleware -- a login-time-only fix would miss those. This first-party
  // marker cookie (not managed by the Supabase library, so unaffected by that
  // bug) records the user's choice; when explicitly "0", every Supabase cookie
  // this middleware writes on this response gets maxAge/expires stripped, turning
  // it into a real session-only cookie. Missing marker (e.g. pre-feature
  // sessions) is treated as the default/remembered case.
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== "0"

  const supabase = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          const finalOptions = remember ? options : { ...options, maxAge: undefined, expires: undefined }
          response.cookies.set(name, value, finalOptions)
        })
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
