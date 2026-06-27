// Legacy Supabase scaffold — not used by the app (auth is JWT via FastAPI).
// Kept for reference; credentials must come from environment variables if re-enabled.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
      })
    : null;
