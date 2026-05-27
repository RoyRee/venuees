import { db, venuesTable, venueHallsTable, vendorsTable, getawaysTable, destinationsTable, realWeddingsTable } from "@/lib/db";
import { eq, and, or, ilike } from "drizzle-orm";
import type { Venue, Vendor, Getaway, Destination, RealWedding, PhTheme } from "@/lib/data";

// ─── Venues ──────────────────────────────────────────────────────────────────

function toHall(h: typeof venueHallsTable.$inferSelect) {
  return {
    name: h.name,
    ph: h.ph as PhTheme,
    type: h.type,
    area: h.area,
    theatre: h.theatre,
    floating: h.floating,
    dining: h.dining,
  };
}

function toVenue(r: typeof venuesTable.$inferSelect, halls: typeof venueHallsTable.$inferSelect[]): Venue {
  return {
    slug: r.slug,
    name: r.name,
    citySlug: r.citySlug,
    locality: r.locality,
    address: r.address,
    type: r.type,
    typeSlug: r.typeSlug,
    capacity: { min: r.capacityMin, max: r.capacityMax },
    vegPlate: r.vegPlate,
    nvPlate: r.nvPlate,
    hallRent: r.hallRent,
    minGuarantee: r.minGuarantee,
    rating: parseFloat(r.rating),
    reviews: r.reviews,
    bookingsMonth: r.bookingsMonth,
    tag: r.tag,
    description: r.description,
    ph: r.ph as PhTheme,
    scene: r.scene,
    amenities: (r.amenities as string[]) ?? [],
    isSignature: r.isSignature,
    parking: r.parking,
    rooms: r.rooms ?? undefined,
    halls: halls.map(toHall),
  };
}

export async function getVenues(q?: string): Promise<Venue[]> {
  const conditions = q?.trim()
    ? and(
        eq(venuesTable.isActive, true),
        or(
          ilike(venuesTable.name,     `%${q}%`),
          ilike(venuesTable.locality, `%${q}%`),
          ilike(venuesTable.typeSlug, `%${q}%`),
          ilike(venuesTable.type,     `%${q}%`),
        )
      )
    : eq(venuesTable.isActive, true);
  const rows = await db.select().from(venuesTable).where(conditions);
  if (!rows.length) return [];
  const allHalls = await db.select().from(venueHallsTable);
  const byVenue = new Map<number, typeof allHalls>();
  for (const h of allHalls) {
    if (!byVenue.has(h.venueId)) byVenue.set(h.venueId, []);
    byVenue.get(h.venueId)!.push(h);
  }
  return rows.map((r) => toVenue(r, byVenue.get(r.id) ?? []));
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const rows = await db.select().from(venuesTable).where(eq(venuesTable.slug, slug)).limit(1);
  if (!rows.length) return null;
  const r = rows[0];
  const halls = await db.select().from(venueHallsTable).where(eq(venueHallsTable.venueId, r.id));
  return toVenue(r, halls);
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

function toVendor(r: typeof vendorsTable.$inferSelect): Vendor {
  return {
    slug: r.slug,
    category: r.category,
    categorySlug: r.categorySlug,
    name: r.name,
    city: r.city,
    locality: r.locality,
    rating: parseFloat(r.rating),
    reviews: r.reviews,
    priceFrom: r.priceFrom,
    completed: r.completed,
    yearsExp: r.yearsExp,
    ph: r.ph as PhTheme,
    scene: r.scene,
    tagline: r.tagline,
  };
}

export async function getVendors(categorySlug?: string): Promise<Vendor[]> {
  const conditions = [eq(vendorsTable.isActive, true)];
  if (categorySlug) conditions.push(eq(vendorsTable.categorySlug, categorySlug));
  const rows = await db.select().from(vendorsTable).where(and(...conditions));
  return rows.map(toVendor);
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const rows = await db.select().from(vendorsTable).where(eq(vendorsTable.slug, slug)).limit(1);
  if (!rows.length) return null;
  return toVendor(rows[0]);
}

// ─── Getaways ────────────────────────────────────────────────────────────────

function toGetaway(r: typeof getawaysTable.$inferSelect): Getaway {
  return {
    slug: r.slug,
    name: r.name,
    location: r.location,
    hoursFromNagpur: r.hoursFromNagpur,
    beds: r.beds,
    guests: r.guests,
    weekday: r.weekday,
    weekend: r.weekend,
    rating: parseFloat(r.rating),
    reviews: r.reviews,
    ph: r.ph as PhTheme,
    scene: r.scene,
    tagline: r.tagline,
  };
}

export async function getGetaways(): Promise<Getaway[]> {
  const rows = await db.select().from(getawaysTable).where(eq(getawaysTable.isActive, true));
  return rows.map(toGetaway);
}

export async function getGetawayBySlug(slug: string): Promise<Getaway | null> {
  const rows = await db.select().from(getawaysTable).where(eq(getawaysTable.slug, slug)).limit(1);
  if (!rows.length) return null;
  return toGetaway(rows[0]);
}

// ─── Destinations ─────────────────────────────────────────────────────────────

function toDestination(r: typeof destinationsTable.$inferSelect): Destination {
  return {
    slug: r.slug,
    city: r.city,
    tag: r.tag,
    ph: r.ph as PhTheme,
    venues: r.venues,
    from: r.priceFrom,
    feat: r.feat,
  };
}

export async function getDestinations(): Promise<Destination[]> {
  const rows = await db.select().from(destinationsTable).where(eq(destinationsTable.isActive, true));
  return rows.map(toDestination);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const rows = await db.select().from(destinationsTable).where(eq(destinationsTable.slug, slug)).limit(1);
  if (!rows.length) return null;
  return toDestination(rows[0]);
}

// ─── Real Weddings ────────────────────────────────────────────────────────────

function toRealWedding(r: typeof realWeddingsTable.$inferSelect): RealWedding {
  return {
    slug: r.slug,
    couple: r.couple,
    venue: r.venue,
    date: r.date,
    guests: r.guests,
    ph: r.ph as PhTheme,
    scene: r.scene,
    quote: r.quote ?? undefined,
  };
}

export async function getRealWeddings(): Promise<RealWedding[]> {
  const rows = await db.select().from(realWeddingsTable).where(eq(realWeddingsTable.isActive, true));
  return rows.map(toRealWedding);
}

export async function getRealWeddingBySlug(slug: string): Promise<RealWedding | null> {
  const rows = await db.select().from(realWeddingsTable).where(eq(realWeddingsTable.slug, slug)).limit(1);
  if (!rows.length) return null;
  return toRealWedding(rows[0]);
}
