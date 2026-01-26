import { createClient } from '@supabase/supabase-js';

// Prefer env vars, but when running in Expo use Constants.expoConfig.extra
let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

try {
  // require is used inside try/catch so this file can still be used on web/node where expo-constants isn't available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Constants = require('expo-constants');
  if (Constants && Constants.expoConfig && Constants.expoConfig.extra) {
    supabaseUrl = supabaseUrl || Constants.expoConfig.extra.supabaseUrl || Constants.expoConfig.extra.SUPABASE_URL || '';
    supabaseKey = supabaseKey || Constants.expoConfig.extra.supabaseKey || Constants.expoConfig.extra.SUPABASE_ANON_KEY || '';
  }
} catch (e) {
  // Not running in Expo — ignore
}

export const supabase = createClient(
  supabaseUrl || '<REPLACE_WITH_URL>',
  supabaseKey || '<REPLACE_WITH_ANON_KEY>'
);
