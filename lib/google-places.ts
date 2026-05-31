import { unstable_cache } from "next/cache";

export type GooglePlaceInfo = {
  rating: number;
  reviewCount: number;
  mapsUrl: string;
};

async function fetchFromPlacesAPI(placeId: string): Promise<GooglePlaceInfo | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total,url&key=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" || !data.result) return null;
    return {
      rating: data.result.rating,
      reviewCount: data.result.user_ratings_total,
      mapsUrl: data.result.url,
    };
  } catch {
    return null;
  }
}

// Cached for 24 hours — re-fetches in the background on next request after expiry.
export function getGooglePlaceInfo(placeId: string): Promise<GooglePlaceInfo | null> {
  return unstable_cache(
    () => fetchFromPlacesAPI(placeId),
    [`google-place-${placeId}`],
    { revalidate: 86400 }
  )();
}
