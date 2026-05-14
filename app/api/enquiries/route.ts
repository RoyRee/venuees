// POST /api/enquiries — receive a form submission from anywhere on the site.
//
// Uses Drizzle ORM for type-safe inserts into the PostgreSQL database.
// Supabase Auth and Supabase Storage are still used elsewhere in the app —
// this route only uses the direct DB connection (DATABASE_URL).

import { NextRequest, NextResponse } from "next/server";
import { db, enquiriesTable } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KINDS = new Set([
  "venue_enquiry",
  "homepage_lead",
  "contact",
  "partner_apply",
  "getaway_enquiry",
  "vendor_enquiry",
]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const kind = str(body.kind);
  if (!kind || !VALID_KINDS.has(kind)) {
    return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
  }

  // Accept both snake_case (legacy forms) and camelCase field names.
  // Only expected fields are written — everything else is dropped.
  const row: typeof enquiriesTable.$inferInsert = {
    kind,
    venueSlug:   str(body.venue_slug)   ?? str(body.venueSlug),
    vendorSlug:  str(body.vendor_slug)  ?? str(body.vendorSlug),
    getawaySlug: str(body.getaway_slug) ?? str(body.getawaySlug),
    category:    str(body.category),
    name:        str(body.name),
    phone:       str(body.phone),
    email:       str(body.email),
    eventDate:   str(body.event_date)   ?? str(body.eventDate),
    guestCount:  str(body.guest_count)  ?? str(body.guestCount),
    message:     str(body.message),
    sourceUrl:   req.headers.get("referer"),
    userAgent:   req.headers.get("user-agent"),
    status:      "new",
  };

  try {
    const [inserted] = await db
      .insert(enquiriesTable)
      .values(row)
      .returning({ id: enquiriesTable.id });

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (err) {
    console.error("[enquiries] insert failed:", err);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}
