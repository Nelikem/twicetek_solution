// Plain constant, kept out of actions.ts -- a "use server" file may only export
// async functions, so the cookie name needs its own module to be shared with
// dashboard/page.tsx (which reads it) without violating that rule.
export const WORKSPACE_COOKIE = "twicetek:workspace"
