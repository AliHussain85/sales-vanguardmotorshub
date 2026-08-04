-- Restore anon SELECT so the dashboard can use the anon key again
-- (service role bypasses RLS; anon currently sees 0 rows)

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read whatsapp_clicks" ON public.whatsapp_clicks;
CREATE POLICY "Allow anon read whatsapp_clicks" ON public.whatsapp_clicks
  FOR SELECT TO anon USING (true);

GRANT SELECT ON public.whatsapp_clicks TO anon;
