import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, enquiriesTable } from "@/lib/db";
import { gte, lte, eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");
  const kind   = searchParams.get("kind");
  const status = searchParams.get("status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [];
  if (from)   conditions.push(gte(enquiriesTable.createdAt, new Date(from)));
  if (to)     conditions.push(lte(enquiriesTable.createdAt, new Date(to + "T23:59:59Z")));
  if (kind)   conditions.push(eq(enquiriesTable.kind, kind));
  if (status) conditions.push(eq(enquiriesTable.status, status));

  const rows = await db.select().from(enquiriesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(enquiriesTable.createdAt));

  const header = "id,date,kind,status,name,phone,email,venue,event_date,guests,message\n";
  const body = rows.map((r) => [
    r.id,
    r.createdAt.toISOString(),
    r.kind,
    r.status,
    cell(r.name),
    cell(r.phone),
    cell(r.email),
    cell(r.venueSlug ?? r.vendorSlug ?? ""),
    cell(r.eventDate),
    cell(r.guestCount),
    cell(r.message),
  ].join(",")).join("\n");

  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(header + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function cell(v: string | null | undefined): string {
  if (!v) return "";
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
