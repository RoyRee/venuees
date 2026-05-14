import { NextResponse } from "next/server";
import { db, destinationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(destinationsTable)
      .where(eq(destinationsTable.isActive, true));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/destinations]", err);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
