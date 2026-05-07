import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, enquiriesTable } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries — Venuees.in" };

export default async function EnquiriesPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const enquiries = await db
    .select()
    .from(enquiriesTable)
    .orderBy(enquiriesTable.createdAt);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Enquiries</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{enquiries.length} total enquiries received.</p>
      </div>

      {enquiries.length === 0 ? (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--ink-mute)", fontSize: 14 }}>
          No enquiries yet.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {enquiries.reverse().map((e, i) => (
            <div key={e.id} style={{
              padding: "18px 24px", borderBottom: i < enquiries.length - 1 ? "1px solid var(--line)" : "none",
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "center", fontSize: 14,
            }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--ink)", textTransform: "capitalize" }}>{e.kind}</div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{e.name ?? "—"} · {e.phone ?? "—"}</div>
              </div>
              <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{e.venueSlug ?? e.vendorSlug ?? e.getawaySlug ?? "General"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
    </div>
  );
}
