import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const venueId = Number(id);
  if (!venueId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const role = await getUserRole(user.id, user.email!);

  // Allow admins, or the owner of this specific venue
  if (role !== "admin") {
    const rows = await db
      .select({ ownerUserId: venuesTable.ownerUserId })
      .from(venuesTable)
      .where(eq(venuesTable.id, venueId))
      .limit(1);
    if (!rows.length || rows[0].ownerUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { googlePlaceId, googleMapsUrl, googleRating, googleReviewCount } = await request.json();

  // Merge into existing meta JSONB without wiping other fields
  await db.execute(sql`
    UPDATE venues
    SET meta = COALESCE(meta, '{}'::jsonb)
           || ${JSON.stringify({
             googlePlaceId:    googlePlaceId    || null,
             googleMapsUrl:    googleMapsUrl    || null,
             googleRating:     googleRating     ? Number(googleRating)     : null,
             googleReviewCount:googleReviewCount? Number(googleReviewCount): null,
           })}::jsonb
    WHERE id = ${venueId}
  `);

  // Bust the 24-hour Places API cache if Place ID changed
  if (googlePlaceId) {
    try { revalidateTag(`google-place-${googlePlaceId}`); } catch { /* ignore */ }
  }

  return NextResponse.json({ ok: true });
}
