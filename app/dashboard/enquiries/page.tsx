import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, enquiriesTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries — Venuees.in" };

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:       { bg: "#fff8e8", color: "var(--accent)" },
  contacted: { bg: "#e8f4ff", color: "#0066cc" },
  closed:    { bg: "#f0f0f0", color: "var(--ink-mute)" },
};

export default async function EnquiriesPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);

  let enquiries;
  if (role === "admin") {
    enquiries = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  } else if (role === "vendor") {
    const myVenues  = await db.select({ slug: venuesTable.slug  }).from(venuesTable).where(eq(venuesTable.ownerUserId, user.id));
    const myVendors = await db.select({ slug: vendorsTable.slug }).from(vendorsTable).where(eq(vendorsTable.ownerUserId, user.id));
    const venueSlugs  = myVenues.map((v) => v.slug);
    const vendorSlugs = myVendors.map((v) => v.slug);
    const all = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
    enquiries = all.filter((e) =>
      e.userId === user.id ||
      (e.venueSlug && venueSlugs.includes(e.venueSlug)) ||
      (e.vendorSlug && vendorSlugs.includes(e.vendorSlug))
    );
  } else {
    enquiries = await db.select().from(enquiriesTable).where(eq(enquiriesTable.userId, user.id)).orderBy(desc(enquiriesTable.createdAt));
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Enquiries</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          {enquiries.length} total{role === "admin" ? " across all listings" : role === "vendor" ? " for your listings" : " sent by you"}
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--ink-mute)", fontSize: 14 }}>
          No enquiries yet.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {enquiries.map((e, i) => {
            const st = STATUS_STYLE[e.status] ?? STATUS_STYLE.new;
            return (
              <div key={e.id} style={{ padding: "18px 24px", borderBottom: i < enquiries.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)", textTransform: "capitalize", fontSize: 14 }}>{e.kind}</span>
                      {(e.venueSlug ?? e.vendorSlug ?? e.getawaySlug) && (
                        <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>· {e.venueSlug ?? e.vendorSlug ?? e.getawaySlug}</span>
                      )}
                    </div>
                    {(e.name || e.phone) && (
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 2 }}>
                        {e.name}{e.phone && ` · ${e.phone}`}{e.email && ` · ${e.email}`}
                      </div>
                    )}
                    {e.eventDate && (
                      <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                        Event: {e.eventDate}{e.guestCount ? ` · ${e.guestCount} guests` : ""}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0, background: st.bg, color: st.color }}>
                    {e.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
