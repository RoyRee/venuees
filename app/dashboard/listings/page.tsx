import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { ToggleActiveButton, ToggleFlagshipButton } from "./toggle-button";
import { GoogleSetupButton } from "@/components/google-setup-button";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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
      db.select({ id: venuesTable.id, name: venuesTable.name, slug: venuesTable.slug, locality: venuesTable.locality, isActive: venuesTable.isActive, isSignature: venuesTable.isSignature, ownerUserId: venuesTable.ownerUserId, meta: venuesTable.meta }).from(venuesTable).orderBy(desc(venuesTable.createdAt)),
      db.select({ id: vendorsTable.id, name: vendorsTable.name, slug: vendorsTable.slug, category: vendorsTable.category, isActive: vendorsTable.isActive, ownerUserId: vendorsTable.ownerUserId }).from(vendorsTable).orderBy(desc(vendorsTable.createdAt)),
    ]);
    return <AdminListings venues={venues} vendors={vendors} />;
  }

  const [apps, myVenues, myVendors] = await Promise.all([
    db.select({
      id: listingApplicationsTable.id,
      businessName: listingApplicationsTable.businessName,
      businessType: listingApplicationsTable.businessType,
      status: listingApplicationsTable.status,
      createdAt: listingApplicationsTable.createdAt,
      rejectionNote: listingApplicationsTable.rejectionNote,
      details: listingApplicationsTable.details,
    }).from(listingApplicationsTable)
      .where(eq(listingApplicationsTable.userId, user.id))
      .orderBy(desc(listingApplicationsTable.createdAt)),
    db.select({
      id: venuesTable.id,
      name: venuesTable.name,
      slug: venuesTable.slug,
      locality: venuesTable.locality,
      citySlug: venuesTable.citySlug,
      isActive: venuesTable.isActive,
    }).from(venuesTable).where(eq(venuesTable.ownerUserId, user.id)),
    db.select({
      id: vendorsTable.id,
      name: vendorsTable.name,
      slug: vendorsTable.slug,
      category: vendorsTable.category,
      categorySlug: vendorsTable.categorySlug,
      isActive: vendorsTable.isActive,
    }).from(vendorsTable).where(eq(vendorsTable.ownerUserId, user.id)),
  ]);

  return <VendorListings apps={apps} venues={myVenues} vendors={myVendors} />;
}

function AdminListings({ venues, vendors }: {
  venues: { id: number; name: string; slug: string; locality: string; isActive: boolean; isSignature: boolean; ownerUserId: string | null; meta: Record<string, unknown> | null }[];
  vendors: { id: number; name: string; slug: string; category: string; isActive: boolean; ownerUserId: string | null }[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>All Listings</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{venues.length} venues · {vendors.length} vendors</p>
      </div>
      {[
        { title: "Venues",  items: venues.map((v)  => ({ ...v, sub: v.locality, listingType: "venue"  as const })) },
        { title: "Vendors", items: vendors.map((v) => ({ ...v, sub: v.category, listingType: "vendor" as const })) },
      ].map(({ title, items }) =>
        items.length === 0 ? null : (
          <section key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>{title}</h2>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {items.map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 20px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none", fontSize: 14 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
                    <span style={{ color: "var(--ink-mute)", marginLeft: 10, fontSize: 12 }}>{item.sub}</span>
                    {!item.isActive && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#f0f0f0", color: "var(--ink-mute)", fontWeight: 600 }}>Disabled</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {item.ownerUserId && <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>Claimed</span>}
                    {item.listingType === "venue" && (
                      <GoogleSetupButton
                        venueId={item.id}
                        venueName={item.name}
                        initialPlaceId={(item as { meta?: Record<string,unknown> }).meta?.googlePlaceId as string | undefined}
                        initialMapsUrl={(item as { meta?: Record<string,unknown> }).meta?.googleMapsUrl as string | undefined}
                        initialRating={(item as { meta?: Record<string,unknown> }).meta?.googleRating as number | undefined}
                        initialReviewCount={(item as { meta?: Record<string,unknown> }).meta?.googleReviewCount as number | undefined}
                      />
                    )}
                    {"isSignature" in item && (
                      <ToggleFlagshipButton id={item.id} isSignature={item.isSignature} />
                    )}
                    <ToggleActiveButton id={item.id} type={item.listingType} isActive={item.isActive} />
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
  apps: { id: number; businessName: string; businessType: string; status: string; createdAt: Date; rejectionNote: string | null; details: Record<string, unknown> | null }[];
  venues: { id: number; name: string; slug: string; locality: string; citySlug: string; isActive: boolean }[];
  vendors: { id: number; name: string; slug: string; category: string; categorySlug: string; isActive: boolean }[];
}) {
  const hasLive = venues.length > 0 || vendors.length > 0;

  // Separate new applications from edit-request applications
  const editApps = apps.filter((a) => (a.details as Record<string, unknown> | null)?._isEdit === true);
  const newApps  = apps.filter((a) => (a.details as Record<string, unknown> | null)?._isEdit !== true);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>My listings</h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
            {venues.length + vendors.length} live · {newApps.length} application{newApps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/list-your-business" className="btn btn-primary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          + Add another listing
        </Link>
      </div>

      {hasLive && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>Live listings</h2>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {[
              ...venues.map((v) => ({
                id: v.id,
                name: v.name,
                sub: v.locality,
                isActive: v.isActive,
                listingType: "venue" as const,
                href: `/venues/${v.citySlug ?? "nagpur"}/${slugify(v.locality)}/${v.slug}`,
                editHref: `/dashboard/listings/edit/venue/${v.id}`,
              })),
              ...vendors.map((v) => ({
                id: v.id,
                name: v.name,
                sub: v.category,
                isActive: v.isActive,
                listingType: "vendor" as const,
                href: `/vendors/${v.categorySlug}/${v.slug}`,
                editHref: `/dashboard/listings/edit/vendor/${v.id}`,
              })),
            ].map((item, i, arr) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", fontSize: 14 }}>
                <div>
                  <span style={{ fontWeight: 600, color: item.isActive ? "var(--ink)" : "var(--ink-mute)" }}>{item.name}</span>
                  <span style={{ color: "var(--ink-mute)", marginLeft: 8, fontSize: 12 }}>{item.sub}</span>
                  {!item.isActive && (
                    <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#f0f0f0", color: "var(--ink-mute)", fontWeight: 600 }}>Disabled</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <ToggleActiveButton id={item.id} type={item.listingType} isActive={item.isActive} />
                  <Link href={item.editHref} style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "none", padding: "4px 12px", border: "1px solid var(--line)", borderRadius: 6 }}>
                    Edit
                  </Link>
                  <Link href={item.href} style={{ fontSize: 13, color: "var(--brand)", textDecoration: "none" }}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit requests */}
      {editApps.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>Pending edits</h2>
          {editApps.map((app) => {
            const st = STATUS_COLOR[app.status] ?? STATUS_COLOR.pending;
            return (
              <div key={app.id} style={{ padding: "16px 20px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{app.businessName}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "#eef", color: "#448" }}>Edit request</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: st.bg, color: st.color }}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    Submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* New listing applications */}
      {newApps.map((app) => {
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

      {!hasLive && newApps.length === 0 && (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 10 }}>No listings yet</div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>Submit an application to get started.</p>
          <Link href="/list-your-business" className="btn btn-primary">Apply for a listing →</Link>
        </div>
      )}
    </div>
  );
}
