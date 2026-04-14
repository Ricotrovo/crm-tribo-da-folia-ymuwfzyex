-- DDL Statements
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Seed User
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
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number SERIAL,
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Draft',
  base_value NUMERIC NOT NULL DEFAULT 0,
  extra_guests_value NUMERIC NOT NULL DEFAULT 0,
  optionals_value NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  installments INTEGER DEFAULT 1,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  origin TEXT DEFAULT 'WhatsApp',
  status TEXT DEFAULT 'Novo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.freelancer_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Escalado',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  installment_number INTEGER NOT NULL,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location TEXT NOT NULL CHECK (location IN ('camara', 'freezer')),
  quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, location)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit', 'transfer')),
  quantity NUMERIC NOT NULL,
  location_from TEXT CHECK (location_from IN ('camara', 'freezer') OR location_from IS NULL),
  location_to TEXT CHECK (location_to IN ('camara', 'freezer') OR location_to IS NULL),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  lot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_modtime ON public.leads;
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_clients_modtime ON public.clients;
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_events_modtime ON public.events;
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_contracts_modtime ON public.contracts;
CREATE TRIGGER update_contracts_modtime BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_freelancers_modtime ON public.freelancers;
CREATE TRIGGER update_freelancers_modtime BEFORE UPDATE ON public.freelancers FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_event_assignments_modtime ON public.event_assignments;
CREATE TRIGGER update_event_assignments_modtime BEFORE UPDATE ON public.event_assignments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_expenses_modtime ON public.expenses;
CREATE TRIGGER update_expenses_modtime BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_payments_modtime ON public.payments;
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_products_modtime ON public.products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_stock_modtime ON public.stock;
CREATE TRIGGER update_stock_modtime BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Stock Movement Function
CREATE OR REPLACE FUNCTION public.handle_stock_movement()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'entry' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = stock.quantity + EXCLUDED.quantity, updated_at = NOW();
  ELSIF NEW.type = 'exit' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = stock.quantity + EXCLUDED.quantity, updated_at = NOW();
  ELSIF NEW.type = 'transfer' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = stock.quantity + EXCLUDED.quantity, updated_at = NOW();

    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = stock.quantity + EXCLUDED.quantity, updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_movement ON public.stock_movements;
CREATE TRIGGER on_stock_movement AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION handle_stock_movement();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_created_status_value ON public.contracts (created_at, status, total_value);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events (date, status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_status_amount ON public.expenses (due_date, status, amount);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads (status, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_due_status_amount ON public.payments (due_date, status, amount);

-- Enable RLS and create policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_all_%I" ON public.%I', t, t);
    END LOOP;
END $$;

CREATE POLICY "authenticated_all_clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_conversations" ON public.conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_event_assignments" ON public.event_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_freelancer_roles" ON public.freelancer_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_freelancers" ON public.freelancers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_stock" ON public.stock FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_stock_movements" ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert Seed Data safely using idempotent ON CONFLICT DO NOTHING with explicitly provided UUIDs
INSERT INTO public.products (id, name, unit, min_quantity, category) VALUES
('00000000-0000-0000-0000-000000000001', 'Refrigerante Cola 2L', 'UN', 10, 'Bebidas'),
('00000000-0000-0000-0000-000000000002', 'Copo Plástico 200ml', 'CX', 5, 'Descartáveis')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.leads (id, name, phone, origin, status) VALUES
('00000000-0000-0000-0000-000000000003', 'Maria Oliveira', '11999999999', 'WhatsApp', 'Novo'),
('00000000-0000-0000-0000-000000000004', 'João Santos', '11988888888', 'Instagram', 'Proposta')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, date, time, salon, client_name, guests, status) VALUES
('00000000-0000-0000-0000-000000000005', 'Aniversário Pedrinho 5 anos', CURRENT_DATE + INTERVAL '5 days', '19:00', 'Premium', 'Ana Silva', 50, 'Confirmed'),
('00000000-0000-0000-0000-000000000006', 'Festa da Júlia', CURRENT_DATE + INTERVAL '10 days', '12:00', 'Kids&Teens', 'Carlos Mendes', 80, 'Pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.freelancers (id, name, phone, status) VALUES
('00000000-0000-0000-0000-000000000007', 'Lucas Monitor', '11977777777', 'Ativo'),
('00000000-0000-0000-0000-000000000008', 'Fernanda Garçonete', '11966666666', 'Ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.freelancer_roles (id, freelancer_id, role, hourly_rate) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000007', 'Monitor', 25.00),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000008', 'Garçom', 30.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clients (id, name, phone, email) VALUES
('00000000-0000-0000-0000-000000000009', 'Ana Silva', '11955555555', 'ana@email.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contracts (id, client_id, event_id, base_value, total_value, installments, status) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005', 3500.00, 3500.00, 2, 'Signed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments (id, contract_id, amount, due_date, status, installment_number) VALUES
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000010', 1750.00, CURRENT_DATE - INTERVAL '2 days', 'Pago', 1),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000010', 1750.00, CURRENT_DATE + INTERVAL '28 days', 'Pendente', 2)
ON CONFLICT (id) DO NOTHING;
