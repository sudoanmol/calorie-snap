# Calorie Snap

Mobile-first PWA that logs your food's calories & macros automatically. Snap a
photo or describe a meal in the chat box; **Gemini 3.5 Flash (via Vercel AI
Gateway)** estimates calories + protein/carbs/fat and appends it to your daily
log.

- 📸 **Capture** — full-screen live camera, tap the shutter to log.
- ✍️ **Manual** — chat box with a text description + photo upload.
- 🔵 **Rings** — calorie & protein activity rings, with carbs/fat bars.
- 🎯 **Goals** — TDEE-based targets (Mifflin-St Jeor) from your profile, with
  manual overrides. Workout time tags meals as pre / post-workout.
- 🍽️ **Auto-naming & meal type** — the AI names each meal and classifies it
  (breakfast / lunch / dinner / snack / pre-workout…) from the time of day.
- 📅 **History** — date picker to browse the log for any day.
- ✏️ **Edit / delete** any entry.
- 🔒 **Private** — a password prompt (`APP_PASSWORD` in `.env.local`) gates the
  app. The cookie lasts 30 days; Lock on the dashboard clears it.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind v4 + shadcn/ui (Base UI)
- **Convex** — reactive DB, file storage (meal photos), serverless actions
- **Vercel AI SDK** + AI Gateway → `google/gemini-3.5-flash`
  (vision + structured JSON) and `google/gemini-3.1-flash-image-preview`
  for chat-meal thumbnails

## Setup

```bash
pnpm install
```

### 1. AI Gateway key

The key is read **inside Convex actions** (`convex/ai.ts`), which run on the
Convex deployment — set it there, not only in `.env.local`:

```bash
npx convex env set AI_GATEWAY_API_KEY <key>   # Vercel dashboard → AI Gateway
```

### 2. App password

Set the gate password in `.env.local` (Next.js reads it on the server only):

```bash
APP_PASSWORD=your-password
```

The unlock screen compares what you type to this value. Wrong password stays
locked. A signed httpOnly cookie keeps you in for 30 days.

This is a UI gate. Convex functions are no longer behind an account, so anyone
who has the Convex URL can still call them.

### 3. Run

```bash
pnpm dev          # Next + Convex together. App: http://localhost:3000
```

`pnpm dev:next` and `pnpm dev:convex` still start each process on its own.

The AI runs server-side in Convex, so `AI_GATEWAY_API_KEY` is never exposed to
the browser.

## Code map

- `convex/schema.ts` — `meals` + `settings` tables.
- `convex/ai.ts` — `analyzeImage` / `analyzeText` actions call the Vercel AI
  Gateway, then write results via the internal `meals.insertMeal` mutation.
- `convex/meals.ts` — `generateUploadUrl`, `listMeals`, `updateMeal`, `deleteMeal`.
- `convex/settings.ts` — single-row profile/goals.
- `src/lib/app-gate.ts` — password compare + signed unlock cookie.
- `src/lib/targets.ts` — TDEE math + override resolution.
- `src/lib/meals.ts` — day grouping, totals, macro split helpers.
- `src/components/*` — rings, date nav (calendar), camera, manual entry, settings.

## PWA

Installable: web manifest + icons in `public/`, service worker (`public/sw.js`)
registered in production. Add to Home Screen on iOS/Android for a standalone app.
