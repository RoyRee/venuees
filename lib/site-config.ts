import { cache } from "react";
import { db, siteConfigTable } from "@/lib/db";
import { signatureResortsPhotos } from "@/lib/images";

// ── Config metadata (used in admin UI) ───────────────────────────────────────

export const CONFIG_META = {
  sections: [
    { key: "section_venues",           label: "Venues",               description: "Venue listing, detail pages, and venue cards on the homepage" },
    { key: "section_vendors",          label: "Vendors",               description: "Vendor directory and all category pages" },
    { key: "section_getaways",         label: "Weekend Getaways",      description: "Getaway hub page and individual property pages" },
    { key: "section_destinations",     label: "Destination Weddings",  description: "Destination wedding hub and city detail pages" },
    { key: "section_real_weddings",    label: "Real Weddings",         description: "Wedding story archive and individual couple pages" },
    { key: "section_blog",             label: "Blog / Journal",        description: "Blog articles and the journal section" },
    { key: "section_event_management", label: "Event Management",      description: "Event management guides and service pages" },
    { key: "section_how_it_works",     label: "How It Works",          description: "Four-step process section on the homepage" },
    { key: "section_testimonial",      label: "Testimonial",           description: "Couple's quote section on the homepage" },
    { key: "section_trust_banner",     label: "Trust Banner Stats",    description: "The five statistics shown below the hero search box" },
  ],
  features: [
    { key: "feature_reviews",      label: "Ratings & Reviews",    description: "Star ratings and review counts on all listings" },
    { key: "feature_enquiries",    label: "Enquiry Forms",         description: "Contact and booking forms on venue, vendor and getaway pages" },
    { key: "feature_newsletter",   label: "Newsletter Signup",     description: "Newsletter subscription prompts in footer" },
    { key: "feature_saved",        label: "Save to Favourites",    description: "Heart icon to save listings to a user's account" },
    { key: "feature_applications", label: "List Your Business",    description: "Application form for venues and vendors to join the platform" },
    { key: "feature_search",       label: "Site Search",           description: "Search overlay accessible from the navigation bar" },
  ],
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type SectionKey =
  | "section_venues" | "section_vendors" | "section_getaways"
  | "section_destinations" | "section_real_weddings"
  | "section_blog" | "section_event_management"
  | "section_how_it_works" | "section_testimonial" | "section_trust_banner";

type FeatureKey =
  | "feature_reviews" | "feature_enquiries" | "feature_newsletter"
  | "feature_saved" | "feature_applications" | "feature_search";

export type SiteConfigKey = SectionKey | FeatureKey;
export type SiteConfig = Record<SiteConfigKey, boolean>;

export const CONFIG_DEFAULTS: SiteConfig = {
  section_venues:           true,
  section_vendors:          true,
  section_getaways:         true,
  section_destinations:     true,
  section_real_weddings:    true,
  section_blog:             true,
  section_event_management: true,
  section_how_it_works:     true,
  section_testimonial:      true,
  section_trust_banner:     true,
  feature_reviews:          true,
  feature_enquiries:        true,
  feature_newsletter:       true,
  feature_saved:            true,
  feature_applications:     true,
  feature_search:           true,
};

// ── Single shared DB read — both getSiteConfig and getSiteContent call this ───

const getAllSiteRows = cache(async (): Promise<{ key: string; value: string }[]> => {
  try {
    return await db.select().from(siteConfigTable);
  } catch {
    return [];
  }
});

// ── Reader (memoised per request via React cache) ─────────────────────────────

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const rows = await getAllSiteRows();
  const config: SiteConfig = { ...CONFIG_DEFAULTS };
  for (const row of rows) {
    if (row.key in config) {
      (config as Record<string, boolean>)[row.key] = row.value === "true";
    }
  }
  return config;
});

// ── Site content (JSON-valued, separate from boolean toggles) ─────────────────

export type HeroStat = { num: string; label: string };
export type FilterVenueType = { slug: string; label: string };

export type SiteContent = {
  hero_images: string[];
  hero_carousel_interval: number;
  hero_stats: HeroStat[];
  flagship_carousel_interval: number;
  filter_venue_types: FilterVenueType[];
  filter_localities: string[];
};

export const CONTENT_DEFAULTS: SiteContent = {
  hero_images: [signatureResortsPhotos.hero],
  hero_carousel_interval: 5000,
  hero_stats: [
    { num: "42",     label: "Handpicked venues" },
    { num: "7,800+", label: "Weddings hosted" },
    { num: "4.86",   label: "Avg. couple rating" },
    { num: "₹0",     label: "Platform fee" },
    { num: "18yr",   label: "Nagpur operators" },
  ],
  flagship_carousel_interval: 6000,
  filter_venue_types: [
    { slug: "hotel",     label: "Hotels & ballrooms" },
    { slug: "lawn",      label: "Lawns & banquets" },
    { slug: "resort",    label: "Resorts" },
    { slug: "heritage",  label: "Heritage venues" },
    { slug: "farmhouse", label: "Farmhouses" },
    { slug: "banquet",   label: "Banquet halls" },
  ],
  filter_localities: [
    "Wardha Road", "Ramdaspeth", "Civil Lines",
    "Koradi Road", "Katol Road", "MIHAN",
  ],
};

const CONTENT_KEYS = new Set([
  "hero_images", "hero_carousel_interval", "hero_stats", "flagship_carousel_interval",
  "filter_venue_types", "filter_localities",
]);

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const rows = await getAllSiteRows();
  const content: SiteContent = JSON.parse(JSON.stringify(CONTENT_DEFAULTS));
  for (const row of rows) {
    if (!CONTENT_KEYS.has(row.key)) continue;
    try {
      const parsed = JSON.parse(row.value);
      if (row.key === "hero_images" && !Array.isArray(parsed)) continue;
      if (row.key === "hero_stats" && !Array.isArray(parsed)) continue;
      if (row.key === "hero_carousel_interval" && typeof parsed !== "number") continue;
      if (row.key === "flagship_carousel_interval" && typeof parsed !== "number") continue;
      (content as Record<string, unknown>)[row.key] = parsed;
    } catch { /* ignore malformed JSON */ }
  }
  return content;
});
