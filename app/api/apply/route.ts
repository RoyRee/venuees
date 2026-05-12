import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { listingApplicationsTable, listingApplicationMediaTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    listingType, businessName, businessType, contactName,
    phone, email, city, locality, website, message,
    details, amenities, media = [],
  } = body;

  if (!businessName || !businessType || !contactName || !phone || !email || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();

  const [app] = await db.insert(listingApplicationsTable).values({
    userId: user?.id ?? null,
    listingType: listingType ?? null,
    businessName,
    businessType,
    contactName,
    phone,
    email,
    city,
    locality: locality || "",
    website: website || null,
    message: message || null,
    details: details ?? null,
    amenities: amenities?.length ? amenities : null,
    status: "pending",
  }).returning({ id: listingApplicationsTable.id });

  if (media.length > 0) {
    await db.insert(listingApplicationMediaTable).values(
      media.map((m: { data: string; mimeType: string; fileName: string; type: string }, i: number) => ({
        applicationId: app.id,
        data: m.data,
        mimeType: m.mimeType,
        fileName: m.fileName,
        type: m.type ?? "image",
        order: i,
      }))
    );
  }

  return NextResponse.json({ ok: true });
}
