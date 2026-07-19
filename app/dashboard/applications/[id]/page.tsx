import { redirect, notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable, listingApplicationMediaTable, venueImagesTable, vendorImagesTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { AppDetailView } from "./app-detail-view";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#fff8e8", color: "var(--accent)" },
  approved: { bg: "#f0fff4", color: "#060" },
  rejected: { bg: "#fff0f0", color: "#c00" },
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return notFound();

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);

  const [app] = await db.select().from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));
  if (!app) return notFound();

  // Allow admins, or the user who owns this application
  if (role !== "admin" && app.userId !== user.id) {
    redirect("/dashboard");
  }

  const isAdmin = role === "admin";

  const media = await db.select().from(listingApplicationMediaTable)
    .where(eq(listingApplicationMediaTable.applicationId, id))
    .orderBy(asc(listingApplicationMediaTable.order));

  const rawDetails = (app.details ?? {}) as any;
  const details    = rawDetails as Record<string, any>;
  const st = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending;
  const isEdit     = rawDetails._isEdit === true;
  const linkedType = isEdit ? String(rawDetails._linkedType ?? "") : "";
  const linkedId   = isEdit ? Number(rawDetails._linkedId ?? 0) : 0;

  let existingImages: Array<{ id: number; url: string; alt: string; isPrimary: boolean; order: number; type: "image" | "video" }> = [];
  if (isEdit && linkedId && linkedType) {
    if (linkedType === "venue") {
      const imgs = await db.select({ id: venueImagesTable.id, url: venueImagesTable.url, alt: venueImagesTable.alt, isPrimary: venueImagesTable.isPrimary, order: venueImagesTable.order })
        .from(venueImagesTable).where(eq(venueImagesTable.venueId, linkedId)).orderBy(venueImagesTable.order);
      existingImages = imgs.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        order: img.order,
        type: img.url.startsWith("data:video/") ? "video" : "image",
      }));
    } else if (linkedType === "vendor") {
      const imgs = await db.select({ id: vendorImagesTable.id, url: vendorImagesTable.url, alt: vendorImagesTable.alt, isPrimary: vendorImagesTable.isPrimary, order: vendorImagesTable.order })
        .from(vendorImagesTable).where(eq(vendorImagesTable.vendorId, linkedId)).orderBy(vendorImagesTable.order);
      existingImages = imgs.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        order: img.order,
        type: img.url.startsWith("data:video/") ? "video" : "image",
      }));
    }
  }

  const keepImageIds = Array.isArray(details.keepImageIds) ? details.keepImageIds.map(Number) : null;
  const keptImages = keepImageIds ? existingImages.filter(img => keepImageIds.includes(img.id)) : [];
  const removedImages = keepImageIds ? existingImages.filter(img => !keepImageIds.includes(img.id)) : existingImages;

  return (
    <AppDetailView 
      app={{
        id: app.id,
        businessName: app.businessName,
        businessType: app.businessType,
        contactName: app.contactName,
        phone: app.phone,
        email: app.email,
        city: app.city,
        locality: app.locality,
        website: app.website,
        message: app.message,
        amenities: app.amenities,
        status: app.status,
        listingType: app.listingType,
        createdAt: app.createdAt.toISOString(),
        rejectionNote: app.rejectionNote,
      }}
      details={details}
      media={media}
      existingImages={existingImages}
      isEditRequest={isEdit}
      linkedType={linkedType}
      linkedId={linkedId}
      keepImageIds={keepImageIds}
      keptImages={keptImages}
      removedImages={removedImages}
      statusStyle={st}
      isAdmin={isAdmin}
    />
  );
}
