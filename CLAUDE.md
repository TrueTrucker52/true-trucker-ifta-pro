# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server on http://localhost:8080
npm run build      # Production build (drops console/debugger)
npm run build:dev  # Dev-mode build (keeps logs)
npm run lint       # ESLint check
npm run preview    # Preview production build
```

There is no test framework configured. Validation is done via TypeScript (`tsc`) and ESLint.

## Architecture

### Stack

- **React 18 + TypeScript** — Vite/SWC bundler, `@` aliased to `./src`
- **Supabase** — PostgreSQL database, Auth, Realtime, Storage, and 15 Deno Edge Functions
- **shadcn/ui + Radix UI + Tailwind CSS** — component and styling layer
- **TanStack React Query** — server state with 5-min stale time, 1 retry, no refetch-on-focus
- **React Router v6** — all routes declared in `src/App.tsx`, all pages lazy-loaded
- **Capacitor** — iOS/Android shell wrapping the web build

### Auth & Roles

`src/contexts/AuthContext.tsx` is the single source of truth for auth state. It exposes `user`, `session`, `profile`, and `profileLoading`. The `profile` object comes from the `profiles` table (`user_id` FK, not `id`).

Three roles exist: `driver`, `fleet_owner`, `admin`. Role-gated routes use `RoleProtectedRoute`; all other auth-required routes use `ProtectedRoute`.

### Data Layer

The Supabase client is a singleton at `src/integrations/supabase/client.ts`. Generated TypeScript types live in `src/integrations/supabase/types.ts` — regenerate with `supabase gen types typescript`.

All React Query data fetching happens inside page/component files (no centralized query layer). Mutations call Supabase directly or invoke Edge Functions via `supabase.functions.invoke(...)`.

### Edge Functions (`supabase/functions/`)

| Function | Purpose |
|---|---|
| `trucker-ai-chat` | AI assistant (HuggingFace) |
| `enhance-receipt-data` | OCR post-processing (Tesseract) |
| `create-checkout` / `customer-portal` / `check-subscription` | Stripe billing |
| `create-invoice` / `get-invoices` | Invoice management |
| `send-welcome-email` / `send-trial-reminders` | Resend email |
| `text-to-speech` | Voice output |
| `process-referral` | Referral tracking |
| `sync-eld-checkout` | ELD data sync |
| `delete-account` | Account deletion |
| `calculate-distance` | Mapbox distance |
| `get-test-credentials` | Dev/test helper |

Edge Functions are Deno/TypeScript. They run independently of the frontend build.

### IFTA Calculation Engine

`src/lib/iftaCalculations.ts` contains 2024 per-gallon tax rates for all 48 IFTA member states plus Kentucky Weight Distance Tax (KYU). The core formula: allocate total fleet MPG across states by miles driven, compute tax owed per state, subtract pre-paid fuel tax from purchases to get `netTax`. Rates must be updated annually.

### Global Overlays

Five components render outside the route tree (mounted unconditionally in `App.tsx`):
- `TrialConversionBanner` / `TrialExpiryWall` — subscription trial gating
- `PWAInstallPrompt` — browser install prompt
- `TruckerAIAssistant` — floating AI chat
- `VoiceCommandSystem` — voice input

These are controlled by hooks (`useSubscription`, `useVoiceCommands`, etc.) and appear on top of any page.

### Key Custom Hooks

| Hook | Purpose |
|---|---|
| `useAutoTracking` | GPS geofencing + automatic trip detection |
| `useHOSEngine` | Hours of Service compliance (ELD) |
| `useSubscription` | Trial state, subscription tier, expiry |
| `useOfflineSync` | Queues mutations when offline, flushes on reconnect |

### Build Chunking

Vite splits bundles into named chunks: `vendor`, `router`, `query`, `ui`, `charts`, `supabase`, `motion`. Keep heavy imports (Mapbox, Tesseract, HuggingFace) out of the main chunk.

### Path Alias

Use `@/` for all internal imports (resolves to `./src/`). Never use relative `../../` paths across feature boundaries.
