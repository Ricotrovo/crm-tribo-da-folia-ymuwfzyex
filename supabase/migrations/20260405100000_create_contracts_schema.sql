-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_clients" ON public.clients;
CREATE POLICY "authenticated_all_clients" ON public.clients 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create sequence for contract numbers
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 8000;

-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number INTEGER DEFAULT nextval('contract_number_seq'),
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Draft',
  base_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  extra_guests_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  optionals_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  installments INTEGER DEFAULT 1,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_contracts" ON public.contracts;
CREATE POLICY "authenticated_all_contracts" ON public.contracts 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  installment_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_payments" ON public.payments;
CREATE POLICY "authenticated_all_payments" ON public.payments 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial data for clients and additional events
DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clients LIMIT 1) THEN
    INSERT INTO public.clients (id, name, phone, email) VALUES
      (gen_random_uuid(), 'Mariana Luz', '11999999999', 'mariana@example.com'),
      (gen_random_uuid(), 'Roberto Dias', '11888888888', 'roberto@example.com'),
      (gen_random_uuid(), 'Ana Costa', '11777777777', 'ana@example.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Festa Nova para Contrato') THEN
    INSERT INTO public.events (id, title, date, time, salon, client_name, guests, menu, status)
    VALUES 
      (gen_random_uuid(), 'Festa Nova para Contrato', CURRENT_DATE + INTERVAL '5 days', '19:00', 'Premium', 'Mariana Luz', 80, 'Premium', 'Pending'),
      (gen_random_uuid(), 'Aniversário Especial', CURRENT_DATE + INTERVAL '10 days', '13:00', 'Kids&Teens', 'Roberto Dias', 60, 'Standard', 'Pending');
  END IF;
END $seed$;
