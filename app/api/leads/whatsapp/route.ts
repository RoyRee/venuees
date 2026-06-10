import { NextRequest, NextResponse } from "next/server";
import { db, enquiriesTable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    await db.insert(enquiriesTable).values({
      kind: "whatsapp_click",
      venueSlug: (body.venueSlug as string) ?? null,
      phone:     (body.phone    as string) ?? null,
      message:   (body.page     as string) ?? null,
      sourceUrl: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
      status: "new",
    });
  } catch { /* best-effort */ }
  return NextResponse.json({ ok: true });
}
