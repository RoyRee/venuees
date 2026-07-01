import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listingApplicationMediaTable, listingApplicationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  // Note: anonymous users (no login) can still upload media for their own application
  // as long as they hold the applicationId (a UUID generated moments ago)

  const { applicationId, data, mimeType, fileName, type, order } = await request.json();

  if (!applicationId || !data || !mimeType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [app] = await db
    .select({ id: listingApplicationsTable.id, userId: listingApplicationsTable.userId })
    .from(listingApplicationsTable)
    .where(eq(listingApplicationsTable.id, applicationId));

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // If the application was created by a logged-in user, verify the uploader matches.
  // If it was anonymous (userId = null), allow any caller with the correct applicationId.
  if (app.userId !== null && user?.id !== app.userId) {
    const role = user ? await getUserRole(user.id, user.email!) : "customer";
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await db.insert(listingApplicationMediaTable).values({
    applicationId,
    data,
    mimeType,
    fileName: fileName ?? null,
    type: type ?? "image",
    order: order ?? 0,
  });

  return NextResponse.json({ ok: true });
}

// ── DELETE: admin removes a single media item ─────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { mediaId } = await request.json();
  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  await db.delete(listingApplicationMediaTable).where(eq(listingApplicationMediaTable.id, mediaId));
  return NextResponse.json({ ok: true });
}
