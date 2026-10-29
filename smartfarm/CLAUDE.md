# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

SmartFarm is a farm management app for farmers in Cameroon/Africa (University of Buea CS project): crops/fields, livestock, inventory, finance, tasks, reports, team roles. Stack: Next.js 16 (App Router) + React 19, TypeScript, Tailwind v4, shadcn/ui (`radix-nova` style), framer-motion, recharts, Supabase (Postgres + Auth).

The git repo root is the parent directory (`smart_farm/`); the Next.js app lives in `smart_farm/smartfarm/`. The root `README.md` describes an aspirational `src/`/`features/`/`supabase/migrations` layout that does **not** match the actual code. Use the structure below instead.

## Commands

Run from `smartfarm/`:

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build (also type-checks)
npm run start    # serve the production build
npm run lint     # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit # type-check only
```

There is no test framework configured.

## Environment

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; both Supabase clients accept either key. The other settings are optional and server-only: `OPENWEATHER_API_KEY` (without it, Weather shows sample data) and `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` (without them, SMS is disabled). `.env.example` lists them all.

## Architecture

**Mostly client-side.** Almost every page and component is `'use client'`, and Supabase is called directly from the browser with the anon key. There is no `middleware.ts`/`proxy.ts`. The only server code is the two route handlers that need secrets: `app/api/weather` (OpenWeatherMap proxy; logic is in `lib/weather/`) and `app/api/sms` (Twilio, via `lib/sms.ts`). They use `lib/supabase/server.ts`, which acts as the signed-in user through the session cookie, so RLS applies. Never switch it to the service role key.

**Auth & routing:** `app/layout.tsx` wraps everything in `AuthProvider` (`components/providers/AuthProvider.tsx`, Supabase email/password auth, exposes `useAuth()`) and `RouteGuard` (`components/shared/RouteGuard.tsx`). RouteGuard sends unauthenticated users to `/login` and authenticated users away from public paths (`/`, `/landing`, `/login`, `/signup`) to `/dashboard`. If you add a new public page, update `PUBLIC_PATHS`. Login/signup are in the `app/(auth)/` route group.

**Data layer:** all database access goes through the single `dbService` object in `lib/services/db.ts`. Pages call `dbService.getX()/createX()/updateX()/deleteX()` inside `useEffect` and hold results in local state. There is no React Query or server actions. Key behaviors:
- **Multi-farm scoping:** the private `getFarmId()` resolves the current farm from `localStorage['active_farm_id']`, verifies membership against `farm_user_roles`, and otherwise falls back to the user's first farm. Every query filters by `farm_id`, and new inserts must set it.
- **Shape mapping:** `dbService` maps normalized DB rows into UI-friendly shapes. For example, `fields` rows become `{ title, crop, area: "N ha", status, moisture, image }`, matching `lib/types`. Keep that mapping when changing reads or writes.
- Helpers lazily create lookup rows (default financial account, livestock types) and resolve `task_statuses` by name.
- Errors are logged and swallowed, so methods return `[]`/`null`/`false` instead of throwing.

**Farm membership & roles:** `lib/hooks/useFarm.ts` loads the farm profile, team, and `currentUserRole` (`owner`/`manager`/`worker` from `farm_user_roles`). `components/layout/DashboardLayout.tsx` is the authenticated shell (sidebar, plus `MobileBottomNav` on mobile). It shows `OnboardingView` (create a farm, or join one with an invite code) when the user has no farm. Navigation for both the sidebar and the mobile bar comes from `components/layout/navLinks.ts`; links with `workerAllowed: false` are hidden from workers. Feature pages wrap their content in `DashboardLayout`. Newer pages (weather, market, communication, users) also use `PagePanel` / `StatTile` / `EmptyState` from `components/shared/PagePanel.tsx`.

**Database schema:** `db.sql` in `smartfarm/` is the full Postgres schema (farm, farm_user_roles, user_profile, fields, crop_*, livestock_*, inventory_*, financial_*, tasks/task_assignments/task_statuses, activities, sensors, ai_jobs, …). There are no migrations. Tables added later (invite codes, `user_profile.email`, `market_prices`, `farm_messages`) are in `supabase/schema_additions.sql`, which runs before the RLS script. Access control lives in `supabase/enable_rls_policies.sql`, which is run by hand in the Supabase SQL editor. Under its rules, farm members can read their farm's data and create or update it. Only owners and managers can delete records, manage the team, or use the finance and report tables. Farms are created and joined only through the `create_farm` and `join_farm(code)` RPCs. Invite codes go through `get_join_code` / `regenerate_join_code`; the farm ID is never a join code. A trigger keeps at least one owner per farm. Deployment steps are in `DEPLOYMENT.md`. Any new table with a `farm_id` must be added to one of that script's table lists. `supabase/fix_rls_policies.sql` is a demo-only script that disables RLS.

**UI conventions:** imports mostly use relative paths (e.g. `../../lib/services/db`), though the `@/*` alias maps to the app root. shadcn primitives live in `components/ui/`, and feature components live in `components/<feature>/` (typically `XCard` + `AddEditXDialog`). Styling uses Tailwind utility classes with a dark slate/emerald palette.

**Lint rules:** `eslint-config-next` 16 enables React Compiler rules. Don't call `setState` synchronously in an effect body (set state from async callbacks, or derive the value). Don't choose a component during render (`const Icon = map[x]; <Icon/>`); use a small switch component instead. Don't call `Date.now()` during render. Pre-existing pages still break some of these rules.
