import { NextResponse } from "next/server";
import { db, citiesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({ id: citiesTable.id, name: citiesTable.name, slug: citiesTable.slug, lat: citiesTable.lat, lng: citiesTable.lng })
      .from(citiesTable)
      .where(eq(citiesTable.isActive, true))
      .orderBy(citiesTable.name);
    return NextResponse.json(rows);
  } catch {
    // Fallback if cities table doesn't exist yet
    return NextResponse.json([{ id: 1, name: "Nagpur", slug: "nagpur", lat: 21.1458, lng: 79.0882 }]);
  }
}
