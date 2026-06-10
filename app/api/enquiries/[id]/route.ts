import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, enquiriesTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["new", "contacted", "site_visit_scheduled", "closed_won", "closed_lost"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  const { status } = await req.json();

  if (!status || !VALID_STATUSES.has(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const enquiryId = parseInt(id, 10);
  if (isNaN(enquiryId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [enquiry] = await db.select().from(enquiriesTable)
    .where(eq(enquiriesTable.id, enquiryId)).limit(1);
  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role !== "admin") {
    let authorized = enquiry.userId === user.id;
    if (!authorized && enquiry.venueSlug) {
      const [v] = await db.select({ ownerUserId: venuesTable.ownerUserId })
        .from(venuesTable).where(eq(venuesTable.slug, enquiry.venueSlug)).limit(1);
      authorized = v?.ownerUserId === user.id;
    }
    if (!authorized && enquiry.vendorSlug) {
      const [v] = await db.select({ ownerUserId: vendorsTable.ownerUserId })
        .from(vendorsTable).where(eq(vendorsTable.slug, enquiry.vendorSlug!)).limit(1);
      authorized = v?.ownerUserId === user.id;
    }
    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.update(enquiriesTable).set({ status }).where(eq(enquiriesTable.id, enquiryId));
  return NextResponse.json({ ok: true, status });
}
