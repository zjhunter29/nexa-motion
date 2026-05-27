# Nexa Motion

A premium, AI-powered running companion. Liquid-glass UI, cinematic motion design,
intelligent personalization — engineered to feel handcrafted.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 3** + custom liquid-glass design system
- **Framer Motion** for physics-based animation
- **Zustand** with `localStorage` persistence
- **Recharts** for analytics
- **Real AI Coach** — `/api/chat` route auto-detects Anthropic / OpenAI keys; falls back to curated responses when neither is set.
- **PWA-ready** with manifest + safe-area aware layouts
- **Netlify / Vercel / Cloudflare ready** — API routes run as serverless functions.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app works out of the box — no environment variables required.
Without an API key, the AI Coach uses high-quality curated responses.

### Enable real LLM responses

Copy the env file and set one (or both) API keys:

```bash
cp .env.example .env.local
# Edit .env.local:
#   ANTHROPIC_API_KEY=sk-ant-...   (preferred — Claude Opus 4.7)
#   OPENAI_API_KEY=sk-...           (fallback)
```

The `/api/chat` route auto-detects which provider to use, in this order:

1. **Anthropic** — Claude Opus 4.7 with adaptive thinking + prompt caching
2. **OpenAI** — `gpt-4o-mini` by default
3. **Curated mock** — runner-specific canned replies (no key required)

Each request returns `{ reply, source: "anthropic" | "openai" | "mock" }`
plus token usage when applicable, so you can see what's actually answering.

### On Netlify

Set `ANTHROPIC_API_KEY` (and/or `OPENAI_API_KEY`) under
**Site settings → Build & deploy → Environment → Environment variables**.
The `/api/chat` route runs as a Netlify Function automatically via the
[Next.js Runtime](https://docs.netlify.com/integrations/frameworks/next-js/overview/) — no config needed.

## Project structure

```
nexa-motion/
├── app/
│   ├── layout.tsx            # Root layout, ambient background, nav, onboarding gate
│   ├── page.tsx              # Activity (home)
│   ├── globals.css           # Liquid-glass primitives + utilities
│   ├── calendar/             # Month calendar + day detail
│   ├── coach/                # AI chat
│   ├── analytics/            # Charts & rings
│   ├── profile/              # Avatar, PRs, achievements
│   ├── settings/             # Preferences, units, reset
│   ├── onboarding/           # 6-step cinematic flow
│   └── api/chat/             # Anthropic / OpenAI / mock chat endpoint
├── components/
│   ├── ambient-background.tsx
│   ├── bottom-nav.tsx
│   ├── glass-card.tsx
│   ├── workout-card.tsx
│   ├── cancel-modal.tsx
│   ├── chat-interface.tsx
│   ├── calendar-view.tsx
│   ├── analytics-view.tsx
│   ├── profile-view.tsx
│   ├── settings-view.tsx
│   └── onboarding-flow.tsx
├── lib/
│   ├── store.ts              # Zustand (persisted)
│   ├── types.ts              # Domain types
│   ├── sample-data.ts        # Workouts, runs, achievements
│   ├── ai-mock.ts            # Curated coach replies
│   └── utils.ts
└── public/
    ├── icon.svg
    └── manifest.json
```

## Pages

| Route          | What it does |
| -------------- | ------------ |
| `/`            | Activity dashboard — today's workout, yesterday's run, weather, streak, AI motivation |
| `/calendar`    | Month grid with type-colored dots, day detail, scheduled & past runs |
| `/coach`       | AI running coach (chat). Strictly on-topic to running. |
| `/analytics`   | Pace, mileage, HR zones, cadence, recovery & consistency rings |
| `/profile`     | Avatar, fitness level, PRs, badges, weekly summary |
| `/settings`    | Name, units, notifications, restart onboarding, reset data |
| `/onboarding`  | 6-step cinematic personalization flow |

## Wiring up real auth / backend

The data layer is intentionally swap-friendly:

- **State** lives in `lib/store.ts` (Zustand + persist). Replace the
  `persist()` middleware with Firebase / Supabase calls, or layer
  TanStack Query on top of REST endpoints.
- **Auth** — add a provider in `app/layout.tsx`, then gate routes inside
  `components/onboarding-gate.tsx`.
- **Workouts** — `Workout` type in `lib/types.ts` is your contract.
  Point `useNexaStore` at remote data and the rest of the app keeps
  working unchanged.

## Build & deploy

```bash
npm run build
npm start            # production server on :3000
```

**Netlify** — zero-config. Connect the repo; the Next.js Runtime
detects the app and runs API routes as Netlify Functions. Set
`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` in the site env vars.

**Vercel** — `vercel --prod`. API routes run on Edge/Node automatically.

**Cloudflare Pages** — works via the Cloudflare Next.js adapter
(Node-compatible runtime; API routes become Workers).

**GitHub Pages / pure static hosts** — re-enable `output: "export"` in
`next.config.mjs` and remove `app/api/`. The chat will run entirely
client-side against the curated mock.

## Design system

All glass surfaces use the `glass-panel`, `glass-panel-strong`, or
`glass-pill` classes defined in `app/globals.css`. The premium feel comes
from layering:

1. Ambient gradient blobs (`components/ambient-background.tsx`)
2. Frosted-glass cards with hairline borders and inner highlights
3. Spring-physics motion via Framer Motion
4. Accent gradients (purple → blue → cyan) used sparingly
5. Soft outer glow on the active nav tab and primary CTAs

To extend, prefer composing existing tokens in `tailwind.config.ts` over
introducing new ones.
