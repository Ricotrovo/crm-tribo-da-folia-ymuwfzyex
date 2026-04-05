DO $$
BEGIN
  -- Freelancers
  CREATE TABLE IF NOT EXISTS public.freelancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    legal_guardian_name TEXT,
    legal_guardian_phone TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Roles
  CREATE TABLE IF NOT EXISTS public.freelancer_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    hourly_rate NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Event Assignments
  CREATE TABLE IF NOT EXISTS public.event_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Escalado',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Expenses
  CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Pendente',
    category TEXT NOT NULL,
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Update Payments (receivables) with payment method if not exists
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

  -- RLS
  ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.freelancer_roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_all_freelancers" ON public.freelancers;
  CREATE POLICY "authenticated_all_freelancers" ON public.freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_freelancer_roles" ON public.freelancer_roles;
  CREATE POLICY "authenticated_all_freelancer_roles" ON public.freelancer_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_event_assignments" ON public.event_assignments;
  CREATE POLICY "authenticated_all_event_assignments" ON public.event_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_expenses" ON public.expenses;
  CREATE POLICY "authenticated_all_expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Seed Data
  IF NOT EXISTS (SELECT 1 FROM public.freelancers WHERE email = 'joao@example.com') THEN
    INSERT INTO public.freelancers (id, name, phone, email, status) VALUES
      ('f1000000-0000-0000-0000-000000000001'::uuid, 'João Silva', '11999999991', 'joao@example.com', 'Ativo'),
      ('f2000000-0000-0000-0000-000000000002'::uuid, 'Maria Souza', '11999999992', 'maria@example.com', 'Ativo'),
      ('f3000000-0000-0000-0000-000000000003'::uuid, 'Pedro Santos', '11999999993', 'pedro@example.com', 'Ativo');

    INSERT INTO public.freelancer_roles (freelancer_id, role, hourly_rate) VALUES
      ('f1000000-0000-0000-0000-000000000001'::uuid, 'Garçom', 25.00),
      ('f2000000-0000-0000-0000-000000000002'::uuid, 'Monitor', 20.00),
      ('f3000000-0000-0000-0000-000000000003'::uuid, 'Segurança', 30.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.expenses WHERE description = 'Aluguel do espaço') THEN
    INSERT INTO public.expenses (description, amount, due_date, status, category, supplier) VALUES
      ('Aluguel do espaço', 5000.00, CURRENT_DATE + INTERVAL '5 days', 'Pendente', 'Fixo', 'Imobiliária Central'),
      ('Energia Elétrica', 800.00, CURRENT_DATE - INTERVAL '2 days', 'Pago', 'Fixo', 'Enel'),
      ('Refrigerantes', 1200.00, CURRENT_DATE + INTERVAL '10 days', 'Pendente', 'Fornecedor', 'Distribuidora XYZ');
  END IF;

  -- Insert mock payment (receivable)
  IF NOT EXISTS (SELECT 1 FROM public.payments WHERE id = 'a1000000-0000-0000-0000-000000000001'::uuid) THEN
    INSERT INTO public.payments (id, amount, due_date, installment_number, status) VALUES
      ('a1000000-0000-0000-0000-000000000001'::uuid, 1500.00, CURRENT_DATE, 1, 'Pendente'),
      ('a2000000-0000-0000-0000-000000000002'::uuid, 1500.00, CURRENT_DATE + INTERVAL '30 days', 2, 'Pendente');
  END IF;

END $$;
