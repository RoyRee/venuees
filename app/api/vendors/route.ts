import { NextRequest, NextResponse } from "next/server";
import { db, vendorsTable, vendorImagesTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const city     = searchParams.get("city")     ?? undefined;

    const conditions = [eq(vendorsTable.isActive, true)];
    if (category) conditions.push(eq(vendorsTable.categorySlug, category));
    if (city)     conditions.push(eq(vendorsTable.city, city));

    const rows = await db
      .select()
      .from(vendorsTable)
      .where(and(...conditions));

    // Primary images in one query
    const vendorIds = rows.map((r) => r.id);
    const images = vendorIds.length > 0
      ? await db
          .select({ vendorId: vendorImagesTable.vendorId, url: vendorImagesTable.url })
          .from(vendorImagesTable)
          .where(eq(vendorImagesTable.isPrimary, true))
      : [];

    const imageMap = new Map(images.map((i) => [i.vendorId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/vendors]", err);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
