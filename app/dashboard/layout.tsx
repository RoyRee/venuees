import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();

  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";

  async function signOut() {
    "use server";
    const sb = await getServerSupabase();
    await sb!.auth.signOut();
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, borderRight: "1px solid var(--line)",
        display: "flex", flexDirection: "column", padding: "24px 0",
        position: "sticky", top: 0, height: "100vh", overflow: "auto",
      }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--line)" }}>
          <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", textDecoration: "none" }}>
            Venuees.in
          </Link>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>Vendor portal</div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { href: "/dashboard",            label: "Overview" },
            { href: "/dashboard/listings",   label: "My listings" },
            { href: "/dashboard/enquiries",  label: "Enquiries" },
            { href: "/dashboard/profile",    label: "Profile" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block", padding: "9px 12px", borderRadius: "var(--radius-sm)",
                fontSize: 14, color: "var(--ink-soft)", textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </div>
          <form action={signOut}>
            <button type="submit" style={{ fontSize: 13, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "40px 48px", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
