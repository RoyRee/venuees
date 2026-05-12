import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { ApplicationActions } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Applications — Venuees.in Admin" };

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#fff8e8", color: "var(--accent)" },
  approved: { bg: "#f0fff4", color: "#060" },
  rejected: { bg: "#fff0f0", color: "#c00" },
};

export default async function ApplicationsPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  const apps = await db.select().from(listingApplicationsTable).orderBy(desc(listingApplicationsTable.createdAt));
  const pending = apps.filter((a) => a.status === "pending");
  const others = apps.filter((a) => a.status !== "pending");

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Applications</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{pending.length} pending · {apps.length} total</p>
      </div>

      {[{ title: "Pending review", items: pending }, { title: "Reviewed", items: others }].map(({ title, items }) =>
        items.length === 0 ? null : (
          <section key={title} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 16 }}>{title}</h2>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {items.map((a, i) => {
                const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.pending;
                return (
                  <div key={a.id} style={{ padding: "20px 24px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{a.businessName}</span>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: st.bg, color: st.color }}>{a.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
                          {a.businessType} · {a.city}{a.locality ? `, ${a.locality}` : ""}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                          {a.contactName} · {a.phone} · {a.email}
                        </div>
                        {a.website && <div style={{ fontSize: 12, color: "var(--brand)", marginTop: 4 }}><a href={a.website} target="_blank" rel="noopener noreferrer">{a.website}</a></div>}
                        {a.message && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, fontStyle: "italic" }}>&ldquo;{a.message}&rdquo;</div>}
                        {a.rejectionNote && <div style={{ fontSize: 12, color: "#c00", marginTop: 6 }}>Note: {a.rejectionNote}</div>}
                        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 8 }}>
                          {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      {a.status === "pending" && <ApplicationActions id={a.id} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )
      )}

      {apps.length === 0 && (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--ink-mute)", fontSize: 14 }}>
          No applications yet.
        </div>
      )}
    </div>
  );
}
