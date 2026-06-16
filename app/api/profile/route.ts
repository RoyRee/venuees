import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, profilesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone } = await request.json();

  // Update display name in Supabase auth user_metadata
  if (name !== undefined) {
    const { error } = await supabase!.auth.updateUser({ data: { full_name: name } });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update phone in profiles table
  if (phone !== undefined) {
    await db
      .update(profilesTable)
      .set({ phone: phone || null, updatedAt: new Date() })
      .where(eq(profilesTable.userId, user.id));
  }

  return NextResponse.json({ ok: true });
}
