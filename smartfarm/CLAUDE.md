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

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The browser client (`lib/supabase/client.ts`) accepts either key, but the server client (`lib/supabase/server.ts`) only checks `SUPABASE_SERVICE_ROLE_KEY` then `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The weather widget optionally uses `NEXT_PUBLIC_WEATHER_API_KEY` (OpenWeatherMap) and `NEXT_PUBLIC_WEATHER_LOCATION` (default "Buea").

## Architecture

**Everything is client-side.** Almost every page and component is `'use client'`. Supabase is called directly from the browser with the anon key, and the server Supabase client exists but is effectively unused. There is no `middleware.ts`/`proxy.ts` and no `app/api` routes. Note that `components/sms/SmsPanel.tsx` POSTs to a nonexistent `/api/sms`.

**Auth & routing:** `app/layout.tsx` wraps everything in `AuthProvider` (`components/providers/AuthProvider.tsx`, Supabase email/password auth, exposes `useAuth()`) and `RouteGuard` (`components/shared/RouteGuard.tsx`). RouteGuard sends unauthenticated users to `/login` and authenticated users away from public paths (`/`, `/landing`, `/login`, `/signup`) to `/dashboard`. If you add a new public page, update `PUBLIC_PATHS`. Login/signup are in the `app/(auth)/` route group.

**Data layer:** all database access goes through the single `dbService` object in `lib/services/db.ts`. Pages call `dbService.getX()/createX()/updateX()/deleteX()` inside `useEffect` and hold results in local state. There is no React Query or server actions. Key behaviors:
- **Multi-farm scoping:** the private `getFarmId()` resolves the current farm from `localStorage['active_farm_id']`, verifies membership against `farm_user_roles`, and otherwise falls back to the user's first farm. Every query filters by `farm_id`, and new inserts must set it.
- **Shape mapping:** `dbService` maps normalized DB rows into UI-friendly shapes. For example, `fields` rows become `{ title, crop, area: "N ha", status, moisture, image }`, matching `lib/types`. Keep that mapping when changing reads or writes.
- Helpers lazily create lookup rows (default financial account, livestock types) and resolve `task_statuses` by name.
- Errors are logged and swallowed, so methods return `[]`/`null`/`false` instead of throwing.

**Farm membership & roles:** `lib/hooks/useFarm.ts` loads the farm profile, team, and `currentUserRole` (`owner`/`manager`/`worker` from `farm_user_roles`). `components/layout/DashboardLayout.tsx` is the authenticated shell (sidebar, plus `MobileBottomNav` on mobile). It shows `OnboardingView` (create or join a farm by farm ID) when the user has no farm, and hides Finance/Reports from workers. Feature pages wrap their content in `DashboardLayout`.

**Database schema:** `db.sql` in `smartfarm/` is the full Postgres schema (farm, farm_user_roles, user_profile, fields, crop_*, livestock_*, inventory_*, financial_*, tasks/task_assignments/task_statuses, activities, sensors, ai_jobs, …). There are no migrations. `supabase/fix_rls_policies.sql` **disables RLS** on the main tables for demo purposes, so don't rely on RLS for authorization.

**UI conventions:** imports mostly use relative paths (e.g. `../../lib/services/db`), though the `@/*` alias maps to the app root. shadcn primitives live in `components/ui/`, and feature components live in `components/<feature>/` (typically `XCard` + `AddEditXDialog`). Styling uses Tailwind utility classes with a dark slate/emerald palette.

**Partially built features:** `weather`, `market`, `communication`, and `users` pages exist but are not linked in the sidebar nav (`sidebarLinks` in `DashboardLayout`).
