import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, enquiriesTable, listingApplicationsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard — Venuees.in" };

export default async function DashboardPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";

  // Fetch stats
  const [enquiries, applications] = await Promise.all([
    db.select({ id: enquiriesTable.id, status: enquiriesTable.status, createdAt: enquiriesTable.createdAt, kind: enquiriesTable.kind })
      .from(enquiriesTable)
      .orderBy(enquiriesTable.createdAt),
    db.select({ id: listingApplicationsTable.id, status: listingApplicationsTable.status, businessName: listingApplicationsTable.businessName, createdAt: listingApplicationsTable.createdAt })
      .from(listingApplicationsTable)
      .where(eq(listingApplicationsTable.email, user.email!)),
  ]);

  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const pendingApplication = applications.find((a) => a.status === "pending");

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>
          Hello, {name}.
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          Welcome to your Venuees.in dashboard.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
        {[
          { label: "Total enquiries", value: enquiries.length, sub: `${newEnquiries} new` },
          { label: "Listing status", value: applications.length ? (pendingApplication ? "Under review" : "Active") : "Not listed", sub: applications.length ? applications[0].businessName : "Apply below" },
          { label: "Account", value: "Active", sub: user.email ?? "" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "24px 28px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", background: "#fff" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Enquiries preview */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>Recent enquiries</h2>
          <Link href="/dashboard/enquiries" style={{ fontSize: 13, color: "var(--brand)" }}>View all →</Link>
        </div>

        {enquiries.length === 0 ? (
          <div style={{ padding: "32px 28px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--ink-mute)", fontSize: 14 }}>
            No enquiries yet. They&rsquo;ll show up here when couples reach out.
          </div>
        ) : (
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {enquiries.slice(-5).reverse().map((e, i) => (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", fontSize: 14, borderBottom: i < 4 ? "1px solid var(--line)" : "none",
              }}>
                <div>
                  <span style={{ fontWeight: 500, color: "var(--ink)", textTransform: "capitalize" }}>{e.kind}</span>
                  <span style={{ color: "var(--ink-mute)", marginLeft: 12, fontSize: 12 }}>
                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: e.status === "new" ? "#fff8e8" : "#f0f0f0",
                  color: e.status === "new" ? "var(--accent)" : "var(--ink-mute)",
                }}>{e.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA if no listing */}
      {applications.length === 0 && (
        <section style={{ padding: "32px 36px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 8 }}>
            List your venue or service
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20, maxWidth: 520 }}>
            Join 42+ venues and vendors on Venuees.in. Submit your listing — we review within 48 hours and go live after a quick call.
          </p>
          <Link href="/listings" className="btn btn-primary">
            Apply for a listing →
          </Link>
        </section>
      )}
    </div>
  );
}
