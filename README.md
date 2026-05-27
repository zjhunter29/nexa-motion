# Nexa Motion

A premium, AI-powered running companion. Liquid-glass UI, cinematic motion design,
intelligent personalization — engineered to feel handcrafted.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 3** + custom liquid-glass design system
- **Framer Motion** for physics-based animation
- **Zustand** with `localStorage` persistence
- **Recharts** for analytics
- **OpenAI** for the AI Coach (with a high-quality mock fallback)
- **PWA-ready** with manifest + safe-area aware layouts

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app works out of the box — no environment variables required.

### Optional: enable real AI responses

Copy the env file and add your OpenAI key:

```bash
cp .env.example .env.local
# then edit .env.local and set OPENAI_API_KEY=sk-...
```

Without a key, the AI Coach uses curated mock responses so you can demo,
record, or develop offline.

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
│   └── api/chat/             # OpenAI-or-mock chat endpoint
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
npm start            # production server
# or deploy with `vercel --prod` (zero-config)
```

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
