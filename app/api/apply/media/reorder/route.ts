import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listingApplicationMediaTable, listingApplicationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(user.id, user.email!);
    
    const { applicationId, items } = await request.json();

    if (!applicationId || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [app] = await db.select({ userId: listingApplicationsTable.userId }).from(listingApplicationsTable).where(eq(listingApplicationsTable.id, applicationId));
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // Verify ownership
    if (role !== "admin" && app.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // items should be { id: number, order: number }
    const existingMedia = await db.select({ id: listingApplicationMediaTable.id }).from(listingApplicationMediaTable).where(eq(listingApplicationMediaTable.applicationId, applicationId));
    const validIds = existingMedia.map(m => m.id);

    for (const item of items) {
      if (validIds.includes(item.id)) {
        await db.update(listingApplicationMediaTable)
          .set({ order: item.order })
          .where(eq(listingApplicationMediaTable.id, item.id));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error reordering application media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
