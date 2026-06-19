export const dynamic = "force-dynamic";
export const metadata = { title: "Import Venues — Venuees.in" };

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, citiesTable } from "@/lib/db";
import { cities as staticCities } from "@/lib/data";
import { ImportManager } from "./import-manager";

export default async function ImportPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  let cityOptions: { slug: string; name: string }[] = [];
  try {
    const rows = await db.select({ slug: citiesTable.slug, name: citiesTable.name }).from(citiesTable).orderBy(citiesTable.name);
    cityOptions = rows;
  } catch {
    cityOptions = staticCities.filter((c) => c.active).map((c) => ({ slug: c.slug, name: c.name }));
  }
  if (cityOptions.length === 0) {
    cityOptions = staticCities.filter((c) => c.active).map((c) => ({ slug: c.slug, name: c.name }));
  }

  const hasKey = !!process.env.GOOGLE_PLACES_API_KEY;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>
          Import Venues
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          Search Google Places for real venues and bring them into Venuees.in with one click. Imported venues go live immediately, priced as &ldquo;on request&rdquo; until you or the owner fills in pricing.
        </p>
      </div>

      {!hasKey && (
        <div style={{ background: "#fff8e8", border: "1px solid #f5c842", borderRadius: 10, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ fontWeight: 600, color: "#7a5200", marginBottom: 6, fontSize: 15 }}>
            Google Places API key not configured
          </div>
          <p style={{ fontSize: 14, color: "#7a5200", lineHeight: 1.6 }}>
            Add <code>GOOGLE_PLACES_API_KEY</code> to your environment variables (Vercel → Project Settings → Environment Variables), then redeploy. Until then, search and import are disabled.
          </p>
        </div>
      )}

      <ImportManager cityOptions={cityOptions} disabled={!hasKey} />
    </div>
  );
}
