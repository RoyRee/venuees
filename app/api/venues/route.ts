import { NextRequest, NextResponse } from "next/server";
import { db, venuesTable, venueImagesTable } from "@/lib/db";
import { eq, and, ilike, or } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city   = searchParams.get("city")   ?? undefined;
    const type   = searchParams.get("type")   ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const conditions = [eq(venuesTable.isActive, true)];
    if (city)   conditions.push(eq(venuesTable.citySlug, city));
    if (type)   conditions.push(eq(venuesTable.typeSlug, type));
    if (search) {
      conditions.push(
        or(
          ilike(venuesTable.name, `%${search}%`),
          ilike(venuesTable.locality, `%${search}%`),
          ilike(venuesTable.type, `%${search}%`),
        )!
      );
    }

    const rows = await db
      .select({
        id:            venuesTable.id,
        slug:          venuesTable.slug,
        name:          venuesTable.name,
        citySlug:      venuesTable.citySlug,
        locality:      venuesTable.locality,
        type:          venuesTable.type,
        typeSlug:      venuesTable.typeSlug,
        capacityMin:   venuesTable.capacityMin,
        capacityMax:   venuesTable.capacityMax,
        vegPlate:      venuesTable.vegPlate,
        nvPlate:       venuesTable.nvPlate,
        hallRent:      venuesTable.hallRent,
        rating:        venuesTable.rating,
        reviews:       venuesTable.reviews,
        bookingsMonth: venuesTable.bookingsMonth,
        tag:           venuesTable.tag,
        ph:            venuesTable.ph,
        scene:         venuesTable.scene,
        isSignature:   venuesTable.isSignature,
        parking:       venuesTable.parking,
        rooms:         venuesTable.rooms,
      })
      .from(venuesTable)
      .where(and(...conditions));

    // Fetch primary images for all returned venues in one query
    const venueIds = rows.map((r) => r.id);
    const primaryImages = venueIds.length > 0
      ? await db
          .select({ venueId: venueImagesTable.venueId, url: venueImagesTable.url })
          .from(venueImagesTable)
          .where(and(
            eq(venueImagesTable.isPrimary, true),
          ))
      : [];

    const imageMap = new Map(primaryImages.map((i) => [i.venueId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/venues]", err);
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
