import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, savedListingsTable, venuesTable, vendorsTable } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved — Venuees.in" };

export default async function SavedPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const saved = await db.select().from(savedListingsTable).where(eq(savedListingsTable.userId, user.id));

  const venueSlugs = saved.filter((s) => s.type === "venue").map((s) => s.slug);
  const vendorSlugs = saved.filter((s) => s.type === "vendor").map((s) => s.slug);

  const [venues, vendors] = await Promise.all([
    venueSlugs.length ? db.select({ id: venuesTable.id, name: venuesTable.name, slug: venuesTable.slug, locality: venuesTable.locality, type: venuesTable.type, contactPhone: venuesTable.contactPhone, whatsapp: venuesTable.whatsapp }).from(venuesTable).where(inArray(venuesTable.slug, venueSlugs)) : Promise.resolve([]),
    vendorSlugs.length ? db.select({ id: vendorsTable.id, name: vendorsTable.name, slug: vendorsTable.slug, category: vendorsTable.category, categorySlug: vendorsTable.categorySlug, contactPhone: vendorsTable.contactPhone, whatsapp: vendorsTable.whatsapp }).from(vendorsTable).where(inArray(vendorsTable.slug, vendorSlugs)) : Promise.resolve([]),
  ]);

  return (
    <div className="dash-page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Saved</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>{saved.length} saved listing{saved.length !== 1 ? "s" : ""}</p>
      </div>

      {saved.length === 0 ? (
        <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 10 }}>Nothing saved yet</div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>Tap the heart on any venue or vendor to save it here.</p>
          <Link href="/venues" className="btn btn-primary">Browse venues →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {venues.map((v) => (
            <div key={v.id} style={{ padding: "18px 20px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 2 }}>{v.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{v.type} · {v.locality}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {v.contactPhone && (
                  <a href={`tel:${v.contactPhone}`} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", color: "var(--ink)", textDecoration: "none" }}>
                    📞 Call
                  </a>
                )}
                {v.whatsapp && (
                  <a href={`https://wa.me/${v.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#25d366", color: "#fff", textDecoration: "none" }}>
                    WhatsApp
                  </a>
                )}
                <Link href={`/venues/nagpur/${v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-")}/${v.slug}`} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "var(--brand)", color: "#fff", textDecoration: "none" }}>
                  View →
                </Link>
              </div>
            </div>
          ))}
          {vendors.map((v) => (
            <div key={v.id} style={{ padding: "18px 20px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 2 }}>{v.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{v.category}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {v.contactPhone && (
                  <a href={`tel:${v.contactPhone}`} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", color: "var(--ink)", textDecoration: "none" }}>
                    📞 Call
                  </a>
                )}
                {v.whatsapp && (
                  <a href={`https://wa.me/${v.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#25d366", color: "#fff", textDecoration: "none" }}>
                    WhatsApp
                  </a>
                )}
                <Link href={`/vendors/${v.categorySlug}/${v.slug}`} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "var(--brand)", color: "#fff", textDecoration: "none" }}>
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
