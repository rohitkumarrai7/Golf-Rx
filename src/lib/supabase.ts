import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client (bypasses RLS for admin operations)
export const supabaseAdmin = supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;

// Create a Supabase client with Clerk JWT for RLS
export function createClerkSupabaseClient(token: string) {
  if (!supabaseUrl) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
