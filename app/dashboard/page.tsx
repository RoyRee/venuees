import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, enquiriesTable, listingApplicationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Venuees.in" };

export default async function DashboardPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
  const role = await getUserRole(user.id, user.email!);

  if (role === "admin") {
    const [allEnquiries, allApps] = await Promise.all([
      db.select({ id: enquiriesTable.id, status: enquiriesTable.status }).from(enquiriesTable),
      db.select({ id: listingApplicationsTable.id, status: listingApplicationsTable.status }).from(listingApplicationsTable),
    ]);
    const pending = allApps.filter((a) => a.status === "pending").length;
    const newLeads = allEnquiries.filter((e) => e.status === "new").length;
    return <AdminOverview name={name} totalEnquiries={allEnquiries.length} newLeads={newLeads} totalApps={allApps.length} pendingApps={pending} />;
  }

  if (role === "vendor") {
    const apps = await db.select().from(listingApplicationsTable).where(eq(listingApplicationsTable.userId, user.id));
    const myEnquiries = await db.select({ id: enquiriesTable.id, status: enquiriesTable.status, kind: enquiriesTable.kind, createdAt: enquiriesTable.createdAt })
      .from(enquiriesTable).where(eq(enquiriesTable.userId, user.id));
    return <VendorOverview name={name} applications={apps} enquiries={myEnquiries} />;
  }

  // Customer
  const myEnquiries = await db.select({ id: enquiriesTable.id, status: enquiriesTable.status, kind: enquiriesTable.kind, createdAt: enquiriesTable.createdAt, venueSlug: enquiriesTable.venueSlug, vendorSlug: enquiriesTable.vendorSlug })
    .from(enquiriesTable).where(eq(enquiriesTable.userId, user.id));
  return <CustomerOverview name={name} enquiries={myEnquiries} />;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="dash-stat-card">
      <div style={{ flex: 1 }}>
        <div className="dash-stat-label">{label}</div>
        <div className="dash-stat-value">{value}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel = "View all →" }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{title}</h2>
      <Link href={href} style={{ fontSize: 13, color: "var(--brand)" }}>{linkLabel}</Link>
    </div>
  );
}

function AdminOverview({ name, totalEnquiries, newLeads, totalApps, pendingApps }: {
  name: string; totalEnquiries: number; newLeads: number; totalApps: number; pendingApps: number;
}) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 6vw, 36px)", color: "var(--ink)", marginBottom: 6 }}>Hello, {name}.</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Platform overview.</p>
      </div>
      <div className="dash-stats">
        <StatCard label="Total enquiries" value={totalEnquiries} sub={`${newLeads} new`} />
        <StatCard label="Pending applications" value={pendingApps} sub={`${totalApps} total`} />
        <StatCard label="Platform" value="Live" sub="venuees.vercel.app" />
      </div>
      {pendingApps > 0 && (
        <section style={{ padding: "20px 20px", background: "#fff8e8", borderRadius: "var(--radius-md)", border: "1px solid #f5d87a", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{pendingApps} application{pendingApps > 1 ? "s" : ""} awaiting review</div>
          <Link href="/dashboard/applications" style={{ fontSize: 13, color: "var(--brand)" }}>Review now →</Link>
        </section>
      )}
    </div>
  );
}

function VendorOverview({ name, applications, enquiries }: {
  name: string;
  applications: { id: number; status: string; businessName: string; createdAt: Date }[];
  enquiries: { id: number; status: string; kind: string; createdAt: Date }[];
}) {
  const app = applications[0];
  const newCount = enquiries.filter((e) => e.status === "new").length;
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 6vw, 36px)", color: "var(--ink)", marginBottom: 6 }}>Hello, {name}.</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Your vendor dashboard.</p>
      </div>
      <div className="dash-stats">
        <StatCard label="My enquiries" value={enquiries.length} sub={`${newCount} new`} />
        <StatCard label="Listing status" value={app ? (app.status === "pending" ? "Under review" : app.status === "approved" ? "Live" : "Not approved") : "Not applied"} sub={app?.businessName ?? "Apply below"} />
        <StatCard label="Account" value="Active" />
      </div>
      {!app && (
        <section style={{ padding: "24px 20px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 8 }}>List your venue or service</h2>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20 }}>Submit your listing — we review within 48 hours and go live after a quick call.</p>
          <Link href="/list-your-business" className="btn btn-primary">Apply for a listing →</Link>
        </section>
      )}
      {app?.status === "pending" && (
        <section style={{ padding: "20px 20px", background: "#fff8e8", borderRadius: "var(--radius-md)", border: "1px solid #f5d87a" }}>
          <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Application under review</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>We&rsquo;ll reach out within 48 hours. Submitted: {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        </section>
      )}
    </div>
  );
}

function CustomerOverview({ name, enquiries }: {
  name: string;
  enquiries: { id: number; status: string; kind: string; createdAt: Date; venueSlug: string | null; vendorSlug: string | null }[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 6vw, 36px)", color: "var(--ink)", marginBottom: 6 }}>Hello, {name}.</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Your wedding planning hub.</p>
      </div>
      <div className="dash-stats">
        <StatCard label="Enquiries sent" value={enquiries.length} sub={enquiries.length === 0 ? "None yet" : "Track below"} />
        <StatCard label="Saved venues" value="—" sub="Coming soon" />
        <StatCard label="Account" value="Active" />
      </div>
      {enquiries.length === 0 ? (
        <section style={{ padding: "32px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 8 }}>No enquiries yet</div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20 }}>Browse venues and send an enquiry — it gets tracked here.</p>
          <Link href="/venues" className="btn btn-primary">Browse venues →</Link>
        </section>
      ) : (
        <section>
          <SectionHeader title="Your enquiries" href="/dashboard/enquiries" />
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {enquiries.slice(0, 5).map((e, i) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", fontSize: 14, borderBottom: i < Math.min(4, enquiries.length - 1) ? "1px solid var(--line)" : "none" }}>
                <div>
                  <span style={{ fontWeight: 500, color: "var(--ink)", textTransform: "capitalize" }}>{e.venueSlug ?? e.vendorSlug ?? e.kind}</span>
                  <span style={{ color: "var(--ink-mute)", marginLeft: 10, fontSize: 12 }}>{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: e.status === "new" ? "#fff8e8" : "#f0f0f0", color: e.status === "new" ? "var(--accent)" : "var(--ink-mute)" }}>{e.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
