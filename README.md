# Calorie Snap

Mobile-first PWA that logs your food's calories & macros automatically. Snap a
photo or describe a meal in the chat box; **Gemini 3.5 Flash (via OpenRouter)**
estimates calories + protein/carbs/fat and appends it to your daily log.

- 📸 **Capture** — full-screen live camera, tap the shutter to log.
- ✍️ **Manual** — chat box with a text description + photo upload.
- 🔵 **Rings** — calorie & protein activity rings, with carbs/fat bars.
- 🎯 **Goals** — TDEE-based targets (Mifflin-St Jeor) from your profile, with
  manual overrides. Workout time tags meals as pre / post-workout.
- 🍽️ **Auto-naming & meal type** — the AI names each meal and classifies it
  (breakfast / lunch / dinner / snack / pre-workout…) from the time of day.
- 📅 **History** — date picker to browse the log for any day.
- ✏️ **Edit / delete** any entry.
- 🔒 **Private** — email + password login (Convex Auth), restricted to an
  allowlisted email and enforced server-side, so the link alone exposes nothing.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind v4 + shadcn/ui (Base UI)
- **Convex** — reactive DB, file storage (meal photos), serverless actions
- **OpenRouter SDK** (`@openrouter/sdk`) → `google/gemini-3.5-flash`
  (vision + structured JSON output)

## Setup

```bash
pnpm install
```

### 1. OpenRouter key

The key is read **inside Convex actions** (`convex/ai.ts`), which run on the
Convex deployment — so it must be set on Convex, not just in `.env.local`:

```bash
npx convex env set OPENROUTER_API_KEY sk-or-v1-xxxxx   # https://openrouter.ai/keys
```

`.env.local` holds Convex's own vars (managed by the CLI) plus an
`OPENROUTER_API_KEY` placeholder for reference.

### 2. Auth allowlist

Login uses **Convex Auth** (password). `npx @convex-dev/auth` already set
`SITE_URL`, `JWT_PRIVATE_KEY`, and `JWKS`. Restrict who can sign up by setting an
email allowlist (enforced server-side in `convex/auth.ts`):

```bash
npx convex env set ALLOWED_EMAILS you@example.com   # comma-separated for more
```

On first launch, open the app and **Sign up** with that email to create your
account. Anyone else is rejected by the server.

### 3. Run (two processes)

```bash
npx convex dev    # backend: pushes functions, watches convex/
pnpm dev          # frontend: http://localhost:3000
```

The AI runs server-side in Convex, so `OPENROUTER_API_KEY` is never exposed to
the browser.

## Code map

- `convex/schema.ts` — `meals` + `settings` tables.
- `convex/ai.ts` — `analyzeImage` / `analyzeText` actions call OpenRouter, then
  write results via the internal `meals.insertMeal` mutation.
- `convex/meals.ts` — `generateUploadUrl`, `listMeals`, `updateMeal`, `deleteMeal`.
- `convex/settings.ts` — single-row profile/goals.
- `convex/auth.ts` — Convex Auth (Password) with email allowlist. All `meals` /
  `settings` functions require an authenticated user.
- `src/lib/targets.ts` — TDEE math + override resolution.
- `src/lib/meals.ts` — day grouping, totals, macro split helpers.
- `src/components/*` — rings, date nav (calendar), camera, manual entry, settings.

## PWA

Installable: web manifest + icons in `public/`, service worker (`public/sw.js`)
registered in production. Add to Home Screen on iOS/Android for a standalone app.
