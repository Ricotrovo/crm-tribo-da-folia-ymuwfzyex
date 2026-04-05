-- Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  origin TEXT DEFAULT 'WhatsApp',
  status TEXT DEFAULT 'Novo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create Policies for Leads
DROP POLICY IF EXISTS "authenticated_all_leads" ON public.leads;
CREATE POLICY "authenticated_all_leads" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Policies for Conversations
DROP POLICY IF EXISTS "authenticated_all_conversations" ON public.conversations;
CREATE POLICY "authenticated_all_conversations" ON public.conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create simple trigger to update updated_at on leads
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_modtime ON public.leads;
CREATE TRIGGER update_leads_modtime
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Seed Data
DO $$
DECLARE
  lead1 UUID := gen_random_uuid();
  lead2 UUID := gen_random_uuid();
  lead3 UUID := gen_random_uuid();
BEGIN
  -- Insert seed data only if the table is empty to maintain idempotency
  IF NOT EXISTS (SELECT 1 FROM public.leads LIMIT 1) THEN
    INSERT INTO public.leads (id, name, phone, origin, status) VALUES
      (lead1, 'Maria Silva', '11999999999', 'WhatsApp', 'Novo'),
      (lead2, 'João Souza', '11888888888', 'Instagram', 'Contato Inicial'),
      (lead3, 'Carla Mendes', '11777777777', 'Facebook', 'Proposta');

    INSERT INTO public.conversations (lead_id, sender, message) VALUES
      (lead1, 'client', 'Olá, gostaria de saber os valores para festa de 50 pessoas.'),
      (lead1, 'ai', 'Olá Maria! Temos opções a partir de R$ 3.500 para 50 pessoas no salão Premium. Gostaria de agendar uma visita?'),
      (lead2, 'client', 'Vocês têm disponibilidade para o dia 12 de Outubro?'),
      (lead2, 'ai', 'Olá João! Para o dia 12 de Outubro temos horário no salão Kids&Teens às 19h. O que acha?'),
      (lead2, 'seller', 'Podemos fechar esse horário, João. Quer que eu envie a proposta formal?'),
      (lead3, 'client', 'Gostei muito do cardápio e das fotos do salão! Podem me mandar a proposta formal para analisarmos?'),
      (lead3, 'seller', 'Claro Carla, vou gerar a proposta agora mesmo no nosso sistema e já te envio o PDF por aqui.');
  END IF;
END $$;
