import { db, venuesTable, venueHallsTable, vendorsTable, getawaysTable, destinationsTable, realWeddingsTable } from "@/lib/db";
import { eq, and, or, ilike, gte, lte, sql, asc, desc, SQL } from "drizzle-orm";
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

export interface VenueFiltersInput {
  q?: string;
  types?: string[];        // typeSlug values
  localities?: string[];   // e.g. ["Wardha Road"]
  minCap?: number;         // capacityMax >= minCap
  maxVegPlate?: number;    // vegPlate <= maxVegPlate
  minRating?: number;      // 4.5 | 4.8
  hasRooms?: boolean;      // rooms > 0
  hasParking?: boolean;    // parking >= 100
  hasBar?: boolean;
  hasDJ?: boolean;
  hasGenerator?: boolean;
  hasCatering?: boolean;
  sort?: string;           // "price-asc" | "price-desc" | "rating" | "bookings"
}

export async function getVenues(params?: VenueFiltersInput): Promise<Venue[]> {
  const conds: SQL[] = [eq(venuesTable.isActive, true)];

  // Text search
  if (params?.q?.trim()) {
    const q = params.q.trim();
    conds.push(
      or(
        ilike(venuesTable.name,     `%${q}%`),
        ilike(venuesTable.locality, `%${q}%`),
        ilike(venuesTable.typeSlug, `%${q}%`),
        ilike(venuesTable.type,     `%${q}%`),
      ) as SQL
    );
  }

  // Type filter (multi-select OR)
  if (params?.types?.length) {
    conds.push(or(...params.types.map(t => eq(venuesTable.typeSlug, t))) as SQL);
  }

  // Locality filter (multi-select OR, ilike because stored as "Wardha Road, Nagpur")
  if (params?.localities?.length) {
    conds.push(or(...params.localities.map(l => ilike(venuesTable.locality, `%${l}%`))) as SQL);
  }

  // Capacity: at least minCap guests can be seated
  if (params?.minCap) {
    conds.push(gte(venuesTable.capacityMax, params.minCap));
  }

  // Veg plate budget cap
  if (params?.maxVegPlate) {
    conds.push(lte(venuesTable.vegPlate, params.maxVegPlate));
  }

  // Rating floor (rating stored as text e.g. "4.9")
  if (params?.minRating) {
    conds.push(sql`CAST(${venuesTable.rating} AS numeric) >= ${params.minRating}`);
  }

  // Must-haves
  if (params?.hasRooms)    conds.push(sql`${venuesTable.rooms} > 0`);
  if (params?.hasParking)  conds.push(gte(venuesTable.parking, 100));
  if (params?.hasBar)      conds.push(sql`${venuesTable.amenities}::text ilike '%bar%'`);
  if (params?.hasDJ)       conds.push(sql`${venuesTable.amenities}::text ilike '%dj%'`);
  if (params?.hasGenerator) conds.push(sql`${venuesTable.amenities}::text ilike '%generator%'`);
  if (params?.hasCatering) conds.push(sql`${venuesTable.amenities}::text ilike '%kitchen%'`);

  // Sort
  const orderClause =
    params?.sort === "price-asc"  ? asc(venuesTable.vegPlate)
    : params?.sort === "price-desc" ? desc(venuesTable.vegPlate)
    : params?.sort === "rating"     ? desc(sql`CAST(${venuesTable.rating} AS numeric)`)
    : params?.sort === "bookings"   ? desc(venuesTable.bookingsMonth)
    : desc(venuesTable.isSignature); // default: signature first

  const rows = await db
    .select()
    .from(venuesTable)
    .where(and(...conds))
    .orderBy(orderClause);

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

export interface VendorFiltersInput {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minYears?: number;   // 2 | 5 | 10
  locality?: string;
  minRating?: number;
  sort?: string;       // "price-asc" | "price-desc" | "rating" | "bookings"
}

export async function getVendors(params?: VendorFiltersInput | string): Promise<Vendor[]> {
  // Backwards-compatible: if a plain string is passed treat it as categorySlug
  const p: VendorFiltersInput = typeof params === "string" ? { categorySlug: params } : (params ?? {});

  const conds: SQL[] = [eq(vendorsTable.isActive, true)];
  if (p.categorySlug) conds.push(eq(vendorsTable.categorySlug, p.categorySlug));
  if (p.minPrice)     conds.push(gte(vendorsTable.priceFrom, p.minPrice));
  if (p.maxPrice)     conds.push(lte(vendorsTable.priceFrom, p.maxPrice));
  if (p.minYears)     conds.push(gte(vendorsTable.yearsExp, p.minYears));
  if (p.locality)     conds.push(ilike(vendorsTable.locality, `%${p.locality}%`));
  if (p.minRating)    conds.push(sql`CAST(${vendorsTable.rating} AS numeric) >= ${p.minRating}`);

  const orderClause =
    p.sort === "price-asc"  ? asc(vendorsTable.priceFrom)
    : p.sort === "price-desc" ? desc(vendorsTable.priceFrom)
    : p.sort === "rating"     ? desc(sql`CAST(${vendorsTable.rating} AS numeric)`)
    : p.sort === "bookings"   ? desc(vendorsTable.completed)
    : desc(vendorsTable.completed); // default: most completed

  const rows = await db
    .select()
    .from(vendorsTable)
    .where(and(...conds))
    .orderBy(orderClause);

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

export async function getGetaways(params?: { maxBudget?: number; minBeds?: number; sort?: string }): Promise<Getaway[]> {
  const conds: SQL[] = [eq(getawaysTable.isActive, true)];
  if (params?.maxBudget) conds.push(lte(getawaysTable.weekday, params.maxBudget));
  if (params?.minBeds)   conds.push(gte(getawaysTable.beds, params.minBeds));

  const orderClause =
    params?.sort === "price-asc"  ? asc(getawaysTable.weekday)
    : params?.sort === "price-desc" ? desc(getawaysTable.weekday)
    : params?.sort === "rating"     ? desc(sql`CAST(${getawaysTable.rating} AS numeric)`)
    : asc(getawaysTable.weekday); // default: cheapest first

  const rows = await db
    .select()
    .from(getawaysTable)
    .where(and(...conds))
    .orderBy(orderClause);
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
