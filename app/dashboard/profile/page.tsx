import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { db, profilesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile — Venuees.in" };

export default async function ProfilePage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? "";

  const [profile] = await db
    .select({ phone: profilesTable.phone, role: profilesTable.role })
    .from(profilesTable)
    .where(eq(profilesTable.userId, user.id))
    .limit(1);

  const phone = profile?.phone ?? "";
  const role = profile?.role ?? "customer";

  const readOnlyFields = [
    { label: "Email", value: user.email ?? "—" },
    { label: "Account role", value: role.charAt(0).toUpperCase() + role.slice(1) },
    { label: "Email verified", value: user.email_confirmed_at ? "Yes" : "Pending verification" },
    { label: "Member since", value: new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Profile</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Update your name and phone number.</p>
      </div>

      <ProfileForm initialName={name} initialPhone={phone} />

      <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--line-soft)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Account details</div>
        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 10 }}>
          {readOnlyFields.map(({ label, value }) => (
            <div key={label} style={{ padding: "12px 16px", border: "1px solid var(--line-soft)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>{label}</span>
              <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
