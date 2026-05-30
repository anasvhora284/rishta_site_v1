# 68 Vhora Rishta Portal

Unified PWA for the 68 Vhora Samaj Rishta group — browse profiles, submit new entries, and admin verification in one place.

## Features

- **Browse & filter** approved matrimonial profiles
- **Submit profile** via parent-friendly 5-step wizard (Gujarati default)
- **Admin dashboard** to approve/reject/edit submissions (immediate publish on approve)
- **Trilingual** UI: Gujarati, Hindi, English
- **PWA** — installable on mobile devices

## Stack

- Vite + React + TypeScript
- MUI
- Supabase (Postgres + Auth + RLS)
- react-i18next
- vite-plugin-pwa

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com) (region: Mumbai recommended)
2. Run the migration in [supabase/migrations/20250530120000_init_schema.sql](supabase/migrations/20250530120000_init_schema.sql) via SQL Editor
3. Create admin users in Authentication → Users, then set **App Metadata**:

```json
{ "role": "admin" }
```

### 2. Environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Install & run

```bash
npm install
npm run dev
```

### 4. Migrate existing Excel data (optional)

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate -- \
  "../Rista Data.xlsx" \
  "../Rishta Data Form Responses (Dont Touch _ Edit).xlsx"
```

## Deploy (Netlify)

1. Connect repo to Netlify
2. Set build command: `npm run build`, publish dir: `dist`
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

Or use the included [netlify.toml](netlify.toml).

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — Browse / Submit / Contact |
| `/filter` | Filter approved profiles |
| `/userlist` | Search results |
| `/submit` | New profile submission wizard |
| `/admin/login` | Admin sign in |
| `/admin` | Admin dashboard |

## Admin workflow

1. Parent submits via `/submit` → status `pending`
2. Admin reviews in `/admin` → Approve / Reject / Edit
3. On approve → `profile_id` assigned, immediately visible in browse
