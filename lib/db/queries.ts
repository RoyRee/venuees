import { cache } from "react";
import { db, venuesTable, venueHallsTable, venueImagesTable, vendorsTable, vendorImagesTable, getawaysTable, destinationsTable, realWeddingsTable, enquiriesTable } from "@/lib/db";
import { eq, and, or, ilike, gte, lte, sql, asc, desc, inArray, notInArray, SQL } from "drizzle-orm";
import type { Venue, Vendor, Getaway, Destination, RealWedding, PhTheme, VenueMeta } from "@/lib/data";
import { CATEGORY_SLUG_ALIASES } from "@/lib/vendor-categories";

// ─── Venues ──────────────────────────────────────────────────────────────────

type HallRow = Pick<typeof venueHallsTable.$inferSelect, "name" | "ph" | "type" | "area" | "theatre" | "floating" | "dining">;

function toHall(h: HallRow) {
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

// Explicit column list — does NOT include meta, ownerUserId, or contact fields.
// This means the query works whether or not the meta column exists in the DB.
const VENUE_COLS = {
  id:            venuesTable.id,
  slug:          venuesTable.slug,
  name:          venuesTable.name,
  citySlug:      venuesTable.citySlug,
  locality:      venuesTable.locality,
  address:       venuesTable.address,
  type:          venuesTable.type,
  typeSlug:      venuesTable.typeSlug,
  capacityMin:   venuesTable.capacityMin,
  capacityMax:   venuesTable.capacityMax,
  vegPlate:      venuesTable.vegPlate,
  nvPlate:       venuesTable.nvPlate,
  hallRent:      venuesTable.hallRent,
  minGuarantee:  venuesTable.minGuarantee,
  rating:        venuesTable.rating,
  reviews:       venuesTable.reviews,
  bookingsMonth: venuesTable.bookingsMonth,
  tag:           venuesTable.tag,
  description:   venuesTable.description,
  ph:            venuesTable.ph,
  scene:         venuesTable.scene,
  amenities:     venuesTable.amenities,
  isSignature:   venuesTable.isSignature,
  parking:       venuesTable.parking,
  rooms:         venuesTable.rooms,
  isActive:      venuesTable.isActive,
};

type VenueRow = typeof VENUE_COLS extends Record<string, unknown>
  ? { [K in keyof typeof VENUE_COLS]: K extends "rating" ? string : K extends "amenities" ? unknown : K extends "rooms" ? number | null : K extends "isSignature" | "isActive" ? boolean : K extends "id" | "capacityMin" | "capacityMax" | "vegPlate" | "nvPlate" | "hallRent" | "minGuarantee" | "reviews" | "bookingsMonth" | "parking" ? number : string }
  : never;

function toVenue(r: { id: number; slug: string; name: string; citySlug: string; locality: string; address: string; type: string; typeSlug: string; capacityMin: number; capacityMax: number; vegPlate: number; nvPlate: number; hallRent: number; minGuarantee: number; rating: string; reviews: number; bookingsMonth: number; tag: string; description: string; ph: string; scene: string; amenities: unknown; isSignature: boolean; parking: number; rooms: number | null; isActive: boolean }, halls: HallRow[], meta?: VenueMeta | null, heroImage?: string | null): Venue {
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
    meta: meta ?? undefined,
    heroImage: heroImage ?? undefined,
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

// Application businessTypes for getaways land in venuesTable with these
// typeSlugs. They're shown on /weekend-getaways, not in the venues list.
const GETAWAY_TYPE_SLUGS = ["resort-hotel", "farmstay", "heritage-property", "villa-bungalow"];

export async function getVenues(params?: VenueFiltersInput): Promise<Venue[]> {
  const conds: SQL[] = [
    eq(venuesTable.isActive, true),
    notInArray(venuesTable.typeSlug, GETAWAY_TYPE_SLUGS),
  ];

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
    .select(VENUE_COLS)
    .from(venuesTable)
    .where(and(...conds))
    .orderBy(orderClause);

  if (!rows.length) return [];
  const venueIds = rows.map((r) => r.id);

  const [allHalls, allHeroImages] = await Promise.all([
    db
      .select({ venueId: venueHallsTable.venueId, name: venueHallsTable.name, ph: venueHallsTable.ph, type: venueHallsTable.type, area: venueHallsTable.area, theatre: venueHallsTable.theatre, floating: venueHallsTable.floating, dining: venueHallsTable.dining })
      .from(venueHallsTable)
      .where(inArray(venueHallsTable.venueId, venueIds))
      .orderBy(venueHallsTable.order),
    db
      .select({ venueId: venueImagesTable.venueId, url: venueImagesTable.url })
      .from(venueImagesTable)
      .where(inArray(venueImagesTable.venueId, venueIds))
      .orderBy(venueImagesTable.order, venueImagesTable.id)
      .catch(() => [] as { venueId: number; url: string }[]),
  ]);

  const byVenue = new Map<number, HallRow[]>();
  for (const h of allHalls) {
    if (!byVenue.has(h.venueId)) byVenue.set(h.venueId, []);
    byVenue.get(h.venueId)!.push(h);
  }

  // First uploaded image per venue (already ordered by order ASC)
  const heroByVenue = new Map<number, string>();
  for (const img of allHeroImages) {
    if (!heroByVenue.has(img.venueId)) heroByVenue.set(img.venueId, img.url);
  }

  return rows.map((r) => toVenue(r, byVenue.get(r.id) ?? [], undefined, heroByVenue.get(r.id)));
}

// Wrapped in React cache() so generateMetadata + page render share one result per request.
export const getVenueBySlug = cache(async (slug: string): Promise<Venue | null> => {
  const [venueRows, hallRows, metaRows] = await Promise.all([
    db.select(VENUE_COLS).from(venuesTable).where(eq(venuesTable.slug, slug)).limit(1),
    db
      .select({ name: venueHallsTable.name, ph: venueHallsTable.ph, type: venueHallsTable.type, area: venueHallsTable.area, theatre: venueHallsTable.theatre, floating: venueHallsTable.floating, dining: venueHallsTable.dining })
      .from(venueHallsTable)
      .innerJoin(venuesTable, eq(venueHallsTable.venueId, venuesTable.id))
      .where(eq(venuesTable.slug, slug))
      .orderBy(venueHallsTable.order),
    // Separate query for meta so it fails independently if column doesn't exist yet.
    db.select({ meta: venuesTable.meta }).from(venuesTable).where(eq(venuesTable.slug, slug)).limit(1)
      .catch(() => null),
  ]);
  if (!venueRows.length) return null;
  const meta = metaRows?.[0]?.meta as VenueMeta | null | undefined;
  return toVenue(venueRows[0], hallRows, meta);
});

// ─── Vendors ─────────────────────────────────────────────────────────────────

function toVendor(r: typeof vendorsTable.$inferSelect, heroImage?: string): Vendor {
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
    description: r.description,
    heroImage: heroImage,
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
  if (p.categorySlug) {
    // Match legacy slug variants too (e.g. "photography" rows created before
    // the businessType → category mapping existed).
    const aliases = CATEGORY_SLUG_ALIASES[p.categorySlug] ?? [p.categorySlug];
    conds.push(inArray(vendorsTable.categorySlug, aliases));
  }
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

  const vendorIds = rows.map((r) => r.id);
  const allImages = vendorIds.length > 0
    ? await db
        .select({ vendorId: vendorImagesTable.vendorId, url: vendorImagesTable.url })
        .from(vendorImagesTable)
        .where(inArray(vendorImagesTable.vendorId, vendorIds))
        .orderBy(vendorImagesTable.order)
    : [];

  const heroByVendor = new Map<number, string>();
  for (const img of allImages) {
    if (!heroByVendor.has(img.vendorId)) heroByVendor.set(img.vendorId, img.url);
  }

  return rows.map((r) => toVendor(r, heroByVendor.get(r.id)));
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

// Vendor-submitted getaways are approved into venuesTable (so the owner can
// manage them from the dashboard like any other listing). Map those rows into
// the Getaway shape; the application form repurposes vegPlate/nvPlate as the
// weekday/weekend rates and capacityMin as the room count.
function venueRowToGetaway(r: { slug: string; name: string; locality: string; rooms: number | null; capacityMax: number; vegPlate: number; nvPlate: number; rating: string; reviews: number; ph: string; scene: string; description: string }): Getaway {
  return {
    slug: r.slug,
    name: r.name,
    location: r.locality,
    hoursFromNagpur: "—",
    beds: r.rooms ?? 0,
    guests: r.capacityMax,
    weekday: r.vegPlate,
    weekend: r.nvPlate,
    rating: parseFloat(r.rating),
    reviews: r.reviews,
    ph: r.ph as PhTheme,
    scene: r.scene,
    tagline: r.description.slice(0, 90),
  };
}

const GETAWAY_VENUE_COLS = {
  slug: venuesTable.slug, name: venuesTable.name, locality: venuesTable.locality,
  rooms: venuesTable.rooms, capacityMax: venuesTable.capacityMax,
  vegPlate: venuesTable.vegPlate, nvPlate: venuesTable.nvPlate,
  rating: venuesTable.rating, reviews: venuesTable.reviews,
  ph: venuesTable.ph, scene: venuesTable.scene, description: venuesTable.description,
};

export async function getGetaways(params?: { maxBudget?: number; minBeds?: number; sort?: string }): Promise<Getaway[]> {
  const conds: SQL[] = [eq(getawaysTable.isActive, true)];
  if (params?.maxBudget) conds.push(lte(getawaysTable.weekday, params.maxBudget));
  if (params?.minBeds)   conds.push(gte(getawaysTable.beds, params.minBeds));

  const orderClause =
    params?.sort === "price-asc"  ? asc(getawaysTable.weekday)
    : params?.sort === "price-desc" ? desc(getawaysTable.weekday)
    : params?.sort === "rating"     ? desc(sql`CAST(${getawaysTable.rating} AS numeric)`)
    : asc(getawaysTable.weekday); // default: cheapest first

  const venueConds: SQL[] = [
    eq(venuesTable.isActive, true),
    inArray(venuesTable.typeSlug, GETAWAY_TYPE_SLUGS),
  ];
  if (params?.maxBudget) venueConds.push(lte(venuesTable.vegPlate, params.maxBudget));
  if (params?.minBeds)   venueConds.push(gte(venuesTable.rooms, params.minBeds));

  const [rows, venueRows] = await Promise.all([
    db.select().from(getawaysTable).where(and(...conds)).orderBy(orderClause),
    db.select(GETAWAY_VENUE_COLS).from(venuesTable).where(and(...venueConds)),
  ]);

  const merged = [...rows.map(toGetaway), ...venueRows.map(venueRowToGetaway)];
  // Re-sort the merged list so vendor-submitted getaways respect the sort too
  if (params?.sort === "price-desc")   merged.sort((a, b) => b.weekday - a.weekday);
  else if (params?.sort === "rating")  merged.sort((a, b) => b.rating - a.rating);
  else                                 merged.sort((a, b) => a.weekday - b.weekday);
  return merged;
}

export async function getGetawayBySlug(slug: string): Promise<Getaway | null> {
  const rows = await db.select().from(getawaysTable).where(eq(getawaysTable.slug, slug)).limit(1);
  if (rows.length) return toGetaway(rows[0]);
  // Fall back to vendor-submitted getaways stored in venuesTable
  const venueRows = await db.select(GETAWAY_VENUE_COLS).from(venuesTable)
    .where(and(eq(venuesTable.slug, slug), inArray(venuesTable.typeSlug, GETAWAY_TYPE_SLUGS), eq(venuesTable.isActive, true)))
    .limit(1)
    .catch(() => []);
  if (!venueRows.length) return null;
  return venueRowToGetaway(venueRows[0]);
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

// ─── Social proof ─────────────────────────────────────────────────────────────

/** Enquiry counts per venue slug for the last 7 days. Used for social-proof badges. */
export async function getRecentEnquiryCounts(): Promise<Map<string, number>> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      venueSlug: enquiriesTable.venueSlug,
      count: sql<number>`count(*)::int`,
    })
    .from(enquiriesTable)
    .where(and(gte(enquiriesTable.createdAt, since), sql`${enquiriesTable.venueSlug} is not null`))
    .groupBy(enquiriesTable.venueSlug)
    .catch(() => [] as { venueSlug: string | null; count: number }[]);

  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.venueSlug) map.set(r.venueSlug, r.count);
  }
  return map;
}
