-- Sales dashboard tables for Vanguard Motors Hub
-- Run this in Supabase SQL Editor for project abwgpqzrewjsjpxlkoml

CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id BIGSERIAL PRIMARY KEY,
  inquiry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gclid TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  country TEXT DEFAULT 'Unknown',
  country_code TEXT,
  city TEXT,
  region TEXT,
  lead_value NUMERIC,
  whatsapp_number TEXT,
  closed_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_inquiry_time
  ON public.whatsapp_clicks (inquiry_time DESC);

CREATE TABLE IF NOT EXISTS public.wati_contacts (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_icon TEXT,
  lead_stage TEXT,
  lead_source TEXT,
  lead_value NUMERIC,
  lead_notes_report TEXT,
  bookings JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wati_contacts_created_at
  ON public.wati_contacts (created_at ASC);

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wati_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read whatsapp_clicks" ON public.whatsapp_clicks;
CREATE POLICY "Allow anon read whatsapp_clicks" ON public.whatsapp_clicks
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon read wati_contacts" ON public.wati_contacts;
CREATE POLICY "Allow anon read wati_contacts" ON public.wati_contacts
  FOR SELECT TO anon USING (true);

GRANT SELECT ON public.whatsapp_clicks TO anon;
GRANT SELECT ON public.wati_contacts TO anon;
