# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```

There is no test runner configured — ESLint is the only static analysis tool.

## Architecture

TrueTrucker IFTA Pro is a React + TypeScript SPA targeting truck drivers and fleet managers. It handles IFTA (International Fuel Tax Agreement) compliance, mileage tracking, ELD support, fleet GPS, and subscription billing. The app is also packaged as an iOS/Android app via Capacitor.

### Frontend

- **React 18 + TypeScript** built with Vite 5 (SWC plugin). Path alias `@/*` maps to `src/*`.
- **Routing**: React Router DOM 6, with lazy-loaded pages. Access control via `ProtectedRoute` and `RoleProtectedRoute` wrappers (roles: `driver`, `fleet_owner`, `admin`).
- **State**: `AuthContext` (`src/contexts/`) handles auth and user profile. TanStack React Query manages server state (5 min stale, 10 min GC). No Redux or Zustand.
- **UI**: shadcn-ui (Radix UI primitives) + Tailwind CSS 3. Icons via Lucide React. Animations via Framer Motion.
- **Forms**: React Hook Form + Zod.
- **Charts/Mapping**: Recharts for data viz, Mapbox GL for fleet tracking, Three.js/React Three Fiber for 3D.
- **OCR/PDF**: Tesseract.js (receipt scanning), html2canvas + jsPDF (PDF export).
- **PWA**: Service worker registered at startup; `manifest.json` present.

### Backend

- **Supabase** (PostgreSQL + auth + real-time subscriptions). Client and auto-generated TypeScript types live in `src/integrations/supabase/`.
- **Edge Functions** (16 total, Deno runtime) in `supabase/functions/`:
  - Auth: `send-welcome-email`, `reset-password`
  - Subscriptions: `create-checkout`, `check-subscription`, `customer-portal`
  - AI: `trucker-ai-chat`
  - Billing: `create-invoice`, `get-invoices`
  - Operations: `calculate-distance`, `sync-eld-checkout`, `enhance-receipt-data`, `text-to-speech`
- **Migrations**: `supabase/migrations/`

### Key Business Logic (`src/lib/`)

- `iftaCalculations.ts` — Core IFTA tax engine: per-state 2024 fuel tax rates, Kentucky Weight Distance Tax (KYU), jurisdiction-level reporting.
- `eldUpgrade.ts` — ELD feature gate and upgrade flows.
- `securityMonitoring.ts` — Rate limiting, auth failure logging.
- `dataMasking.ts` — PII masking utilities.
- `errorHandling.ts` — Centralized error management.

### Custom Hooks (`src/hooks/`)

Notable hooks: `useAutoTracking` (geolocation-based mileage), `useSubscription` (Stripe subscription state), `useOfflineSync` (offline queue), plus feature-specific hooks for ELD, fleet, voice commands.

### Code Splitting

Vite is configured to split vendor bundles into named chunks: `vendor`, `router`, `query`, `ui`, `charts`, `supabase`, `motion`. This is intentional — don't consolidate these chunks.

## Environment Variables

Required in `.env` (see `.env.example`):

```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_RECAPTCHA_SITE_KEY
```

## Mobile (Capacitor)

`capacitor.config.ts` targets `dist/` as the web dir. App ID: `app.lovable.ea23f26e83f64710a8b545fb030d3016`. Build with `npm run build` before syncing to native platforms.

## TypeScript

Config is intentionally lenient: `noImplicitAny: false`, `noUnusedLocals: false`. Don't tighten these without a broader refactor plan.

## Supabase Types

When the database schema changes, regenerate types with the Supabase CLI and update `src/integrations/supabase/types.ts`. Do not hand-edit that file.
