import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  'https://phjtyfqmswarbeuuybnl.supabase.co';

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoanR5ZnFtc3dhcmJldXV5Ym5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODk2OTUsImV4cCI6MjEwNTA2NTY5NX0.KxjlOSupt5NZAzs2IvFi7s06e00pMlHI03y-lv2UF_o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

