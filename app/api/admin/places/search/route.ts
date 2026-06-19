import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { searchPlaces } from "@/lib/google-places";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured" }, { status: 503 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });

  const results = await searchPlaces(q);
  return NextResponse.json(results);
}
