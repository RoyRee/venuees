// Browser-side Supabase client.
//
// Safe to call even when env vars are missing — returns `null` instead of
// throwing, so the site still builds and runs on a brand-new Vercel deploy
// before Supabase is provisioned. Callers must guard against null.

import { createBrowserClient } from "@supabase/ssr";

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
