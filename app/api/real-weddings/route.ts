import { NextResponse } from "next/server";
import { db, realWeddingsTable, realWeddingImagesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(realWeddingsTable)
      .where(eq(realWeddingsTable.isActive, true));

    const ids = rows.map((r) => r.id);
    const images = ids.length > 0
      ? await db
          .select({ realWeddingId: realWeddingImagesTable.realWeddingId, url: realWeddingImagesTable.url })
          .from(realWeddingImagesTable)
          .where(eq(realWeddingImagesTable.isPrimary, true))
      : [];

    const imageMap = new Map(images.map((i) => [i.realWeddingId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/real-weddings]", err);
    return NextResponse.json({ error: "Failed to fetch real weddings" }, { status: 500 });
  }
}
