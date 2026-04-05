CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  salon TEXT NOT NULL,
  client_name TEXT NOT NULL,
  guests INTEGER DEFAULT 0,
  menu TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_events" ON public.events;
CREATE POLICY "authenticated_select_events" ON public.events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_events" ON public.events;
CREATE POLICY "authenticated_insert_events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_events" ON public.events;
CREATE POLICY "authenticated_update_events" ON public.events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_events" ON public.events;
CREATE POLICY "authenticated_delete_events" ON public.events
  FOR DELETE TO authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events LIMIT 1) THEN
    INSERT INTO public.events (id, title, date, time, salon, client_name, guests, menu, status)
    VALUES 
      (gen_random_uuid(), 'Aniversário Leo (Safari)', CURRENT_DATE, '13:00', 'Kids&Teens', 'Ana Costa', 50, 'Standard', 'Confirmed'),
      (gen_random_uuid(), '15 Anos Beatriz', CURRENT_DATE, '19:30', 'Premium', 'Roberto Dias', 100, 'Premium', 'Confirmed'),
      (gen_random_uuid(), 'Festa Infantil (Dinossauros)', CURRENT_DATE + INTERVAL '1 day', '12:00', 'Kids&Teens', 'Carlos Silva', 40, 'Standard', 'Pending'),
      (gen_random_uuid(), 'Chá de Bebê', CURRENT_DATE + INTERVAL '2 days', '19:00', 'Premium', 'Mariana Luz', 60, 'Premium', 'Confirmed');
  END IF;
END $$;
