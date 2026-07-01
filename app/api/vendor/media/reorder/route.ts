import { NextRequest, NextResponse } from "next/server";
import { db, venueImagesTable, vendorImagesTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(user.id, user.email!);
    
    // items should be an array of { id: number; order: number }
    const { listingType, listingId, items } = await request.json();

    if (!listingType || !listingId || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership if not admin
    if (role !== "admin") {
      if (listingType === "venue") {
        const [venue] = await db.select({ userId: venuesTable.ownerUserId }).from(venuesTable).where(eq(venuesTable.id, listingId));
        if (!venue || venue.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else if (listingType === "vendor") {
        const [vendor] = await db.select({ userId: vendorsTable.ownerUserId }).from(vendorsTable).where(eq(vendorsTable.id, listingId));
        if (!vendor || vendor.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else {
        return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
      }
    }

    // Process reordering
    if (listingType === "venue") {
      const existingImages = await db.select({ id: venueImagesTable.id }).from(venueImagesTable).where(eq(venueImagesTable.venueId, listingId));
      const validIds = existingImages.map(i => i.id);
      
      for (const item of items) {
        if (validIds.includes(item.id)) {
          await db.update(venueImagesTable)
            .set({ order: item.order, isPrimary: item.order === 0 })
            .where(eq(venueImagesTable.id, item.id));
        }
      }
    } else if (listingType === "vendor") {
      const existingImages = await db.select({ id: vendorImagesTable.id }).from(vendorImagesTable).where(eq(vendorImagesTable.vendorId, listingId));
      const validIds = existingImages.map(i => i.id);
      
      for (const item of items) {
        if (validIds.includes(item.id)) {
          await db.update(vendorImagesTable)
            .set({ order: item.order, isPrimary: item.order === 0 })
            .where(eq(vendorImagesTable.id, item.id));
        }
      }
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error reordering media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
