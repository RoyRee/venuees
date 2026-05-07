import { NextRequest, NextResponse } from "next/server";
import { db, listingApplicationsTable } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["venue", "vendor", "getaway"]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const businessName  = str(body.businessName  ?? body.business_name);
  const businessType  = str(body.businessType  ?? body.business_type);
  const contactName   = str(body.contactName   ?? body.contact_name);
  const phone         = str(body.phone);
  const email         = str(body.email);
  const city          = str(body.city);

  if (!businessName || !businessType || !contactName || !phone || !email || !city) {
    return NextResponse.json({ ok: false, error: "required_fields_missing" }, { status: 400 });
  }

  if (!VALID_TYPES.has(businessType)) {
    return NextResponse.json({ ok: false, error: "invalid_business_type" }, { status: 400 });
  }

  try {
    const [inserted] = await db
      .insert(listingApplicationsTable)
      .values({
        businessName,
        businessType,
        category:  str(body.category),
        contactName,
        phone,
        email,
        city,
        locality:  str(body.locality) ?? "",
        website:   str(body.website),
        message:   str(body.message),
        status:    "pending",
      })
      .returning({ id: listingApplicationsTable.id });

    return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 });
  } catch (err) {
    console.error("[listings] insert failed:", err);
    return NextResponse.json({ ok: false, error: "submit_failed" }, { status: 500 });
  }
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}
