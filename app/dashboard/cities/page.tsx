export const dynamic = "force-dynamic";
export const metadata = { title: "Operational Cities — Venuees.in" };

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, citiesTable } from "@/lib/db";
import { CitiesManager } from "./cities-manager";

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS cities (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO cities (name, slug, lat, lng)
VALUES ('Nagpur', 'nagpur', 21.1458, 79.0882)
ON CONFLICT (slug) DO NOTHING;`;

export default async function CitiesPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  let cities: { id: number; name: string; slug: string; lat: number; lng: number; isActive: boolean; createdAt: Date }[] = [];
  let tableReady = true;

  try {
    cities = await db.select().from(citiesTable).orderBy(citiesTable.name);
  } catch {
    tableReady = false;
  }

  return (
    <div className="dash-page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>
          Operational Cities
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          Cities where Venuees.in is live. Users near each city will automatically see it as their local market.
        </p>
      </div>

      {!tableReady && (
        <div style={{ background: "#fff8e8", border: "1px solid #f5c842", borderRadius: 10, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ fontWeight: 600, color: "#7a5200", marginBottom: 10, fontSize: 15 }}>
            One-time setup required
          </div>
          <p style={{ fontSize: 14, color: "#7a5200", marginBottom: 14, lineHeight: 1.6 }}>
            The <code>cities</code> table does not exist yet. Run the SQL below in the{" "}
            <strong>Supabase Dashboard → SQL Editor</strong>, then refresh this page.
          </p>
          <pre style={{
            background: "#1e1e1e", color: "#d4d4d4", padding: "16px 20px",
            borderRadius: 8, fontSize: 13, overflowX: "auto", lineHeight: 1.6,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {SETUP_SQL}
          </pre>
        </div>
      )}

      {tableReady && <CitiesManager initialCities={cities} />}
    </div>
  );
}
