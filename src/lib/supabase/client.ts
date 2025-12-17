import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Singleton instance for client-side
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
};
