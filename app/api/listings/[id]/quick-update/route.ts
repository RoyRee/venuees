import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, venuesTable, vendorsTable, venueHallsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json();
  const { type } = body;
  const role = await getUserRole(user.id, user.email!);

  if (type === "venue") {
    const [venue] = await db.select({ ownerUserId: venuesTable.ownerUserId, meta: venuesTable.meta })
      .from(venuesTable).where(eq(venuesTable.id, id)).limit(1);
    if (!venue || (venue.ownerUserId !== user.id && role !== "admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.phone       !== undefined) updates.contactPhone  = body.phone || null;
    if (body.whatsapp    !== undefined) updates.whatsapp      = body.whatsapp || null;
    if (body.email       !== undefined) updates.contactEmail  = body.email || null;
    if (body.vegPlate    !== undefined) updates.vegPlate      = Number(body.vegPlate)    || 0;
    if (body.nvPlate     !== undefined) updates.nvPlate       = Number(body.nvPlate)     || 0;
    if (body.hallRent    !== undefined) updates.hallRent      = Number(body.hallRent)    || 0;
    if (body.minGuarantee !== undefined) updates.minGuarantee = Number(body.minGuarantee) || 0;
    if (body.capacityMin !== undefined) updates.capacityMin   = Number(body.capacityMin) || 0;
    if (body.capacityMax !== undefined) updates.capacityMax   = Number(body.capacityMax) || 0;
    if (body.parking     !== undefined) updates.parking       = Number(body.parking)     || 0;
    if (body.rooms       !== undefined) updates.rooms         = body.rooms ? Number(body.rooms) : null;
    if (body.description !== undefined) updates.description   = body.description;
    if (body.amenities   !== undefined) updates.amenities     = body.amenities;

    if (body.halls !== undefined) {
      await db.delete(venueHallsTable).where(eq(venueHallsTable.venueId, id));
      if (Array.isArray(body.halls) && body.halls.length > 0) {
        await db.insert(venueHallsTable).values(
          body.halls.map((h: any, idx: number) => ({
            venueId: id,
            name: String(h.name || ""),
            type: String(h.type || ""),
            area: String(h.area || ""),
            theatre: Number(h.theatre) || 0,
            floating: Number(h.floating) || 0,
            dining: Number(h.dining) || 0,
            order: Number(idx),
            ph: String(h.ph || "v2"),
          }))
        );
      }
    }

    const currentMeta = (venue.meta ?? {}) as Record<string, any>;
    let metaUpdated = false;

    if (body.packages !== undefined) {
      currentMeta.packages = Array.isArray(body.packages) ? body.packages.map((pkg: any) => ({
        name: String(pkg.name || ""),
        pricePerPlate: Number(pkg.pricePerPlate) || 0,
        features: Array.isArray(pkg.features) ? pkg.features.map(String) : [],
      })) : [];
      metaUpdated = true;
    }

    if (body.locationInfo !== undefined) {
      const loc = body.locationInfo ?? {};
      currentMeta.locationInfo = {
        airport: loc.airport ? String(loc.airport) : undefined,
        railway: loc.railway ? String(loc.railway) : undefined,
        hotelCluster: loc.hotelCluster ? String(loc.hotelCluster) : undefined,
      };
      metaUpdated = true;
    }

    if (body.googleMapsUrl !== undefined) {
      currentMeta.googleMapsUrl = body.googleMapsUrl ? String(body.googleMapsUrl) : null;
      metaUpdated = true;
    }

    if (body.googlePlaceId !== undefined) {
      currentMeta.googlePlaceId = body.googlePlaceId ? String(body.googlePlaceId) : null;
      metaUpdated = true;
    }

    if (metaUpdated) {
      updates.meta = currentMeta;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(venuesTable).set(updates as any).where(eq(venuesTable.id, id));
    return NextResponse.json({ ok: true });
  }

  if (type === "vendor") {
    const [vendor] = await db.select({ ownerUserId: vendorsTable.ownerUserId })
      .from(vendorsTable).where(eq(vendorsTable.id, id)).limit(1);
    if (!vendor || (vendor.ownerUserId !== user.id && role !== "admin"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.phone       !== undefined) updates.contactPhone = body.phone || null;
    if (body.whatsapp    !== undefined) updates.whatsapp     = body.whatsapp || null;
    if (body.email       !== undefined) updates.contactEmail = body.email || null;
    if (body.priceFrom   !== undefined) updates.priceFrom    = Number(body.priceFrom) || 0;
    if (body.yearsExp    !== undefined) updates.yearsExp     = Number(body.yearsExp)  || 0;
    if (body.completed   !== undefined) updates.completed    = Number(body.completed) || 0;
    if (body.tagline     !== undefined) updates.tagline      = body.tagline;
    if (body.description !== undefined) updates.description  = body.description;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(vendorsTable).set(updates as any).where(eq(vendorsTable.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
