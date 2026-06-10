import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, citiesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function auth(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return null;
  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return null;
  return user;
}

// GET all cities (including inactive)
export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await db.select().from(citiesTable).orderBy(citiesTable.name);
  return NextResponse.json(rows);
}

// POST — add a city
export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, slug, lat, lng } = await req.json();
  if (!name || !slug || lat == null || lng == null)
    return NextResponse.json({ error: "name, slug, lat, lng are required" }, { status: 400 });

  const [row] = await db.insert(citiesTable).values({ name, slug, lat: Number(lat), lng: Number(lng) }).returning();
  return NextResponse.json(row);
}

// PATCH — toggle is_active by id
export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [row] = await db.select({ isActive: citiesTable.isActive }).from(citiesTable).where(eq(citiesTable.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [updated] = await db.update(citiesTable).set({ isActive: !row.isActive }).where(eq(citiesTable.id, id)).returning();
  return NextResponse.json(updated);
}

// DELETE — remove city by id
export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(citiesTable).where(eq(citiesTable.id, id));
  return NextResponse.json({ ok: true });
}
