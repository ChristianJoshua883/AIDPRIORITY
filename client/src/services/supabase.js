import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ianevkuxxmvvztoowv.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_E-KlKyrMYC4SHrO-qj-XcA_PEEWhIob'
);

export default supabase;
