import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [venue] = await db.select({ meta: venuesTable.meta })
    .from(venuesTable).where(eq(venuesTable.id, id)).limit(1);
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blockedDates = ((venue.meta as Record<string, unknown> | null)?.blockedDates ?? []) as string[];
  return NextResponse.json({ blockedDates });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { dates } = await request.json();
  if (!Array.isArray(dates)) return NextResponse.json({ error: "dates must be array" }, { status: 400 });

  const [venue] = await db.select({ ownerUserId: venuesTable.ownerUserId, meta: venuesTable.meta })
    .from(venuesTable).where(eq(venuesTable.id, id)).limit(1);
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserRole(user.id, user.email ?? "");
  if (venue.ownerUserId !== user.id && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newMeta = { ...(venue.meta as Record<string, unknown> ?? {}), blockedDates: dates };
  await db.update(venuesTable).set({ meta: newMeta, updatedAt: new Date() }).where(eq(venuesTable.id, id));
  return NextResponse.json({ ok: true });
}
