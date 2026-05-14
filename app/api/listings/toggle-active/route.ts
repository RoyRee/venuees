import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);

  const { id, type } = await request.json();
  if (!id || !["venue", "vendor"].includes(type))
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (type === "venue") {
    const [row] = await db.select({ isActive: venuesTable.isActive, ownerUserId: venuesTable.ownerUserId })
      .from(venuesTable).where(eq(venuesTable.id, id)).limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (role !== "admin" && row.ownerUserId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.update(venuesTable).set({ isActive: !row.isActive }).where(eq(venuesTable.id, id));
    return NextResponse.json({ ok: true, isActive: !row.isActive });
  } else {
    const [row] = await db.select({ isActive: vendorsTable.isActive, ownerUserId: vendorsTable.ownerUserId })
      .from(vendorsTable).where(eq(vendorsTable.id, id)).limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (role !== "admin" && row.ownerUserId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.update(vendorsTable).set({ isActive: !row.isActive }).where(eq(vendorsTable.id, id));
    return NextResponse.json({ ok: true, isActive: !row.isActive });
  }
}
