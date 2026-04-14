DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT,
    profile_id UUID REFERENCES public.profile(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE,
    salon TEXT,
    profile_id UUID REFERENCES public.profile(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.contract (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profile(id) ON DELETE SET NULL,
    total_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contract(id) ON DELETE CASCADE,
    amount NUMERIC,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_policy" ON public.profile;
CREATE POLICY "profile_policy" ON public.profile FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "lead_policy" ON public.lead;
CREATE POLICY "lead_policy" ON public.lead FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "event_policy" ON public.event;
CREATE POLICY "event_policy" ON public.event FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "contract_policy" ON public.contract;
CREATE POLICY "contract_policy" ON public.contract FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "payment_policy" ON public.payment;
CREATE POLICY "payment_policy" ON public.payment FOR ALL TO authenticated USING (true);

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'r.trovo@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'r.trovo@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profile (id, name, role)
    VALUES (new_user_id, 'Admin', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
