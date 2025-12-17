# Beacon OS

A premium founder cockpit web application designed for ambitious entrepreneurs. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Modules
- **Dashboard**: Next Action card, runway snapshot, KPI tiles, streaks, quick-journal
- **Vision Board**: Draggable cards with custom images, motivational visualization
- **Roadmap**: Timeline with swimlanes (Funding, Product, Evidence/Trials, Team, Regulatory, Commercial)
- **Journaling**: Daily entries with prompts + Decision Log
- **Games**: Memory game + Japanese learning with spaced repetition (SRS)

### Elite Features
- **Command Palette** (⌘K): Jump to pages, create tasks, quick journal, start focus sprints
- **Focus Sprints**: Pomodoro timer with ambient mode for different work types
- **Runway Simulator**: Cash flow projections with scenario modeling
- **Investor CRM**: Contact management with stage tracking (SEIS/EIS/Series A)
- **Next Action Engine**: AI-powered task recommendation based on priorities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase
- **UI Components**: Radix UI + custom components
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Form Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd beacon-os
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your keys
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` for demo data

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/beacon-os)

### Option 2: Manual Deploy

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
beacon-os/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── vision/            # Vision board components
│   │   ├── roadmap/           # Roadmap components
│   │   ├── journal/           # Journal components
│   │   ├── games/             # Game components
│   │   ├── focus/             # Focus sprint components
│   │   └── crm/               # CRM components
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase/          # Supabase client config
│   │   ├── next-action-engine.ts
│   │   ├── srs-algorithm.ts
│   │   └── utils.ts
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── stores/                # Zustand stores
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Seed data
├── public/                    # Static assets
└── ...config files
```

## Database Schema

### Core Tables
- `users` - User profiles and preferences
- `vision_cards` - Vision board cards
- `milestones` - Roadmap milestones
- `tasks` - Task management
- `journal_entries` - Daily journal entries
- `decisions` - Decision log entries
- `sprints` - Focus sprint sessions
- `flashcards` - Japanese learning cards
- `reviews` - SRS review history
- `crm_contacts` - Investor/partner contacts
- `scenarios` - Runway scenarios

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data. See `supabase/schema.sql` for details.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `G D` | Go to Dashboard |
| `G V` | Go to Vision Board |
| `G R` | Go to Roadmap |
| `G J` | Go to Journal |
| `G G` | Go to Games |
| `G F` | Go to Focus |
| `Escape` | Close modals/palette |

## First-Run Experience

New users are guided through an onboarding wizard that asks:
1. Top 3 goals for the next 6 months
2. Current constraints/challenges
3. Innovate UK June target (yes/no)

This information seeds the initial roadmap and task suggestions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run type-check`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for ambitious founders everywhere.

*"The beacon that guides you to your next level."*
