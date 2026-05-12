import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Listings — Venuees.in" };

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#fff8e8", color: "var(--accent)" },
  approved: { bg: "#f0fff4", color: "#060" },
  rejected: { bg: "#fff0f0", color: "#c00" },
};

export default async function ListingsPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);

  if (role === "admin") {
    const [venues, vendors] = await Promise.all([
      db.select({ id: venuesTable.id, name: venuesTable.name, slug: venuesTable.slug, locality: venuesTable.locality, isActive: venuesTable.isActive, ownerUserId: venuesTable.ownerUserId }).from(venuesTable).orderBy(desc(venuesTable.createdAt)),
      db.select({ id: vendorsTable.id, name: vendorsTable.name, slug: vendorsTable.slug, category: vendorsTable.category, isActive: vendorsTable.isActive, ownerUserId: vendorsTable.ownerUserId }).from(vendorsTable).orderBy(desc(vendorsTable.createdAt)),
    ]);
    return <AdminListings venues={venues} vendors={vendors} />;
  }

  const apps = await db.select().from(listingApplicationsTable)
    .where(eq(listingApplicationsTable.userId, user.id))
    .orderBy(desc(listingApplicationsTable.createdAt));
  const myVenues  = await db.select().from(venuesTable).where(eq(venuesTable.ownerUserId, user.id));
  const myVendors = await db.select().from(vendorsTable).where(eq(vendorsTable.ownerUserId, user.id));

  return <VendorListings apps={apps} venues={myVenues} vendors={myVendors} />;
}

function AdminListings({ venues, vendors }: {
  venues: { id: number; name: string; slug: string; locality: string; isActive: boolean; ownerUserId: string | null }[];
  vendors: { id: number; name: string; slug: string; category: string; isActive: boolean; ownerUserId: string | null }[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>All Listings</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{venues.length} venues · {vendors.length} vendors</p>
      </div>
      {[{ title: "Venues", items: venues.map((v) => ({ ...v, sub: v.locality })) }, { title: "Vendors", items: vendors.map((v) => ({ ...v, sub: v.category })) }].map(({ title, items }) =>
        items.length === 0 ? null : (
          <section key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>{title}</h2>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {items.map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none", fontSize: 14 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
                    <span style={{ color: "var(--ink-mute)", marginLeft: 10, fontSize: 12 }}>{item.sub}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {item.ownerUserId && <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>Claimed</span>}
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: item.isActive ? "#f0fff4" : "#f0f0f0", color: item.isActive ? "#060" : "var(--ink-mute)", fontWeight: 600 }}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}

function VendorListings({ apps, venues, vendors }: {
  apps: { id: number; businessName: string; businessType: string; status: string; createdAt: Date; rejectionNote: string | null }[];
  venues: { id: number; name: string; slug: string; isActive: boolean }[];
  vendors: { id: number; name: string; slug: string; isActive: boolean }[];
}) {
  const hasLive = venues.length > 0 || vendors.length > 0;
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>My listing</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Your listing status and details.</p>
      </div>

      {hasLive && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>Live listings</h2>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {[
              ...venues.map((v) => ({ ...v, href: `/venues/nagpur/${v.slug}` })),
              ...vendors.map((v) => ({ ...v, href: `/vendors/${v.slug}` })),
            ].map((item, i, arr) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
                <Link href={item.href} style={{ fontSize: 13, color: "var(--brand)" }}>View on site →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {apps.map((app) => {
        const st = STATUS_COLOR[app.status] ?? STATUS_COLOR.pending;
        return (
          <div key={app.id} style={{ padding: "20px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{app.businessName}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: st.bg, color: st.color }}>{app.status}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>{app.businessType}</div>
            {app.status === "pending" && <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>We&rsquo;ll review within 48 hours and contact you.</div>}
            {app.status === "rejected" && app.rejectionNote && <div style={{ fontSize: 13, color: "#c00" }}>Reason: {app.rejectionNote}</div>}
            <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 8 }}>
              Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        );
      })}

      {!hasLive && apps.length === 0 && (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 10 }}>No listing yet</div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>Submit an application to get started.</p>
          <Link href="/list-your-business" className="btn btn-primary">Apply for a listing →</Link>
        </div>
      )}
    </div>
  );
}
