import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, listingApplicationsTable, listingApplicationMediaTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ApplicationActions } from "../actions";
import { ApplicationGallery } from "./gallery";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#fff8e8", color: "var(--accent)" },
  approved: { bg: "#f0fff4", color: "#060" },
  rejected: { bg: "#fff0f0", color: "#c00" },
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return notFound();

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  const [app] = await db.select().from(listingApplicationsTable).where(eq(listingApplicationsTable.id, id));
  if (!app) return notFound();

  const media = await db.select().from(listingApplicationMediaTable)
    .where(eq(listingApplicationMediaTable.applicationId, id));

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");
  const details = (app.details ?? {}) as Record<string, string | number | null | undefined>;
  const st = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Back */}
      <Link href="/dashboard/applications" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-mute)", textDecoration: "none", marginBottom: 20 }}>
        ← All applications
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", margin: 0 }}>{app.businessName}</h1>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: st.bg, color: st.color }}>{app.status}</span>
            {app.listingType && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "var(--surface)", color: "var(--ink-mute)", border: "1px solid var(--line)", textTransform: "capitalize" }}>{app.listingType}</span>}
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            {app.businessType} · {app.city}{app.locality ? `, ${app.locality}` : ""} · submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        {app.status === "pending" && <ApplicationActions id={app.id} />}
      </div>

      <div className="app-detail-grid">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Gallery */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>
              Media · {images.length} photo{images.length !== 1 ? "s" : ""}{videos.length > 0 ? ` · ${videos.length} video` : ""}
            </div>
            <ApplicationGallery media={media} />
          </div>

          {/* Listing preview */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50" }} />
              <span style={{ fontSize: 12, color: "var(--ink-mute)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Listing preview · how it will look on venuees.in</span>
            </div>

            {/* Mock listing page */}
            <div style={{ padding: 20, background: "#fafaf9" }}>

              {/* Mock hero */}
              {images.length > 0 ? (
                <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, height: 220, position: "relative" }}>
                  <img src={`data:${images[0].mimeType};base64,${images[0].data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {images.length > 1 && (
                    <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
                      <div style={{ background: "transparent" }} />
                      <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 2 }}>
                        {images.slice(1, 3).map((img, i) => (
                          <div key={i} style={{ overflow: "hidden" }}>
                            <img src={`data:${img.mimeType};base64,${img.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {images.length > 3 && (
                    <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>+{images.length - 3} more</div>
                  )}
                </div>
              ) : (
                <div style={{ height: 160, borderRadius: 10, background: "var(--line)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-mute)", fontSize: 13 }}>No photos yet</div>
              )}

              {/* Name + badges */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "var(--brand)", color: "#fff", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{app.listingType ?? "venue"}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, border: "1px solid var(--line)", color: "var(--ink-mute)", textTransform: "capitalize" }}>{app.businessType}</span>
                </div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{app.businessName}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  📍 {app.locality ? `${app.locality}, ` : ""}{app.city}
                </div>
              </div>

              {/* Pricing / capacity */}
              {(details.capacityMax || details.vegPlate || details.hallRent || details.priceFrom) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "12px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 12 }}>
                  {details.capacityMax && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{String(details.capacityMax)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>max guests</div></div>}
                  {details.vegPlate && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{String(details.vegPlate)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>veg plate</div></div>}
                  {details.nvPlate && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{String(details.nvPlate)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>non-veg plate</div></div>}
                  {details.hallRent && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{(parseInt(String(details.hallRent), 10) / 1000).toFixed(0)}k</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>hall rent</div></div>}
                  {details.priceFrom && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{(parseInt(String(details.priceFrom), 10) / 1000).toFixed(0)}k+</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>starting price</div></div>}
                </div>
              )}

              {/* Description */}
              {app.message && (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 12 }}>{app.message}</p>
              )}

              {/* Amenities */}
              {app.amenities && app.amenities.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {app.amenities.map((a) => (
                    <span key={a} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#fff", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{a}</span>
                  ))}
                </div>
              )}

              {/* Contact (blurred for privacy) */}
              <div style={{ padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-mute)" }}>
                Contact info visible to enquirers after listing goes live
              </div>
            </div>
          </div>
        </div>

        {/* Right column — details sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>

          {/* Contact */}
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Contact</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{app.contactName}</div>
            <a href={`tel:${app.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--brand)", textDecoration: "none", marginBottom: 6 }}>
              📞 {app.phone}
            </a>
            <a href={`mailto:${app.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--brand)", textDecoration: "none", wordBreak: "break-all" }}>
              ✉ {app.email}
            </a>
            {app.website && (
              <a href={app.website} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 12, color: "var(--ink-mute)", marginTop: 8, wordBreak: "break-all" }}>
                🔗 {app.website}
              </a>
            )}
          </div>

          {/* Details */}
          {Object.keys(details).length > 0 && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(details).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--ink-mute)", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities sidebar */}
          {app.amenities && app.amenities.length > 0 && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 10 }}>Amenities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {app.amenities.map((a) => (
                  <span key={a} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Rejection note */}
          {app.rejectionNote && (
            <div style={{ border: "1px solid #fcc", borderRadius: 12, padding: 16, background: "#fff8f8" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c00", marginBottom: 8 }}>Rejection note</div>
              <p style={{ fontSize: 13, color: "#900", margin: 0 }}>{app.rejectionNote}</p>
            </div>
          )}

          {/* Actions */}
          {app.status === "pending" && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Decision</div>
              <ApplicationActions id={app.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
