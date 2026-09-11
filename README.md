# Calorie Snap

Mobile-first PWA that logs calories and macros from a photo or a short
description. Gemini 3.8 Flash (via the Vercel AI Gateway) names the meal,
picks a type, and estimates calories / protein / carbs / fat.

## What it does

- **Capture** — full-screen camera. Optional note rides with the photo.
- **Manual** — type a description, attach a photo, or both. A photo is
  uploaded only when you tap Log meal, not when you pick the file. If both
  are present, the model gets both (photo first, note for portions and
  hidden ingredients).
- **Rings** — calories left and protein, plus carb and fat bars.
- **Goals** — TDEE from your profile (Mifflin-St Jeor), with optional
  overrides. Workout time tags meals as pre / post-workout.
- **History** — date picker for any day.
- **Edit / delete** any entry.
- **Lock** — `APP_PASSWORD` in `.env.local`. Match it to enter. A signed
  httpOnly cookie lasts 30 days. Lock on the dashboard clears it.

This is a single shared log. No accounts.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind v4, shadcn/ui
- Convex — DB, meal photo storage, Node 22 actions
- Vercel AI SDK + AI Gateway
  - `google/gemini-3.8-flash` — vision + structured JSON
  - `google/gemini-3.1-flash-lite-image` — thumbnails for text-only logs

## Setup

```bash
pnpm install
```

### 1. Convex

`pnpm dev` starts `convex dev` for you. It writes `NEXT_PUBLIC_CONVEX_URL`  
(and a local site URL) into `.env.local`. For a local backend that is  
usually `http://127.0.0.1:3210`.

### 2. AI Gateway key

Actions read this on Convex, not in the browser:

```bash
npx convex env set AI_GATEWAY_API_KEY <key>
```

Get a key from the Vercel dashboard under AI Gateway.

### 3. App password

In `.env.local` (Next.js only, never `NEXT_PUBLIC_`):

```bash
APP_PASSWORD=your-password
```

Wrong password stays on the lock screen. This gates the UI. Anyone who has
the Convex URL can still call the backend.

### 4. Run

```bash
pnpm dev
```

App: [http://localhost:3000](http://localhost:3000)

`pnpm dev:next` and `pnpm dev:convex` start each process alone.

## Code map

- `convex/schema.ts` — `meals` + `settings` (one settings row).
- `convex/ai.ts` — `analyzeImage` / `analyzeText` via the AI Gateway, then
  `meals.insertMeal`. Optional `userNote` on photo analysis.
- `convex/meals.ts` — upload URL, list, update, delete.
- `convex/settings.ts` — profile and targets.
- `src/lib/app-gate.ts` — password compare + unlock cookie.
- `src/lib/targets.ts` — TDEE math and overrides.
- `src/lib/meals.ts` — day grouping and totals.
- `src/app/api/unlock` / `lock` — set and clear the cookie.
- `src/components/*` — rings, date nav, camera, manual entry, settings.

## PWA

Manifest and icons in `public/`. `public/sw.js` registers in production.
Add to Home Screen on iOS or Android for a standalone app.
