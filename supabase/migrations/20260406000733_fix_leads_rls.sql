-- Ensure leads policies are correctly set for all operations
DROP POLICY IF EXISTS "authenticated_all_leads" ON public.leads;
CREATE POLICY "authenticated_all_leads" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_conversations" ON public.conversations;
CREATE POLICY "authenticated_all_conversations" ON public.conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
