import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, action, note } = await request.json();
  if (!id || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await db.update(listingApplicationsTable)
    .set({ status: action === "approve" ? "approved" : "rejected", rejectionNote: note ?? null })
    .where(eq(listingApplicationsTable.id, id));

  return NextResponse.json({ ok: true });
}
