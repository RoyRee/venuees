import { NextRequest, NextResponse } from "next/server";
import { db, vendorsTable, vendorImagesTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const vendor = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, slug))
      .limit(1);

    if (!vendor.length) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const images = await db
      .select()
      .from(vendorImagesTable)
      .where(eq(vendorImagesTable.vendorId, vendor[0].id));

    return NextResponse.json({ ...vendor[0], images });
  } catch (err) {
    console.error("[GET /api/vendors/[slug]]", err);
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}
