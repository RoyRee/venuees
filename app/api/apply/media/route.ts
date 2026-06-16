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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const role = await getUserRole(user.id, user.email!);
  if (app.userId !== user.id && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
