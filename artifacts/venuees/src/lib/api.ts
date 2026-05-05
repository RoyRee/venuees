const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const API_BASE = `${BASE}/api`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `POST ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface VenueHall {
  id: number;
  name: string;
  type: string;
  area: string;
  theatre: number;
  floating: number;
  dining: number;
  ph: string;
}

export interface VenueImage {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Venue {
  id: number;
  slug: string;
  name: string;
  citySlug: string;
  locality: string;
  address: string;
  type: string;
  typeSlug: string;
  capacityMin: number;
  capacityMax: number;
  vegPlate: number;
  nvPlate: number;
  hallRent: number;
  minGuarantee: number;
  rating: string;
  reviews: number;
  bookingsMonth: number;
  tag: string;
  description: string;
  ph: string;
  amenities: string[];
  isSignature: boolean;
  parking: number;
  rooms: number | null;
  halls: VenueHall[];
  images: VenueImage[];
}

export interface VenueListItem {
  id: number;
  slug: string;
  name: string;
  citySlug: string;
  locality: string;
  type: string;
  typeSlug: string;
  capacityMin: number;
  capacityMax: number;
  vegPlate: number;
  nvPlate: number;
  hallRent: number;
  rating: string;
  reviews: number;
  bookingsMonth: number;
  tag: string;
  ph: string;
  isSignature: boolean;
  parking: number;
  rooms: number | null;
  primaryImage: string | null;
}

export interface Getaway {
  id: number;
  slug: string;
  name: string;
  location: string;
  hoursFromNagpur: string;
  beds: number;
  guests: number;
  weekday: number;
  weekend: number;
  rating: string;
  reviews: number;
  ph: string;
  tagline: string;
  description: string | null;
  amenities: string[];
  images: VenueImage[];
}

export interface Vendor {
  id: number;
  slug: string;
  category: string;
  categorySlug: string;
  name: string;
  city: string;
  locality: string;
  rating: string;
  reviews: number;
  priceFrom: number;
  completed: number;
  yearsExp: number;
  ph: string;
  tagline: string;
  description: string | null;
  images: VenueImage[];
}

export interface Destination {
  id: number;
  slug: string;
  city: string;
  tag: string;
  ph: string;
  venues: number;
  priceFrom: string;
  feat: boolean;
}

export interface RealWedding {
  id: number;
  slug: string;
  couple: string;
  venue: string;
  date: string;
  guests: number;
  ph: string;
  quote: string | null;
  images: VenueImage[];
}

export interface EnquiryPayload {
  kind: "venue_enquiry" | "homepage_lead" | "contact" | "partner_apply" | "getaway_enquiry" | "vendor_enquiry";
  venueSlug?: string;
  vendorSlug?: string;
  getawaySlug?: string;
  category?: string;
  name?: string;
  phone?: string;
  email?: string;
  eventDate?: string;
  guestCount?: string;
  message?: string;
}

export interface ListingApplication {
  businessName: string;
  businessType: "venue" | "vendor" | "getaway";
  category?: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  website?: string;
  message?: string;
}

export const api = {
  venues: {
    list: (params?: { city?: string; type?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.city) q.set("city", params.city);
      if (params?.type) q.set("type", params.type);
      if (params?.search) q.set("search", params.search);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return get<VenueListItem[]>(`/venues${qs}`);
    },
    get: (slug: string) => get<Venue>(`/venues/${slug}`),
  },
  vendors: {
    list: (params?: { category?: string; city?: string }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.city) q.set("city", params.city);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return get<Vendor[]>(`/vendors${qs}`);
    },
    get: (slug: string) => get<Vendor>(`/vendors/${slug}`),
  },
  getaways: {
    list: () => get<Getaway[]>("/getaways"),
    get: (slug: string) => get<Getaway>(`/getaways/${slug}`),
  },
  destinations: {
    list: () => get<Destination[]>("/destinations"),
    get: (slug: string) => get<Destination>(`/destinations/${slug}`),
  },
  realWeddings: {
    list: () => get<RealWedding[]>("/real-weddings"),
    get: (slug: string) => get<RealWedding>(`/real-weddings/${slug}`),
  },
  enquiries: {
    submit: (payload: EnquiryPayload) => post<{ ok: boolean; id: number }>("/enquiries", payload),
  },
  newsletter: {
    subscribe: (email: string) => post<{ ok: boolean }>("/newsletter", { email }),
  },
  listings: {
    apply: (payload: ListingApplication) => post<{ ok: boolean; id: number }>("/listings/apply", payload),
  },
};
