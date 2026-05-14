import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile — Venuees.in" };

export default async function ProfilePage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? "";

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>Profile</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Your account details.</p>
      </div>

      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
        {[
          { label: "Full name", value: name || "—" },
          { label: "Email", value: user.email ?? "—" },
          { label: "Account created", value: new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
          { label: "Email verified", value: user.email_confirmed_at ? "Yes" : "Pending verification" },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "16px 20px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
