import { NextRequest, NextResponse } from "next/server";
import { db, getawaysTable, getawayImagesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const getaway = await db
      .select()
      .from(getawaysTable)
      .where(eq(getawaysTable.slug, slug))
      .limit(1);

    if (!getaway.length) {
      return NextResponse.json({ error: "Getaway not found" }, { status: 404 });
    }

    const images = await db
      .select()
      .from(getawayImagesTable)
      .where(eq(getawayImagesTable.getawayId, getaway[0].id));

    return NextResponse.json({ ...getaway[0], images });
  } catch (err) {
    console.error("[GET /api/getaways/[slug]]", err);
    return NextResponse.json({ error: "Failed to fetch getaway" }, { status: 500 });
  }
}
