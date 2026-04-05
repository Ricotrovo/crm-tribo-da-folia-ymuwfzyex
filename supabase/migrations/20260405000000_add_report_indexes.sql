-- Add indexes for reports and dashboards aggregation performance
CREATE INDEX IF NOT EXISTS idx_contracts_created_status_value ON public.contracts (created_at, status, total_value);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events (date, status);
CREATE INDEX IF NOT EXISTS idx_payments_due_status_amount ON public.payments (due_date, status, amount);
CREATE INDEX IF NOT EXISTS idx_expenses_due_status_amount ON public.expenses (due_date, status, amount);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads (status, created_at);
