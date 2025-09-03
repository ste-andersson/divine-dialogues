-- Drop trigger first, then function, then recreate with proper search path
DROP TRIGGER IF EXISTS update_conversation_data_updated_at ON public.conversation_data;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_conversation_data_updated_at
  BEFORE UPDATE ON public.conversation_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();