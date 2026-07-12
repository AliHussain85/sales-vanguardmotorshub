# sales-vanguardmotorshub

Sales dashboard for Vanguard Motors Hub — React, Tailwind, and Supabase Auth.

## Run locally

```bash
cd dashboard
npm install
npm run dev
```

Open **http://localhost:5173**

## Pages (native React)

| Route | Component | Description |
|-------|-----------|-------------|
| `/daily-report` | `DailyReportPage.tsx` | Inquiry report, date filter, CSV & PNG export |
| `/close-deal` | `CloseDealPage.tsx` | WhatsApp lead matching and deal closing |

## Supabase setup

1. Run the migration in `supabase/migrations/001_create_sales_tables.sql` against project **abwgpqzrewjsjpxlkoml**
2. Create a user under **Authentication → Users** in Supabase
3. Enable the **Email** provider
4. In Supabase → **Authentication → URL Configuration**, set your production URL and redirect URLs

Supabase credentials are configured in `dashboard/src/lib/supabase.ts`.

## Deploy on Netlify

Connect the GitHub repo — Netlify reads `netlify.toml` automatically. No environment variables required.
