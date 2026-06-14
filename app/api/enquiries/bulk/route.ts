import { NextRequest, NextResponse } from "next/server";
import { db, enquiriesTable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { venueSlugs, name, phone } = await req.json() as {
    venueSlugs: unknown; name: unknown; phone: unknown;
  };

  if (!Array.isArray(venueSlugs) || !venueSlugs.length || !name || !phone)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const slugs = (venueSlugs as string[]).slice(0, 3);

  await db.insert(enquiriesTable).values(
    slugs.map((slug) => ({
      kind:      "bulk_enquiry",
      venueSlug: slug,
      name:      String(name),
      phone:     String(phone),
      message:   "Bulk enquiry from venue comparison tool",
      sourceUrl: req.headers.get("referer") ?? undefined,
    }))
  );

  return NextResponse.json({ ok: true });
}
