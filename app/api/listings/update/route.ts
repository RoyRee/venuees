import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, listingApplicationsTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    linkedId, linkedType,
    listingType, businessName, businessType,
    contactName, phone, email, city, locality,
    website, message, details, amenities,
  } = await request.json();

  if (!linkedId || !linkedType || !businessName || !contactName || !phone || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify ownership before creating the edit application
  if (linkedType === "venue") {
    const [row] = await db.select({ ownerUserId: venuesTable.ownerUserId })
      .from(venuesTable).where(eq(venuesTable.id, linkedId)).limit(1);
    if (!row || row.ownerUserId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (linkedType === "vendor") {
    const [row] = await db.select({ ownerUserId: vendorsTable.ownerUserId })
      .from(vendorsTable).where(eq(vendorsTable.id, linkedId)).limit(1);
    if (!row || row.ownerUserId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    return NextResponse.json({ error: "Invalid linked type" }, { status: 400 });
  }

  // Embed edit metadata in the details JSONB — no schema change needed
  const fullDetails = {
    ...(details ?? {}),
    _isEdit: true,
    _linkedId: linkedId,
    _linkedType: linkedType,
  };

  const [app] = await db.insert(listingApplicationsTable).values({
    userId: user.id,
    listingType: listingType ?? linkedType,
    businessName,
    businessType,
    contactName,
    phone,
    email,
    city,
    locality: locality || "",
    website: website || null,
    message: message || null,
    details: fullDetails,
    amenities: amenities?.length ? amenities : null,
    status: "pending",
  }).returning({ id: listingApplicationsTable.id });

  return NextResponse.json({ ok: true, id: app.id });
}
