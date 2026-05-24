import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { venuesTable, vendorsTable, getawaysTable, destinationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://venuees.in";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,                             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/venues`,                 lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/vendors`,                lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/weekend-getaways`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/destination-weddings`,   lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/event-management`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/real-weddings`,          lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/blog`,                   lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/about`,                  lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,                lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/list-your-business`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // City index pages
    { url: `${BASE}/venues/nagpur`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    // Locality pages
    { url: `${BASE}/venues/nagpur/wardha-road`,  lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/venues/nagpur/civil-lines`,  lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/venues/nagpur/ramdaspeth`,   lastModified: now, changeFrequency: "weekly", priority: 0.80 },
    { url: `${BASE}/venues/nagpur/koradi-road`,  lastModified: now, changeFrequency: "weekly", priority: 0.80 },
    { url: `${BASE}/venues/nagpur/mihan`,        lastModified: now, changeFrequency: "weekly", priority: 0.80 },
    { url: `${BASE}/venues/nagpur/katol-road`,   lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    // Event management sub-pages
    { url: `${BASE}/event-management/hospitality`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/event-management/corporate-events`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/event-management/celebrations`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/event-management/social`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // Vendor category pages
    { url: `${BASE}/vendors/photographers`,  lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/vendors/decorators`,     lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/vendors/makeup`,         lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/vendors/caterers`,       lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/vendors/music`,          lastModified: now, changeFrequency: "weekly", priority: 0.70 },
    { url: `${BASE}/vendors/mehendi`,        lastModified: now, changeFrequency: "weekly", priority: 0.70 },
    { url: `${BASE}/vendors/pandits`,        lastModified: now, changeFrequency: "weekly", priority: 0.65 },
  ];

  // ── Dynamic: Venues ─────────────────────────────────────────────────────────
  let venueUrls: MetadataRoute.Sitemap = [];
  try {
    const venues = await db
      .select({ slug: venuesTable.slug, locality: venuesTable.locality, citySlug: venuesTable.citySlug, updatedAt: venuesTable.updatedAt })
      .from(venuesTable)
      .where(eq(venuesTable.isActive, true));

    venueUrls = venues.map((v) => {
      const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
      return {
        url: `${BASE}/venues/${v.citySlug}/${localitySlug}/${v.slug}`,
        lastModified: v.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      };
    });
  } catch { /* DB not yet seeded — skip */ }

  // ── Dynamic: Vendors ────────────────────────────────────────────────────────
  let vendorUrls: MetadataRoute.Sitemap = [];
  try {
    const vendors = await db
      .select({ slug: vendorsTable.slug, categorySlug: vendorsTable.categorySlug, updatedAt: vendorsTable.updatedAt })
      .from(vendorsTable)
      .where(eq(vendorsTable.isActive, true));

    vendorUrls = vendors.map((v) => ({
      url: `${BASE}/vendors/${v.categorySlug}/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch { /* DB not yet seeded — skip */ }

  // ── Dynamic: Getaways ───────────────────────────────────────────────────────
  let getawayUrls: MetadataRoute.Sitemap = [];
  try {
    const getaways = await db
      .select({ slug: getawaysTable.slug, updatedAt: getawaysTable.updatedAt })
      .from(getawaysTable)
      .where(eq(getawaysTable.isActive, true));

    getawayUrls = getaways.map((g) => ({
      url: `${BASE}/weekend-getaways/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.70,
    }));
  } catch { /* DB not yet seeded — skip */ }

  // ── Dynamic: Destinations ──────────────────────────────────────────────────
  let destUrls: MetadataRoute.Sitemap = [];
  try {
    const destinations = await db
      .select({ slug: destinationsTable.slug, updatedAt: destinationsTable.updatedAt })
      .from(destinationsTable)
      .where(eq(destinationsTable.isActive, true));

    destUrls = destinations.map((d) => ({
      url: `${BASE}/destination-weddings/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.70,
    }));
  } catch { /* DB not yet seeded — skip */ }

  return [...statics, ...venueUrls, ...vendorUrls, ...getawayUrls, ...destUrls];
}
