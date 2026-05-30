export const dynamic = "force-dynamic";
export const metadata = { title: "Operational Cities — Venuees.in" };

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { db, citiesTable } from "@/lib/db";
import { CitiesManager } from "./cities-manager";

export default async function CitiesPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  const cities = await db.select().from(citiesTable).orderBy(citiesTable.name);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>
          Operational Cities
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          Cities where Venuees.in is live. Users near each city will see it as their local market.
          Run <code style={{ fontSize: 13, background: "var(--surface-tint)", padding: "1px 6px", borderRadius: 4 }}>POST /api/admin/migrate</code> first to create the table if needed.
        </p>
      </div>
      <CitiesManager initialCities={cities} />
    </div>
  );
}
