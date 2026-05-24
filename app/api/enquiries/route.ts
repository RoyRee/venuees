// POST /api/enquiries — receive a form submission from anywhere on the site.
//
// On success:
//   1. Inserts the enquiry row into the DB
//   2. Sends an email to the admin (always)
//   3. Sends an email to the vendor / venue owner (if venue_slug or vendor_slug present)
//   4. Sends a confirmation email to the couple/user (if email provided)
//
// Resend is optional — if RESEND_API_KEY is not set, emails are skipped
// gracefully and the enquiry is still saved.

import { NextRequest, NextResponse } from "next/server";
import { db, enquiriesTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

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

const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ?? "hello@venuees.in";
const FROM_EMAIL  = "Venuees.in <notifications@venuees.in>";

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

  let insertedId: number | null = null;
  try {
    const [inserted] = await db
      .insert(enquiriesTable)
      .values(row)
      .returning({ id: enquiriesTable.id });
    insertedId = inserted.id;
  } catch (err) {
    console.error("[enquiries] insert failed:", err);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  // ── Fire-and-forget emails ─────────────────────────────────────────────────
  // We don't await these — if Resend is not configured or fails, the enquiry
  // is still saved and the user gets a 200 OK.
  sendNotifications(row).catch((e) =>
    console.error("[enquiries] notification failed:", e)
  );

  return NextResponse.json({ ok: true, id: insertedId });
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendNotifications(row: typeof enquiriesTable.$inferInsert) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Resend not configured — skip silently

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const label = kindLabel(row.kind ?? "");
  const listingName = await resolveListingName(row);

  // 1. Admin notification
  await resend.emails.send({
    from: FROM_EMAIL,
    to:   ADMIN_EMAIL,
    subject: `New lead: ${row.name ?? "Unknown"} — ${listingName ?? label}`,
    html: buildAdminEmail({ row, label, listingName }),
  });

  // 2. Vendor notification (if we have their contact email)
  const vendorEmail = await resolveVendorEmail(row);
  if (vendorEmail) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   vendorEmail,
      subject: `New enquiry via Venuees.in — ${row.name ?? "A couple"} is interested`,
      html: buildVendorEmail({ row, listingName }),
    });
  }

  // 3. Confirmation to the couple
  if (row.email) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   row.email,
      subject: `We've got your enquiry${listingName ? ` for ${listingName}` : ""} — Venuees.in`,
      html: buildConfirmationEmail({ row, listingName }),
    });
  }
}

async function resolveListingName(row: typeof enquiriesTable.$inferInsert): Promise<string | null> {
  try {
    if (row.venueSlug) {
      const [v] = await db.select({ name: venuesTable.name }).from(venuesTable).where(eq(venuesTable.slug, row.venueSlug)).limit(1);
      return v?.name ?? row.venueSlug;
    }
    if (row.vendorSlug) {
      const [v] = await db.select({ name: vendorsTable.name }).from(vendorsTable).where(eq(vendorsTable.slug, row.vendorSlug)).limit(1);
      return v?.name ?? row.vendorSlug;
    }
  } catch { /* ignore */ }
  return null;
}

async function resolveVendorEmail(row: typeof enquiriesTable.$inferInsert): Promise<string | null> {
  try {
    if (row.venueSlug) {
      const [v] = await db.select({ contactEmail: venuesTable.contactEmail }).from(venuesTable).where(eq(venuesTable.slug, row.venueSlug)).limit(1);
      return v?.contactEmail ?? null;
    }
    if (row.vendorSlug) {
      const [v] = await db.select({ contactEmail: vendorsTable.contactEmail }).from(vendorsTable).where(eq(vendorsTable.slug, row.vendorSlug)).limit(1);
      return v?.contactEmail ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

function kindLabel(kind: string): string {
  const map: Record<string, string> = {
    venue_enquiry:   "Venue enquiry",
    vendor_enquiry:  "Vendor enquiry",
    getaway_enquiry: "Getaway enquiry",
    contact:         "General enquiry",
    homepage_lead:   "Homepage lead",
    partner_apply:   "Partner application",
  };
  return map[kind] ?? kind;
}

function buildAdminEmail({ row, label, listingName }: { row: typeof enquiriesTable.$inferInsert; label: string; listingName: string | null }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#C15A74;margin-bottom:4px">New lead — Venuees.in</h2>
  <p style="color:#666;font-size:13px;margin-top:0">${label}${listingName ? ` · ${listingName}` : ""}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px">
    ${tableRow("Name",    row.name        ?? "—")}
    ${tableRow("Phone",   row.phone       ?? "—")}
    ${tableRow("Email",   row.email       ?? "—")}
    ${tableRow("Date",    row.eventDate   ?? "—")}
    ${tableRow("Guests",  row.guestCount  ?? "—")}
    ${tableRow("Listing", listingName     ?? row.venueSlug ?? row.vendorSlug ?? "—")}
    ${row.message ? tableRow("Message", row.message) : ""}
    ${tableRow("Source",  row.sourceUrl   ?? "direct")}
  </table>
  <p style="margin-top:24px">
    <a href="https://venuees.in/dashboard/enquiries" style="background:#C15A74;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px">View in dashboard →</a>
  </p>
</div>`;
}

function buildVendorEmail({ row, listingName }: { row: typeof enquiriesTable.$inferInsert; listingName: string | null }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#C15A74;margin-bottom:4px">New enquiry for ${listingName ?? "your listing"}</h2>
  <p style="color:#666;font-size:14px">Someone found your listing on Venuees.in and wants to know more. Reach out within 2 hours for the best chance of conversion.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px">
    ${tableRow("Name",   row.name       ?? "—")}
    ${tableRow("Phone",  row.phone      ?? "—")}
    ${tableRow("Email",  row.email      ?? "—")}
    ${tableRow("Date",   row.eventDate  ?? "—")}
    ${tableRow("Guests", row.guestCount ?? "—")}
    ${row.message ? tableRow("Message", row.message) : ""}
  </table>
  <p style="font-size:12px;color:#999;margin-top:24px">
    This lead was sent to you by Venuees.in. Please do not share lead details externally.
    Manage your listing at <a href="https://venuees.in/dashboard">venuees.in/dashboard</a>.
  </p>
</div>`;
}

function buildConfirmationEmail({ row, listingName }: { row: typeof enquiriesTable.$inferInsert; listingName: string | null }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#C15A74;margin-bottom:4px">We've received your enquiry${listingName ? ` for ${listingName}` : ""}.</h2>
  <p style="font-size:14px;color:#444;line-height:1.6">
    Hi ${row.name?.split(" ")[0] ?? "there"}, thank you for reaching out!<br/><br/>
    Our team will call or WhatsApp you on <b>${row.phone ?? "the number you provided"}</b> within 2 hours (Mon–Sat, 9am–7pm IST).
    ${listingName ? `We'll confirm availability at <b>${listingName}</b> and answer any questions you have.` : ""}
  </p>
  <p style="font-size:14px;color:#444;">While you wait, you can browse more venues at
    <a href="https://venuees.in/venues" style="color:#C15A74">venuees.in/venues</a>.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999;">
    Venuees.in · Plot 14, Ramdaspeth, Nagpur 440010 · +91 712 555 0180 · hello@venuees.in
  </p>
</div>`;
}

function tableRow(label: string, value: string) {
  return `<tr><td style="padding:8px 12px 8px 0;color:#999;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 0;color:#222">${value}</td></tr>`;
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}
