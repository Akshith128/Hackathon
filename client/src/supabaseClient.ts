import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder_key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase credentials in environment variables. Using placeholder values. The app will load but database features will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase client initialized')
