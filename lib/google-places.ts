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

// Cache keyed + tagged per placeId; revalidated every 24h or on manual flush.
export function getGooglePlaceInfo(placeId: string): Promise<GooglePlaceInfo | null> {
  return unstable_cache(
    () => fetchFromPlacesAPI(placeId),
    [`google-place-${placeId}`],
    { revalidate: 86400, tags: [`google-place-${placeId}`] }
  )();
}

// ─── Admin import — search & fetch full details for a candidate venue ────────

export type PlaceSearchResult = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  photoRef?: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  address: string;
  locality?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  mapsUrl?: string;
  photoRefs: string[];
};

type RawTextSearchResult = {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
};

type RawAddressComponent = { long_name: string; types: string[] };

type RawPlaceDetails = {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  geometry?: { location?: { lat: number; lng: number } };
  address_components?: RawAddressComponent[];
  photos?: { photo_reference: string }[];
};

// Search Google Places by free-text query (e.g. "banquet halls in Nagpur").
// Used by the admin import tool — not cached, since results change as the
// admin refines the query.
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data: { status: string; results?: RawTextSearchResult[] } = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return [];
    return (data.results ?? []).map((r) => ({
      placeId: r.place_id,
      name: r.name,
      address: r.formatted_address,
      rating: r.rating,
      reviewCount: r.user_ratings_total,
      photoRef: r.photos?.[0]?.photo_reference,
    }));
  } catch {
    return [];
  }
}

// Full details for one place — used right before import, to pull lat/lng,
// phone, locality and the photo references needed to populate the listing.
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const fields = "name,formatted_address,address_component,geometry,formatted_phone_number,rating,user_ratings_total,url,photo";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data: { status: string; result?: RawPlaceDetails } = await res.json();
    if (data.status !== "OK" || !data.result) return null;
    const r = data.result;
    const locality = r.address_components?.find(
      (c) => c.types.includes("sublocality_level_1") || c.types.includes("sublocality") || c.types.includes("locality")
    )?.long_name;
    return {
      placeId,
      name: r.name,
      address: r.formatted_address,
      locality,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
      phone: r.formatted_phone_number,
      rating: r.rating,
      reviewCount: r.user_ratings_total,
      mapsUrl: r.url,
      photoRefs: (r.photos ?? []).map((p) => p.photo_reference),
    };
  } catch {
    return null;
  }
}
