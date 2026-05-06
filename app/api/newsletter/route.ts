import { NextRequest, NextResponse } from "next/server";
import { db, newsletterTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "valid_email_required" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.trim() : "footer";

  try {
    const existing = await db
      .select({ id: newsletterTable.id })
      .from(newsletterTable)
      .where(eq(newsletterTable.email, email))
      .limit(1);

    if (existing.length) {
      return NextResponse.json({ ok: true, note: "already_subscribed" });
    }

    await db.insert(newsletterTable).values({ email, source });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[newsletter] insert failed:", err);
    return NextResponse.json({ ok: false, error: "subscribe_failed" }, { status: 500 });
  }
}
