import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, siteConfigTable } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(siteConfigTable);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates: Record<string, unknown> = await req.json();

  for (const [key, value] of Object.entries(updates)) {
    // Boolean toggles (from ConfigForm) come as JS booleans → "true"/"false".
    // Content values (from ContentForm) come as strings → stored verbatim.
    const val = typeof value === "boolean" ? (value ? "true" : "false") : String(value);
    await db
      .insert(siteConfigTable)
      .values({ key, value: val, updatedBy: user.id })
      .onConflictDoUpdate({
        target: siteConfigTable.key,
        set: { value: val, updatedAt: sql`now()`, updatedBy: user.id },
      });
  }

  return NextResponse.json({ ok: true });
}
