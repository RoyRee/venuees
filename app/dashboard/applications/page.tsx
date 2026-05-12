import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable, listingApplicationMediaTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
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

  const mediaByApp: Record<number, { id: number; applicationId: number; data: string; mimeType: string; fileName: string | null; type: string; order: number }[]> = {};
  if (apps.length > 0) {
    const allMedia = await db.select().from(listingApplicationMediaTable);
    for (const m of allMedia) {
      if (!mediaByApp[m.applicationId]) mediaByApp[m.applicationId] = [];
      mediaByApp[m.applicationId].push(m);
    }
  }

  const pending = apps.filter((a) => a.status === "pending");
  const others  = apps.filter((a) => a.status !== "pending");

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Applications</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{pending.length} pending · {apps.length} total</p>
      </div>

      {[{ title: "Pending review", items: pending }, { title: "Reviewed", items: others }].map(({ title, items }) =>
        items.length === 0 ? null : (
          <section key={title} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 14 }}>{title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((a) => {
                const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.pending;
                const appMedia = mediaByApp[a.id] ?? [];
                const images = appMedia.filter((m) => m.type === "image");
                const details = (a.details ?? {}) as Record<string, unknown>;
                return (
                  <div key={a.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    {/* Photo strip — clickable */}
                    <Link href={`/dashboard/applications/${a.id}`} style={{ display: "block", textDecoration: "none" }}>
                      {images.length > 0 ? (
                        <div style={{ display: "flex", gap: 2, height: 140, overflow: "hidden", position: "relative" }}>
                          {images.slice(0, 4).map((img, i) => (
                            <div key={i} style={{ flex: 1, overflow: "hidden" }}>
                              <img src={`data:${img.mimeType};base64,${img.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          ))}
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "all 0.2s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.35)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"; }}>
                            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "8px 18px", borderRadius: 20 }}>View all details →</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: 60, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--ink-mute)" }}>No photos · tap to view details</div>
                      )}
                    </Link>

                    <div style={{ padding: "18px 20px" }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{a.businessName}</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: st.bg, color: st.color }}>{a.status}</span>
                            {a.listingType && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--surface)", color: "var(--ink-mute)", border: "1px solid var(--line)", textTransform: "capitalize" }}>{a.listingType}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                            {a.businessType} · {a.city}{a.locality ? `, ${a.locality}` : ""}
                          </div>
                        </div>
                        {a.status === "pending" && <ApplicationActions id={a.id} />}
                      </div>

                      {/* Contact */}
                      <div style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 10 }}>
                        {a.contactName} · <a href={`tel:${a.phone}`} style={{ color: "var(--brand)" }}>{a.phone}</a> · <a href={`mailto:${a.email}`} style={{ color: "var(--brand)" }}>{a.email}</a>
                      </div>

                      {/* Details grid */}
                      {Object.keys(details).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 10 }}>
                          {Object.entries(details).filter(([, v]) => v).map(([k, v]) => (
                            <span key={k} style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                              <span style={{ color: "var(--ink-mute)", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}

                      {a.amenities && a.amenities.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                          {a.amenities.map((am) => <span key={am} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{am}</span>)}
                        </div>
                      )}

                      {a.message && <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 8 }}>&ldquo;{a.message}&rdquo;</div>}
                      {a.website && <div style={{ fontSize: 12, marginBottom: 8 }}><a href={a.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)" }}>{a.website}</a></div>}
                      {a.rejectionNote && <div style={{ fontSize: 12, color: "#c00" }}>Rejection note: {a.rejectionNote}</div>}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                          {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {images.length} photo{images.length !== 1 ? "s" : ""}{appMedia.some((m) => m.type === "video") ? " · 1 video" : ""}
                        </div>
                        <Link href={`/dashboard/applications/${a.id}`} style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
                          View full details + preview →
                        </Link>
                      </div>
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
