import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listingApplicationMediaTable, listingApplicationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { applicationId, data, mimeType, fileName, type, order } = await request.json();

  if (!applicationId || !data || !mimeType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [app] = await db.select({ id: listingApplicationsTable.id })
    .from(listingApplicationsTable)
    .where(eq(listingApplicationsTable.id, applicationId));

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  await db.insert(listingApplicationMediaTable).values({
    applicationId,
    data,
    mimeType,
    fileName: fileName ?? null,
    type: type ?? "image",
    order: order ?? 0,
  });

  return NextResponse.json({ ok: true });
}
