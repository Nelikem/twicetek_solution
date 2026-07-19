# Twicetek — Organization Onboarding

Enterprise multi-tenant business management platform. This repo currently contains
**Phase 1: Foundation** — the full Supabase schema/RLS/storage, minimal auth, and a
fully working Step 1 (Organization Information) of the eventual 6-step onboarding
wizard. Steps 2–6 are represented in the step config/indicator as locked, not yet
built. See `/Users/nelikemagbanu/.claude/plans/polished-mapping-hennessy.md` for the
full phase plan.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui (Base UI primitives) · React Hook Form · Zod · Framer Motion · TanStack
Query · Zustand · React Dropzone · Supabase (Postgres, Auth, RLS, Storage).

## Prerequisites

- Node.js 20+, pnpm
- A Supabase project (or the Supabase CLI + Docker for local development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed globally or via `pnpm exec supabase`

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the env template and fill in your Supabase project's credentials
   (Project Settings → API in the Supabase dashboard):

   ```bash
   cp .env.local.example .env.local
   ```

3. Apply the database schema. Either against a local Supabase instance:

   ```bash
   pnpm exec supabase start   # requires Docker
   pnpm exec supabase db reset
   ```

   or against your linked remote project:

   ```bash
   pnpm exec supabase link --project-ref <your-project-ref>
   pnpm exec supabase db push
   ```

4. (Optional) Regenerate `types/database.types.ts` from the live schema — it's
   currently hand-authored to match the migrations exactly, but should be
   regenerated once the project is linked:

   ```bash
   pnpm exec supabase gen types typescript --linked > types/database.types.ts
   ```

5. Run the dev server:

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to
   `/onboarding/register`, the first step of the wizard. Create an account, confirm
   the verification email (or disable email confirmation in your Supabase project's
   Auth settings for local testing), then sign in to land on `/onboarding/step-1`.

## Project structure

```
app/                  Routes (App Router): (auth)/login, onboarding/ (register + protected steps), auth/callback/
components/ui/        shadcn/ui primitives (Base UI-backed)
components/shared/     Cross-feature shared components (AutosaveIndicator, ...)
features/onboarding/  Onboarding-specific: components, schemas, hooks, store, config
services/              Supabase data-access layer (camelCase <-> snake_case mapping)
lib/supabase/          Browser/server/admin Supabase client factories
middleware/            Session refresh + route gating logic (imported by middleware.ts)
types/database.types.ts  Hand-authored to mirror the migrations; regenerate when linked
utils/                 Constants (industries, countries, currencies...) and image compression
supabase/migrations/   24 ordered SQL migrations: schema, RLS, storage, triggers
supabase/seed.sql      System roles + permission catalog
```

## Database design notes

- Every tenant-scoped table carries `organization_id` (and `business_id`/`branch_id`
  where applicable) directly, denormalized and kept consistent via triggers — RLS
  policies read scope straight off each row rather than joining up the hierarchy.
- `organizations.status` starts at `'draft'`. Step 1 autosaves directly into that
  draft row; RLS on `organizations` keys off `owner_user_id = auth.uid()` in addition
  to membership checks, since the owner has no `organization_members` row yet during
  onboarding. See `supabase/migrations/*_rls_policies_organizations.sql` for the
  full reasoning.
- `get_or_create_draft_organization()` (migration 24) is the idempotent RPC Step 1
  calls on mount — safe to call from multiple tabs.
- Organization logos are stored privately in the `organization-logos` bucket at
  `{organization_id}/logo-{timestamp}.{ext}` and served via short-lived signed URLs,
  never public URLs.

## What's not built yet

Steps 2–6 of the wizard (Businesses, Branches, Administrator, Subscription, Review +
transactional provisioning), Edge Functions, CI/CD, and the automated test suites are
future phases — see the plan doc for the full roadmap.
