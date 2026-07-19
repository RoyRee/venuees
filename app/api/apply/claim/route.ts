import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { listingApplicationsTable } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/apply/claim
 * Called after email/password login to claim any unclaimed listing applications
 * that were submitted by an admin on behalf of this user's email.
 */
export async function POST() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await db
    .update(listingApplicationsTable)
    .set({ userId: user.id })
    .where(
      and(
        eq(listingApplicationsTable.email, user.email),
        isNull(listingApplicationsTable.userId)
      )
    )
    .returning({ id: listingApplicationsTable.id })
    .catch(() => []);

  return NextResponse.json({ ok: true, claimed: result.length });
}
