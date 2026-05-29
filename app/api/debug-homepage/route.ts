import { NextResponse } from "next/server";
import { getVenues, getGetaways, getDestinations, getRealWeddings } from "@/lib/db/queries";
import { getSiteConfig, getSiteContent, CONFIG_DEFAULTS, CONTENT_DEFAULTS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const steps: Record<string, unknown> = {};
  let failed = false;

  try {
    steps["getSiteConfig"] = "pending";
    const cfg = await getSiteConfig().catch((e: unknown) => { steps["getSiteConfig_error"] = String(e); return CONFIG_DEFAULTS; });
    steps["getSiteConfig"] = "ok";
    steps["cfg_keys"] = Object.keys(cfg).length;

    steps["getSiteContent"] = "pending";
    const sc = await getSiteContent().catch((e: unknown) => { steps["getSiteContent_error"] = String(e); return CONTENT_DEFAULTS; });
    steps["getSiteContent"] = "ok";
    steps["hero_images_type"] = Array.isArray(sc.hero_images) ? "array" : typeof sc.hero_images;
    steps["hero_images_length"] = Array.isArray(sc.hero_images) ? sc.hero_images.length : "N/A";
    steps["hero_stats_type"] = Array.isArray(sc.hero_stats) ? "array" : typeof sc.hero_stats;
    steps["hero_stats_length"] = Array.isArray(sc.hero_stats) ? sc.hero_stats.length : "N/A";
    steps["hero_carousel_interval"] = sc.hero_carousel_interval;
    steps["flagship_carousel_interval"] = sc.flagship_carousel_interval;

    steps["getVenues"] = "pending";
    const venues = await getVenues().catch((e: unknown) => { steps["getVenues_error"] = String(e); return []; });
    steps["getVenues"] = "ok";
    steps["venues_count"] = venues.length;
    steps["signatures_count"] = venues.filter((v) => v.isSignature).length;
    steps["featured_count"] = venues.filter((v) => !v.isSignature).slice(0, 4).length;

    // Check for null fields in venues that would crash rendering
    const badVenues = venues.filter((v) =>
      v.locality == null || v.vegPlate == null || v.name == null || v.slug == null
    );
    steps["venues_with_null_fields"] = badVenues.map((v) => ({ slug: v.slug, locality: v.locality, vegPlate: v.vegPlate }));

    steps["getGetaways"] = "pending";
    const getaways = await getGetaways().catch((e: unknown) => { steps["getGetaways_error"] = String(e); return []; });
    steps["getGetaways"] = "ok";
    steps["getaways_count"] = getaways.length;

    steps["getDestinations"] = "pending";
    const destinations = await getDestinations().catch((e: unknown) => { steps["getDestinations_error"] = String(e); return []; });
    steps["getDestinations"] = "ok";
    steps["destinations_count"] = destinations.length;

    steps["getRealWeddings"] = "pending";
    const realWeddings = await getRealWeddings().catch((e: unknown) => { steps["getRealWeddings_error"] = String(e); return []; });
    steps["getRealWeddings"] = "ok";
    steps["realWeddings_count"] = realWeddings.length;

  } catch (e: unknown) {
    failed = true;
    steps["unhandled_error"] = e instanceof Error
      ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8).join("\n") }
      : String(e);
  }

  return NextResponse.json({ failed, steps });
}
