// Server-side Supabase client.
//
// Two flavours:
//  - getServerSupabase()   — anon key, respects RLS. Use from route handlers
//                            that read user-readable rows or insert
//                            anon-permitted rows (e.g. the enquiries form).
//  - getAdminSupabase()    — service-role key, bypasses RLS. Use ONLY from
//                            server code (never ship to client) for admin ops
//                            like reading all enquiries, seeding, migrations.
//
// Both return null if env vars aren't set yet — keeps the build green on
// fresh Vercel deploys before Supabase is provisioned.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Safe to ignore; middleware will refresh the session.
        }
      },
    },
  });
}

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
