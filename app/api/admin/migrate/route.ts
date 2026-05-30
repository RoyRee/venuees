import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // venues.meta column
  await db.execute(sql`
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS meta jsonb;
  `);

  // cities table + seed Nagpur
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cities (
      id        SERIAL PRIMARY KEY,
      name      TEXT NOT NULL,
      slug      TEXT NOT NULL UNIQUE,
      lat       DOUBLE PRECISION NOT NULL,
      lng       DOUBLE PRECISION NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await db.execute(sql`
    INSERT INTO cities (name, slug, lat, lng)
    VALUES ('Nagpur', 'nagpur', 21.1458, 79.0882)
    ON CONFLICT (slug) DO NOTHING;
  `);

  return NextResponse.json({ ok: true, message: "Migrations applied: venues.meta, cities table + Nagpur seed" });
}
