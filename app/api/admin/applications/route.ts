import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db } from "@/lib/db";
import { listingApplicationsTable, listingApplicationMediaTable, venuesTable, vendorsTable, venueImagesTable, vendorImagesTable, venueHallsTable } from "@/lib/db/schema";
import { eq, and, notInArray, asc } from "drizzle-orm";
import { vendorCategoryFor } from "@/lib/vendor-categories";
import { revalidatePath } from "next/cache";

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
    const [app] = await db.select({ contactName: listingApplicationsTable.contactName, email: listingApplicationsTable.email, businessName: listingApplicationsTable.businessName })
      .from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id)).limit(1);
    await db.update(listingApplicationsTable)
      .set({ status: "rejected", rejectionNote: note ?? null })
      .where(eq(listingApplicationsTable.id, id));
    if (app) sendStatusEmail({ ...app, action: "rejected", note }).catch(() => {});
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  const [app] = await db.select().from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const media = await db.select().from(listingApplicationMediaTable).where(eq(listingApplicationMediaTable.applicationId, id)).orderBy(asc(listingApplicationMediaTable.order));
  const details = (app.details ?? {}) as Record<string, unknown>;
  const whatsappNum = details.whatsapp ? String(details.whatsapp) : app.phone;

  // ── Edit request: UPDATE existing listing ──────────────────────────────────
  if (details._isEdit === true) {
    const linkedId   = details._linkedId as number;
    const linkedType = details._linkedType as string;
    const imageMedia = media.filter((m) => m.type === "image");
    const keepImageIds = Array.isArray(details.keepImageIds) ? details.keepImageIds.map(Number) : null;

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

      if (keepImageIds) {
        if (keepImageIds.length > 0) {
          await db.delete(vendorImagesTable).where(
            and(
              eq(vendorImagesTable.vendorId, linkedId),
              notInArray(vendorImagesTable.id, keepImageIds)
            )
          );
        } else {
          await db.delete(vendorImagesTable).where(eq(vendorImagesTable.vendorId, linkedId));
        }

        const remaining = await db.select({ id: vendorImagesTable.id, order: vendorImagesTable.order, isPrimary: vendorImagesTable.isPrimary })
          .from(vendorImagesTable).where(eq(vendorImagesTable.vendorId, linkedId));
        const maxOrder = remaining.reduce((max, img) => Math.max(max, img.order), -1);
        const hasPrimary = remaining.some((img) => img.isPrimary);

        if (media.length > 0) {
          await db.insert(vendorImagesTable).values(
            media.map((m, i) => ({
              vendorId:  linkedId,
              url:       `data:${m.mimeType};base64,${m.data}`,
              alt:       app.businessName,
              isPrimary: !hasPrimary && i === 0,
              order:     maxOrder + 1 + i,
            }))
          );
        }
      } else {
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

      if (keepImageIds) {
        if (keepImageIds.length > 0) {
          await db.delete(venueImagesTable).where(
            and(
              eq(venueImagesTable.venueId, linkedId),
              notInArray(venueImagesTable.id, keepImageIds)
            )
          );
        } else {
          await db.delete(venueImagesTable).where(eq(venueImagesTable.venueId, linkedId));
        }

        const remaining = await db.select({ id: venueImagesTable.id, order: venueImagesTable.order, isPrimary: venueImagesTable.isPrimary })
          .from(venueImagesTable).where(eq(venueImagesTable.venueId, linkedId));
        const maxOrder = remaining.reduce((max, img) => Math.max(max, img.order), -1);
        const hasPrimary = remaining.some((img) => img.isPrimary);

        if (media.length > 0) {
          await db.insert(venueImagesTable).values(
            media.map((m, i) => ({
              venueId:   linkedId,
              url:       `data:${m.mimeType};base64,${m.data}`,
              alt:       app.businessName,
              isPrimary: !hasPrimary && i === 0,
              order:     maxOrder + 1 + i,
            }))
          );
        }
      } else {
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
    }

    await db.update(listingApplicationsTable)
      .set({ status: "approved" })
      .where(eq(listingApplicationsTable.id, id));

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  // ── New listing: INSERT ────────────────────────────────────────────────────
  const slug = slugify(app.businessName);

  if (app.listingType === "vendor") {
    const cat = vendorCategoryFor(app.businessType);
    const [vendor] = await db.insert(vendorsTable).values({
      slug,
      name:         app.businessName,
      category:     cat.name,
      categorySlug: cat.slug,
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
      citySlug:     slugify(app.city),
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
      meta: {
        packages: Array.isArray(details.packages) ? details.packages.map((pkg: any) => ({
          name: String(pkg.name || ""),
          pricePerPlate: Number(pkg.pricePerPlate) || 0,
          features: Array.isArray(pkg.features) ? pkg.features.map(String) : [],
        })) : [],
        locationInfo: details.locationInfo ? {
          airport: (details.locationInfo as any).airport ? String((details.locationInfo as any).airport) : undefined,
          railway: (details.locationInfo as any).railway ? String((details.locationInfo as any).railway) : undefined,
          hotelCluster: (details.locationInfo as any).hotelCluster ? String((details.locationInfo as any).hotelCluster) : undefined,
        } : undefined,
        googleMapsUrl: details.googleMapsUrl ? String(details.googleMapsUrl) : undefined,
        googlePlaceId: details.googlePlaceId ? String(details.googlePlaceId) : undefined,
      } as any,
    }).returning({ id: venuesTable.id });

    if (venue && Array.isArray(details.halls) && details.halls.length > 0) {
      await db.insert(venueHallsTable).values(
        details.halls.map((h: any, idx: number) => ({
          venueId: venue.id,
          name: String(h.name || ""),
          type: String(h.type || ""),
          area: String(h.area || ""),
          theatre: Number(h.theatre) || 0,
          floating: Number(h.floating) || 0,
          dining: Number(h.dining) || 0,
          order: Number(idx),
          ph: String(h.ph || "v2"),
        }))
      );
    }

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

  sendStatusEmail({ contactName: app.contactName, email: app.email, businessName: app.businessName, action: "approved" }).catch(() => {});

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

// ── DELETE: remove a rejected application ──────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Delete media first (FK constraint)
  await db.delete(listingApplicationMediaTable).where(eq(listingApplicationMediaTable.applicationId, id));
  await db.delete(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));

  return NextResponse.json({ ok: true });
}

// ── PATCH: admin edits application fields ──────────────────────────────────
export async function PATCH(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, fields } = body as {
    id: number;
    fields: {
      businessName?: string;
      businessType?: string;
      contactName?: string;
      phone?: string;
      email?: string;
      city?: string;
      locality?: string;
      website?: string;
      message?: string;
      amenities?: string[];
      details?: Record<string, unknown>;
    };
  };
  if (!id || !fields) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Fetch current details to merge
  const [current] = await db.select({ details: listingApplicationsTable.details })
    .from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mergedDetails = fields.details
    ? { ...(current.details as Record<string, unknown> ?? {}), ...fields.details }
    : current.details;

  const updatePayload: Record<string, unknown> = { details: mergedDetails };
  if (fields.businessName !== undefined) updatePayload.businessName = fields.businessName;
  if (fields.businessType  !== undefined) updatePayload.businessType  = fields.businessType;
  if (fields.contactName   !== undefined) updatePayload.contactName   = fields.contactName;
  if (fields.phone         !== undefined) updatePayload.phone         = fields.phone;
  if (fields.email         !== undefined) updatePayload.email         = fields.email;
  if (fields.city          !== undefined) updatePayload.city          = fields.city;
  if (fields.locality      !== undefined) updatePayload.locality      = fields.locality;
  if (fields.website       !== undefined) updatePayload.website       = fields.website;
  if (fields.message       !== undefined) updatePayload.message       = fields.message;
  if (fields.amenities     !== undefined) updatePayload.amenities     = fields.amenities;

  await db.update(listingApplicationsTable)
    .set(updatePayload as any)
    .where(eq(listingApplicationsTable.id, id));

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

const ADMIN_FROM = "Venuees.in <notifications@venuees.in>";

async function sendStatusEmail({
  contactName, email, businessName, action, note,
}: { contactName: string; email: string; businessName: string; action: "approved" | "rejected"; note?: string | null }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = await import(/* webpackIgnore: true */ "resend");
  const resend = new Resend(apiKey);

  if (action === "approved") {
    await resend.emails.send({
      from: ADMIN_FROM,
      to:   email,
      subject: `Your listing is live on Venuees.in — ${businessName}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#C15A74">Congratulations, ${contactName.split(" ")[0]}!</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">
          <strong>${businessName}</strong> is now live on Venuees.in. Couples searching for venues in your city will be able to find and enquire about your listing.
        </p>
        <p style="margin-top:20px">
          <a href="https://venuees.in/dashboard" style="background:#C15A74;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px">Manage your listing →</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999;">Venuees.in · hello@venuees.in</p>
      </div>`,
    });
  } else {
    await resend.emails.send({
      from: ADMIN_FROM,
      to:   email,
      subject: `Update on your Venuees.in application — ${businessName}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#C15A74">Application update</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">
          Hi ${contactName.split(" ")[0]}, thank you for applying to list <strong>${businessName}</strong> on Venuees.in.
          After review, we weren&rsquo;t able to approve this application at this time.
          ${note ? `<br/><br/>Reason: ${note}` : ""}
        </p>
        <p style="font-size:14px;color:#444;">
          If you believe this is an error or would like to reapply, please write to
          <a href="mailto:hello@venuees.in" style="color:#C15A74">hello@venuees.in</a>.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999;">Venuees.in · hello@venuees.in</p>
      </div>`,
    });
  }
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
