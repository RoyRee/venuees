import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { listingApplicationsTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, businessType, category, contactName, phone, email, city, locality, website, message } = body;

  if (!businessName || !businessType || !contactName || !phone || !email || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();

  await db.insert(listingApplicationsTable).values({
    userId: user?.id ?? null,
    businessName,
    businessType,
    category: category || null,
    contactName,
    phone,
    email,
    city,
    locality: locality || "",
    website: website || null,
    message: message || null,
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
