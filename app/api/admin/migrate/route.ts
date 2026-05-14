import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// One-time migration endpoint — adds the `meta` column to venues if missing.
// Call POST /api/admin/migrate from the browser while logged in as admin.
export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.execute(sql`
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS meta jsonb;
  `);

  return NextResponse.json({ ok: true, message: "Migration applied: venues.meta column" });
}
