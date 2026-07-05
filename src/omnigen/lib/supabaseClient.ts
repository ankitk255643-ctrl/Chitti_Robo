import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawAnonKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fallbacks to avoid initialization crash when credentials are unset or .env is deleted
export const isSupabaseConfigured = !!(rawUrl && rawAnonKey);

const supabaseUrl = rawUrl || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = rawAnonKey || 'placeholder-anon-key';

console.log("Supabase URL:", rawUrl ? "Loaded" : "Missing (using placeholder)");
console.log("Supabase Key:", rawAnonKey ? "Loaded" : "Missing (using placeholder)");

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Publishable Key is missing. Live Auth and Database operations will be mocked/disabled.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
