import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable, vendorsTable, venueImagesTable, vendorImagesTable, listingApplicationsTable, venueHallsTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { EditListingForm, type EditListingData } from "./edit-form";

export const dynamic = "force-dynamic";

const GETAWAY_TYPES = new Set(["Resort / Hotel", "Farmstay", "Heritage Property", "Villa / Bungalow"]);

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id) || !["venue", "vendor"].includes(type)) return notFound();

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role === "customer") redirect("/dashboard");

  let listing: EditListingData | null = null;
  let existingImages: Array<{ id: number; url: string; alt: string; isPrimary: boolean; order: number; type: "image" | "video" }> = [];

  if (type === "venue") {
    const [venue] = await db.select().from(venuesTable).where(eq(venuesTable.id, id));
    if (!venue || (venue.ownerUserId !== user.id && role !== "admin")) return notFound();

    const imgs = await db.select({ id: venueImagesTable.id, url: venueImagesTable.url, alt: venueImagesTable.alt, isPrimary: venueImagesTable.isPrimary, order: venueImagesTable.order })
      .from(venueImagesTable).where(eq(venueImagesTable.venueId, id)).orderBy(venueImagesTable.order);
    existingImages = imgs.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      order: img.order,
      type: img.url.startsWith("data:video/") ? "video" : "image",
    }));

    const halls = await db.select()
      .from(venueHallsTable)
      .where(eq(venueHallsTable.venueId, id))
      .orderBy(venueHallsTable.order);

    const meta = (venue.meta ?? {}) as Record<string, any>;
    const packages = meta.packages ?? [];
    const locationInfo = meta.locationInfo ?? {};
    const googleMapsUrl = meta.googleMapsUrl ?? "";
    const googlePlaceId = meta.googlePlaceId ?? "";

    const listingType = GETAWAY_TYPES.has(venue.type) ? "getaway" : "venue";

    listing = {
      id: venue.id,
      linkedType: "venue",
      listingType,
      businessType: venue.type,
      name: venue.name,
      contactName: venue.contactName ?? "",
      phone: venue.contactPhone ?? "",
      email: venue.contactEmail ?? "",
      whatsapp: venue.whatsapp ?? "",
      city: "Nagpur",
      locality: venue.locality,
      fullAddress: venue.address,
      website: "",
      instagram: "",
      capacityMin: venue.capacityMin ? String(venue.capacityMin) : "",
      capacityMax: venue.capacityMax ? String(venue.capacityMax) : "",
      vegPlate: venue.vegPlate ? String(venue.vegPlate) : "",
      nvPlate: venue.nvPlate ? String(venue.nvPlate) : "",
      hallRent: venue.hallRent ? String(venue.hallRent) : "",
      minGuarantee: venue.minGuarantee ? String(venue.minGuarantee) : "",
      parking: venue.parking ? String(venue.parking) : "",
      rooms: venue.rooms ? String(venue.rooms) : "",
      priceFrom: "",
      yearsExp: "",
      tagline: "",
      completed: "",
      description: venue.description,
      amenities: (venue.amenities ?? []) as string[],
      blockedDates: ((venue.meta as Record<string, unknown> | null)?.blockedDates ?? []) as string[],
      halls: halls.map((h) => ({
        name: h.name,
        type: h.type,
        area: h.area,
        theatre: h.theatre,
        floating: h.floating,
        dining: h.dining,
        ph: h.ph,
      })),
      packages,
      locationInfo,
      googleMapsUrl,
      googlePlaceId,
    };
  } else {
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id));
    if (!vendor || (vendor.ownerUserId !== user.id && role !== "admin")) return notFound();

    const imgs = await db.select({ id: vendorImagesTable.id, url: vendorImagesTable.url, alt: vendorImagesTable.alt, isPrimary: vendorImagesTable.isPrimary, order: vendorImagesTable.order })
      .from(vendorImagesTable).where(eq(vendorImagesTable.vendorId, id)).orderBy(vendorImagesTable.order);
    existingImages = imgs.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      order: img.order,
      type: img.url.startsWith("data:video/") ? "video" : "image",
    }));

    listing = {
      id: vendor.id,
      linkedType: "vendor",
      listingType: "vendor",
      businessType: vendor.category,
      name: vendor.name,
      contactName: vendor.contactName ?? "",
      phone: vendor.contactPhone ?? "",
      email: vendor.contactEmail ?? "",
      whatsapp: vendor.whatsapp ?? "",
      city: vendor.city,
      locality: vendor.locality,
      fullAddress: "",
      website: "",
      instagram: "",
      capacityMin: "",
      capacityMax: "",
      vegPlate: "",
      nvPlate: "",
      hallRent: "",
      minGuarantee: "",
      parking: "",
      rooms: "",
      priceFrom: vendor.priceFrom ? String(vendor.priceFrom) : "",
      yearsExp: vendor.yearsExp ? String(vendor.yearsExp) : "",
      tagline: vendor.tagline ?? "",
      completed: vendor.completed ? String(vendor.completed) : "",
      description: vendor.description ?? "",
      amenities: [],
      blockedDates: [],
      halls: [],
      packages: [],
      locationInfo: {},
      googleMapsUrl: "",
      googlePlaceId: "",
    };
  }

  // Check for an already-pending edit on this listing
  const pendingApps = await db
    .select({ id: listingApplicationsTable.id, details: listingApplicationsTable.details })
    .from(listingApplicationsTable)
    .where(
      and(
        eq(listingApplicationsTable.userId, user.id),
        eq(listingApplicationsTable.status, "pending"),
      )
    );
  const hasPendingEdit = pendingApps.some((a) => {
    const d = (a.details ?? {}) as Record<string, unknown>;
    return d._isEdit === true && d._linkedId === id;
  });

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <Link
        href="/dashboard/listings"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-mute)", textDecoration: "none", marginBottom: 20 }}
      >
        ← My listings
      </Link>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 4 }}>
          Edit listing
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          {listing.name} · {listing.businessType}
        </p>
      </div>

      {hasPendingEdit && (
        <div style={{ marginBottom: 24, padding: "14px 18px", background: "#fff8e8", border: "1px solid #f5d87a", borderRadius: 10, fontSize: 14, color: "var(--ink)" }}>
          <strong>Edit already under review</strong> — A previous edit is pending admin approval. You can submit another update; it will queue separately.
        </div>
      )}

      <EditListingForm listing={listing} existingImages={existingImages} />
    </div>
  );
}
