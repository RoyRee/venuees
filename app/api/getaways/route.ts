import { NextResponse } from "next/server";
import { db, getawaysTable, getawayImagesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(getawaysTable)
      .where(eq(getawaysTable.isActive, true));

    const ids = rows.map((r) => r.id);
    const images = ids.length > 0
      ? await db
          .select({ getawayId: getawayImagesTable.getawayId, url: getawayImagesTable.url })
          .from(getawayImagesTable)
          .where(eq(getawayImagesTable.isPrimary, true))
      : [];

    const imageMap = new Map(images.map((i) => [i.getawayId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/getaways]", err);
    return NextResponse.json({ error: "Failed to fetch getaways" }, { status: 500 });
  }
}
