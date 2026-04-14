-- ETAPA 1: DDL E SCHEMA
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  document text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  salon text NOT NULL,
  client_name text NOT NULL,
  guests integer DEFAULT 0,
  menu text,
  status text DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number serial,
  client_id uuid REFERENCES public.clients(id) ON DELETE RESTRICT,
  event_id uuid REFERENCES public.events(id) ON DELETE RESTRICT,
  status text DEFAULT 'Draft',
  base_value numeric NOT NULL DEFAULT 0,
  extra_guests_value numeric NOT NULL DEFAULT 0,
  optionals_value numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  installments integer DEFAULT 1,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  origin text DEFAULT 'WhatsApp',
  status text DEFAULT 'Novo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  sender text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.freelancers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  cpf text,
  legal_guardian_name text,
  legal_guardian_phone text,
  status text DEFAULT 'Ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.freelancer_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES public.freelancers(id) ON DELETE CASCADE,
  role text NOT NULL,
  hourly_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  freelancer_id uuid REFERENCES public.freelancers(id) ON DELETE CASCADE,
  role text NOT NULL,
  status text DEFAULT 'Escalado',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'Pendente',
  category text NOT NULL,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'Pending',
  installment_number integer NOT NULL,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL,
  min_quantity numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location text NOT NULL CHECK (location IN ('camara', 'freezer')),
  quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, location)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entry', 'exit', 'transfer')),
  quantity numeric NOT NULL,
  location_from text CHECK (location_from IN ('camara', 'freezer', NULL)),
  location_to text CHECK (location_to IN ('camara', 'freezer', NULL)),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  lot text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all" ON public.clients;
CREATE POLICY "authenticated_all" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.events;
CREATE POLICY "authenticated_all" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.contracts;
CREATE POLICY "authenticated_all" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.leads;
CREATE POLICY "authenticated_all" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.conversations;
CREATE POLICY "authenticated_all" ON public.conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.freelancers;
CREATE POLICY "authenticated_all" ON public.freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.freelancer_roles;
CREATE POLICY "authenticated_all" ON public.freelancer_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.event_assignments;
CREATE POLICY "authenticated_all" ON public.event_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.expenses;
CREATE POLICY "authenticated_all" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.payments;
CREATE POLICY "authenticated_all" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.products;
CREATE POLICY "authenticated_all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.stock;
CREATE POLICY "authenticated_all" ON public.stock FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_all" ON public.stock_movements;
CREATE POLICY "authenticated_all" ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ETAPA 2: SEED DATA

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
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;

DO $$
DECLARE
  lead1_id uuid := gen_random_uuid();
  lead2_id uuid := gen_random_uuid();
  lead3_id uuid := gen_random_uuid();
  lead4_id uuid := gen_random_uuid();
  lead5_id uuid := gen_random_uuid();
  
  event1_id uuid := gen_random_uuid();
  event2_id uuid := gen_random_uuid();
  event3_id uuid := gen_random_uuid();
  event4_id uuid := gen_random_uuid();

  client1_id uuid := gen_random_uuid();
  client2_id uuid := gen_random_uuid();
  client3_id uuid := gen_random_uuid();
  client4_id uuid := gen_random_uuid();
  client5_id uuid := gen_random_uuid();

  contract1_id uuid := gen_random_uuid();
  contract2_id uuid := gen_random_uuid();
  contract3_id uuid := gen_random_uuid();
  contract4_id uuid := gen_random_uuid();
  contract5_id uuid := gen_random_uuid();

  prod1_id uuid := gen_random_uuid();
  prod2_id uuid := gen_random_uuid();
  prod3_id uuid := gen_random_uuid();
  prod4_id uuid := gen_random_uuid();
  prod5_id uuid := gen_random_uuid();

  free1_id uuid := gen_random_uuid();
  free2_id uuid := gen_random_uuid();
  free3_id uuid := gen_random_uuid();
  free4_id uuid := gen_random_uuid();
BEGIN

  -- Leads
  INSERT INTO public.leads (id, name, status, created_at) VALUES
    (lead1_id, 'Família Silva (Aniversário 5 anos)', 'Novo', '2023-11-01T00:00:00Z'),
    (lead2_id, 'Festa da Duda', 'Visita', '2023-11-02T00:00:00Z'),
    (lead3_id, 'João Pedro - Heróis', 'Proposta', '2023-11-03T00:00:00Z'),
    (lead4_id, 'Casamento Sra. Mendes', 'Fechado', '2023-11-04T00:00:00Z'),
    (lead5_id, 'Formatura Teens', 'Contato Inicial', '2023-11-05T00:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- Clients
  INSERT INTO public.clients (id, name) VALUES
    (client1_id, 'Mariana Luz'),
    (client2_id, 'Roberto Dias'),
    (client3_id, 'Ana Costa'),
    (client4_id, 'Carlos Silva'),
    (client5_id, 'Família Souza')
  ON CONFLICT (id) DO NOTHING;

  -- Events
  INSERT INTO public.events (id, title, date, time, salon, client_name, status) VALUES
    (event1_id, 'Aniversário Leo (Safari)', CURRENT_DATE, '13:00', 'Kids&Teens', 'Ana Costa', 'Confirmed'),
    (event2_id, '15 Anos Beatriz', CURRENT_DATE, '19:30', 'Premium', 'Roberto Dias', 'Confirmed'),
    (event3_id, 'Festa Infantil (Dinossauros)', CURRENT_DATE + INTERVAL '1 day', '12:00', 'Kids&Teens', 'Carlos Silva', 'Pending'),
    (event4_id, 'Chá de Bebê', CURRENT_DATE + INTERVAL '2 days', '19:00', 'Premium', 'Mariana Luz', 'Confirmed')
  ON CONFLICT (id) DO NOTHING;

  -- Contracts
  INSERT INTO public.contracts (id, client_id, created_at, total_value, status) VALUES
    (contract1_id, client1_id, '2023-11-05T00:00:00Z', 4500, 'Paid'),
    (contract2_id, client2_id, '2023-11-04T00:00:00Z', 12000, 'Signed'),
    (contract3_id, client3_id, '2023-11-02T00:00:00Z', 3800, 'Completed'),
    (contract4_id, client4_id, '2023-11-01T00:00:00Z', 4100, 'Draft'),
    (contract5_id, client5_id, '2023-10-28T00:00:00Z', 5500, 'Cancelled')
  ON CONFLICT (id) DO NOTHING;

  -- Products
  INSERT INTO public.products (id, name, category, min_quantity, unit) VALUES
    (prod1_id, 'Refrigerante Cola 2L', 'Bebidas', 50, 'un'),
    (prod2_id, 'Copo Descartável 200ml', 'Descartáveis', 1000, 'un'),
    (prod3_id, 'Salgadinho Coxinha (cento)', 'Comida', 20, 'cento'),
    (prod4_id, 'Bala de Coco', 'Doces', 30, 'kg'),
    (prod5_id, 'Guardanapo Papel', 'Descartáveis', 500, 'un')
  ON CONFLICT (id) DO NOTHING;

  -- Stock
  INSERT INTO public.stock (product_id, location, quantity) VALUES
    (prod1_id, 'camara', 45),
    (prod2_id, 'camara', 1200),
    (prod3_id, 'freezer', 15),
    (prod4_id, 'camara', 80),
    (prod5_id, 'camara', 150)
  ON CONFLICT (product_id, location) DO NOTHING;

  -- Freelancers
  INSERT INTO public.freelancers (id, name, phone, status) VALUES
    (free1_id, 'João Souza', '(11) 98888-1111', 'Ativo'),
    (free2_id, 'Carla Dias', '(11) 97777-2222', 'Ativo'),
    (free3_id, 'Marcos Paulo', '(11) 96666-3333', 'Inativo'),
    (free4_id, 'Aline Barros', '(11) 95555-4444', 'Ativo')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.freelancer_roles (freelancer_id, role, hourly_rate) VALUES
    (free1_id, 'Monitor Kids', 25.00),
    (free2_id, 'Garçonete', 20.00),
    (free3_id, 'Segurança', 30.00),
    (free4_id, 'Recepcionista', 22.00)
  ON CONFLICT (id) DO NOTHING;

END $$;
