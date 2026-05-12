import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, savedListingsTable } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, slug, action } = await request.json();
  if (!type || !slug || !["save", "unsave"].includes(action))
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (action === "save") {
    await db.insert(savedListingsTable).values({ id: randomUUID(), userId: user.id, type, slug }).onConflictDoNothing();
  } else {
    await db.delete(savedListingsTable).where(and(eq(savedListingsTable.userId, user.id), eq(savedListingsTable.slug, slug)));
  }
  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ saved: [] });

  const rows = await db.select({ slug: savedListingsTable.slug })
    .from(savedListingsTable)
    .where(eq(savedListingsTable.userId, user.id));
  return NextResponse.json({ saved: rows.map((r) => r.slug) });
}
