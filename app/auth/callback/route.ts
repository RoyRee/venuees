import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, profilesTable } from "@/lib/db";
import { listingApplicationsTable } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) =>
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Claim any unclaimed listing applications that match this user's email
      if (data.user.email) {
        await db
          .update(listingApplicationsTable)
          .set({ userId: data.user.id })
          .where(
            and(
              eq(listingApplicationsTable.email, data.user.email),
              isNull(listingApplicationsTable.userId)
            )
          )
          .catch((e) => console.error("[auth/callback] claim applications failed:", e));
      }

      // Check if this user already has a phone number on file
      const profile = await db
        .select({ phone: profilesTable.phone })
        .from(profilesTable)
        .where(eq(profilesTable.userId, data.user.id))
        .limit(1)
        .catch(() => []);

      const hasPhone = profile.length > 0 && !!profile[0].phone;

      if (!hasPhone) {
        // New Google sign-up or existing user without phone → ask for it
        return NextResponse.redirect(
          `${origin}/onboarding/phone?next=${encodeURIComponent(next)}`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

