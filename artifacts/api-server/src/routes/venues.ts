import { Router } from "express";
import { db } from "@workspace/db";
import { venuesTable, venueHallsTable, venueImagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/venues", async (req, res) => {
  try {
    const { city, type, search } = req.query as Record<string, string>;

    let query = db
      .select({
        id: venuesTable.id,
        slug: venuesTable.slug,
        name: venuesTable.name,
        citySlug: venuesTable.citySlug,
        locality: venuesTable.locality,
        type: venuesTable.type,
        typeSlug: venuesTable.typeSlug,
        capacityMin: venuesTable.capacityMin,
        capacityMax: venuesTable.capacityMax,
        vegPlate: venuesTable.vegPlate,
        nvPlate: venuesTable.nvPlate,
        hallRent: venuesTable.hallRent,
        rating: venuesTable.rating,
        reviews: venuesTable.reviews,
        bookingsMonth: venuesTable.bookingsMonth,
        tag: venuesTable.tag,
        ph: venuesTable.ph,
        isSignature: venuesTable.isSignature,
        parking: venuesTable.parking,
        rooms: venuesTable.rooms,
      })
      .from(venuesTable)
      .where(eq(venuesTable.isActive, true))
      .$dynamic();

    const rows = await query;

    // Fetch primary images for all venues
    const venueIds = rows.map((r) => r.id);
    let primaryImages: { venueId: number; url: string }[] = [];
    if (venueIds.length > 0) {
      const imgs = await db
        .select({ venueId: venueImagesTable.venueId, url: venueImagesTable.url })
        .from(venueImagesTable)
        .where(eq(venueImagesTable.isPrimary, true));
      primaryImages = imgs;
    }

    const imageMap = new Map(primaryImages.map((i) => [i.venueId, i.url]));

    let result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));

    if (city) result = result.filter((r) => r.citySlug === city);
    if (type) result = result.filter((r) => r.typeSlug === type);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.locality.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch venues" });
  }
});

router.get("/venues/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const venue = await db
      .select()
      .from(venuesTable)
      .where(eq(venuesTable.slug, slug))
      .limit(1);

    if (!venue.length) {
      res.status(404).json({ message: "Venue not found" });
      return;
    }

    const [halls, images] = await Promise.all([
      db.select().from(venueHallsTable).where(eq(venueHallsTable.venueId, venue[0].id)),
      db.select().from(venueImagesTable).where(eq(venueImagesTable.venueId, venue[0].id)),
    ]);

    res.json({ ...venue[0], halls, images });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch venue" });
  }
});

export default router;
