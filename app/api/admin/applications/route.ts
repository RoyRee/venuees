import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db } from "@/lib/db";
import { listingApplicationsTable, listingApplicationMediaTable, venuesTable, vendorsTable, venueImagesTable, vendorImagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, action, note } = await request.json();
  if (!id || !["approve", "reject"].includes(action))
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (action === "reject") {
    await db.update(listingApplicationsTable)
      .set({ status: "rejected", rejectionNote: note ?? null })
      .where(eq(listingApplicationsTable.id, id));
    return NextResponse.json({ ok: true });
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  const [app] = await db.select().from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const media = await db.select().from(listingApplicationMediaTable).where(eq(listingApplicationMediaTable.applicationId, id));
  const details = (app.details ?? {}) as Record<string, unknown>;
  const whatsappNum = details.whatsapp ? String(details.whatsapp) : app.phone;

  // ── Edit request: UPDATE existing listing ──────────────────────────────────
  if (details._isEdit === true) {
    const linkedId   = details._linkedId as number;
    const linkedType = details._linkedType as string;
    const imageMedia = media.filter((m) => m.type === "image");

    if (linkedType === "vendor") {
      await db.update(vendorsTable).set({
        name:         app.businessName,
        city:         app.city,
        locality:     app.locality ?? "",
        priceFrom:    num(details.priceFrom),
        yearsExp:     num(details.yearsExp),
        completed:    num(details.completed),
        tagline:      str(details.tagline),
        description:  app.message ?? "",
        scene:        app.locality ?? "",
        contactName:  app.contactName,
        contactPhone: app.phone,
        contactEmail: app.email,
        whatsapp:     whatsappNum,
      }).where(eq(vendorsTable.id, linkedId));

      if (imageMedia.length > 0) {
        await db.delete(vendorImagesTable).where(eq(vendorImagesTable.vendorId, linkedId));
        await db.insert(vendorImagesTable).values(
          imageMedia.map((m, i) => ({
            vendorId:  linkedId,
            url:       `data:${m.mimeType};base64,${m.data}`,
            alt:       app.businessName,
            isPrimary: i === 0,
            order:     i,
          }))
        );
      }
    } else {
      // venue or getaway
      const address = details.fullAddress
        ? String(details.fullAddress)
        : `${app.locality ?? ""}, ${app.city}`;
      const roomCount = app.listingType === "getaway"
        ? (num(details.capacityMin) || null)
        : (num(details.rooms) || null);

      await db.update(venuesTable).set({
        name:         app.businessName,
        locality:     app.locality ?? "",
        address,
        capacityMin:  num(details.capacityMin),
        capacityMax:  num(details.capacityMax),
        vegPlate:     num(details.vegPlate),
        nvPlate:      num(details.nvPlate),
        hallRent:     num(details.hallRent),
        minGuarantee: num(details.minGuarantee),
        parking:      num(details.parking),
        rooms:        roomCount,
        description:  app.message ?? "",
        scene:        app.locality ?? "",
        amenities:    (app.amenities ?? []) as string[],
        contactName:  app.contactName,
        contactPhone: app.phone,
        contactEmail: app.email,
        whatsapp:     whatsappNum,
      }).where(eq(venuesTable.id, linkedId));

      if (imageMedia.length > 0) {
        await db.delete(venueImagesTable).where(eq(venueImagesTable.venueId, linkedId));
        await db.insert(venueImagesTable).values(
          imageMedia.map((m, i) => ({
            venueId:   linkedId,
            url:       `data:${m.mimeType};base64,${m.data}`,
            alt:       app.businessName,
            isPrimary: i === 0,
            order:     i,
          }))
        );
      }
    }

    await db.update(listingApplicationsTable)
      .set({ status: "approved" })
      .where(eq(listingApplicationsTable.id, id));

    return NextResponse.json({ ok: true });
  }

  // ── New listing: INSERT ────────────────────────────────────────────────────
  const slug = slugify(app.businessName);

  if (app.listingType === "vendor") {
    const [vendor] = await db.insert(vendorsTable).values({
      slug,
      name:         app.businessName,
      category:     app.businessType,
      categorySlug: slugify(app.businessType),
      city:         app.city,
      locality:     app.locality ?? "",
      priceFrom:    num(details.priceFrom),
      yearsExp:     num(details.yearsExp),
      completed:    num(details.completed),
      tagline:      str(details.tagline),
      description:  app.message ?? "",
      scene:        app.locality ?? "",
      contactName:  app.contactName,
      contactPhone: app.phone,
      contactEmail: app.email,
      whatsapp:     whatsappNum,
      ownerUserId:  app.userId ?? null,
      isActive:     true,
    }).returning({ id: vendorsTable.id });

    if (media.length > 0) {
      await db.insert(vendorImagesTable).values(
        media.filter((m) => m.type === "image").map((m, i) => ({
          vendorId:  vendor.id,
          url:       `data:${m.mimeType};base64,${m.data}`,
          alt:       app.businessName,
          isPrimary: i === 0,
          order:     i,
        }))
      );
    }
  } else {
    // venue or getaway — both go into venuesTable
    const address = details.fullAddress
      ? String(details.fullAddress)
      : `${app.locality ?? ""}, ${app.city}`;
    const roomCount = app.listingType === "getaway"
      ? (num(details.capacityMin) || null)
      : (num(details.rooms) || null);

    const [venue] = await db.insert(venuesTable).values({
      slug,
      name:         app.businessName,
      type:         app.businessType,
      typeSlug:     slugify(app.businessType),
      locality:     app.locality ?? "",
      address,
      capacityMin:  num(details.capacityMin),
      capacityMax:  num(details.capacityMax),
      vegPlate:     num(details.vegPlate),
      nvPlate:      num(details.nvPlate),
      hallRent:     num(details.hallRent),
      minGuarantee: num(details.minGuarantee),
      parking:      num(details.parking),
      rooms:        roomCount,
      tag:          "New",
      description:  app.message ?? "",
      scene:        app.locality ?? "",
      amenities:    (app.amenities ?? []) as string[],
      contactName:  app.contactName,
      contactPhone: app.phone,
      contactEmail: app.email,
      whatsapp:     whatsappNum,
      ownerUserId:  app.userId ?? null,
      isActive:     true,
    }).returning({ id: venuesTable.id });

    if (media.length > 0) {
      await db.insert(venueImagesTable).values(
        media.filter((m) => m.type === "image").map((m, i) => ({
          venueId:   venue.id,
          url:       `data:${m.mimeType};base64,${m.data}`,
          alt:       app.businessName,
          isPrimary: i === 0,
          order:     i,
        }))
      );
    }
  }

  await db.update(listingApplicationsTable)
    .set({ status: "approved" })
    .where(eq(listingApplicationsTable.id, id));

  return NextResponse.json({ ok: true });
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function num(v: unknown): number {
  const n = parseInt(String(v ?? "0"), 10);
  return isNaN(n) ? 0 : n;
}

function str(v: unknown): string {
  return v ? String(v) : "";
}
