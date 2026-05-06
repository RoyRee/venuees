import { NextRequest, NextResponse } from "next/server";
import { db, venuesTable, venueHallsTable, venueImagesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const venue = await db
      .select()
      .from(venuesTable)
      .where(eq(venuesTable.slug, slug))
      .limit(1);

    if (!venue.length) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const [halls, images] = await Promise.all([
      db.select().from(venueHallsTable).where(eq(venueHallsTable.venueId, venue[0].id)),
      db.select().from(venueImagesTable).where(eq(venueImagesTable.venueId, venue[0].id)),
    ]);

    return NextResponse.json({ ...venue[0], halls, images });
  } catch (err) {
    console.error("[GET /api/venues/[slug]]", err);
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
  }
}
