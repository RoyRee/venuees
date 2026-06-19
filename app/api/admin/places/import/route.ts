import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db } from "@/lib/db";
import { venuesTable, venueImagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlaceDetails } from "@/lib/google-places";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (true) {
    const [existing] = await db.select({ id: venuesTable.id }).from(venuesTable).where(eq(venuesTable.slug, slug)).limit(1);
    if (!existing) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured" }, { status: 503 });
  }

  const { placeId, citySlug, type, typeSlug } = await request.json();
  if (!placeId || !citySlug || !type || !typeSlug) {
    return NextResponse.json({ error: "placeId, citySlug, type, typeSlug are required" }, { status: 400 });
  }

  const details = await getPlaceDetails(placeId);
  if (!details) return NextResponse.json({ error: "Could not fetch place details" }, { status: 502 });

  const slug = await uniqueSlug(slugify(details.name));

  const [venue] = await db.insert(venuesTable).values({
    slug,
    name: details.name,
    citySlug,
    locality: details.locality || details.address,
    address: details.address,
    type,
    typeSlug,
    description: "",
    tag: "New",
    scene: details.locality ?? "",
    contactPhone: details.phone ?? null,
    rating: details.rating ? details.rating.toFixed(1) : "0",
    reviews: details.reviewCount ?? 0,
    isActive: true,
    meta: {
      googlePlaceId: placeId,
      googleMapsUrl: details.mapsUrl,
      googleRating: details.rating,
      googleReviewCount: details.reviewCount,
      importedFromPlaces: true,
    },
  }).returning({ id: venuesTable.id, slug: venuesTable.slug });

  if (details.photoRefs.length > 0) {
    await db.insert(venueImagesTable).values(
      details.photoRefs.slice(0, 5).map((ref, i) => ({
        venueId: venue.id,
        url: `/api/place-photo?ref=${encodeURIComponent(ref)}`,
        alt: details.name,
        isPrimary: i === 0,
        order: i,
      }))
    );
  }

  return NextResponse.json({ ok: true, slug: venue.slug });
}
