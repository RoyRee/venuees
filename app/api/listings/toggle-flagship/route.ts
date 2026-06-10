import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const [row] = await db.select({ isSignature: venuesTable.isSignature })
    .from(venuesTable).where(eq(venuesTable.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(venuesTable).set({ isSignature: !row.isSignature }).where(eq(venuesTable.id, id));
  return NextResponse.json({ ok: true, isSignature: !row.isSignature });
}
