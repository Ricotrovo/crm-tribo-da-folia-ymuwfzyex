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
  location_from TEXT CHECK (location_from IN ('camara', 'freezer')),
  location_to TEXT CHECK (location_to IN ('camara', 'freezer')),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  lot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_products" ON public.products;
CREATE POLICY "authenticated_all_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_stock" ON public.stock;
CREATE POLICY "authenticated_all_stock" ON public.stock FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_stock_movements" ON public.stock_movements;
CREATE POLICY "authenticated_all_stock_movements" ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_stock_movement()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'entry' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = public.stock.quantity + NEW.quantity, updated_at = NOW();
  ELSIF NEW.type = 'exit' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = public.stock.quantity - NEW.quantity, updated_at = NOW();
  ELSIF NEW.type = 'transfer' THEN
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = public.stock.quantity - NEW.quantity, updated_at = NOW();
    
    INSERT INTO public.stock (product_id, location, quantity)
    VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
    ON CONFLICT (product_id, location) DO UPDATE
    SET quantity = public.stock.quantity + NEW.quantity, updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_movement ON public.stock_movements;
CREATE TRIGGER on_stock_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_stock_movement();

DO $$
BEGIN
  INSERT INTO public.products (id, name, unit, min_quantity, category) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Coxinha', 'un', 500, 'salgados'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 'Bolinha de Queijo', 'un', 500, 'salgados'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 'Refrigerante Cola', 'l', 50, 'bebidas'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 'Nhoque', 'kg', 20, 'pratos quentes')
  ON CONFLICT (id) DO NOTHING;
END $$;
