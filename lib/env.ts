function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.local.example to .env.local and fill in your Supabase project credentials.`
    )
  }
  return value
}

// Each NEXT_PUBLIC_* var is accessed as a literal `process.env.X` member
// expression (not a computed process.env[name] lookup) because Next.js inlines
// these at build time via static text replacement in the client bundle — a
// dynamic key is invisible to that replacement and silently resolves to
// `undefined` in the browser, even though the value is correctly set.
export const env = {
  supabaseUrl: () => required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () =>
    required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () =>
    required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
}
