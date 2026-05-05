// POST /api/enquiries — receive a form submission from anywhere on the site.
//
// Body (JSON):
//   {
//     kind: 'venue_enquiry' | 'homepage_lead' | 'contact' | 'partner_apply'
//         | 'getaway_enquiry' | 'vendor_enquiry',
//     name?, phone?, email?, message?,
//     venue_slug?, vendor_slug?, getaway_slug?, category?,
//     event_date?, guest_count?
//   }
//
// Returns: { ok: true, id } on success, { ok: false, error } on failure.
// Gracefully no-ops (200) when Supabase env vars aren't set yet so the
// deployed prototype still accepts submissions (logs them server-side)
// before the database is provisioned.

import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  const kind = String(body.kind ?? "");
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
  }

  // Only accept fields we expect; everything else gets dropped.
  const row = {
    kind,
    venue_slug:   str(body.venue_slug),
    vendor_slug:  str(body.vendor_slug),
    getaway_slug: str(body.getaway_slug),
    category:     str(body.category),
    name:         str(body.name),
    phone:        str(body.phone),
    email:        str(body.email),
    event_date:   str(body.event_date),
    guest_count:  str(body.guest_count),
    message:      str(body.message),
    source_url:   req.headers.get("referer") ?? null,
    user_agent:   req.headers.get("user-agent") ?? null,
  };

  const supabase = await getServerSupabase();
  if (!supabase) {
    // Supabase not configured yet — log and acknowledge so the form UX works
    // on a fresh Vercel deploy before the DB is provisioned.
    console.log("[enquiries] Supabase not configured, logged only:", row);
    return NextResponse.json({ ok: true, id: null, note: "db_not_configured" });
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[enquiries] insert failed:", error);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}
