import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { getSiteConfig } from "@/lib/site-config";
import { ApplyForm } from "@/app/list-your-business/apply-form";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add listing — Admin — Venuees.in" };

export default async function AdminAddListingPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/add-listing");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  const cfg = await getSiteConfig().catch(() => null);

  const enabledTypes = (
    [
      cfg?.section_venues   !== false ? "venue"   : null,
      cfg?.section_vendors  !== false ? "vendor"  : null,
      cfg?.section_getaways !== false ? "getaway" : null,
    ] as const
  ).filter(Boolean) as ("venue" | "vendor" | "getaway")[];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--ink-mute)", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ color: "var(--ink-mute)", fontSize: 12 }}>›</span>
          <span style={{ fontSize: 13, color: "var(--ink)" }}>Add listing</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 6vw, 36px)", color: "var(--ink)", marginBottom: 6 }}>
          Add a listing
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 540 }}>
          List a venue or vendor on behalf of the owner. They&rsquo;ll receive an email notification and can claim the listing by signing up with the email you provide.
        </p>
      </div>

      <div style={{
        background: "#f0f4ff",
        border: "1px solid #c7d4f0",
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 24,
        fontSize: 13,
        color: "#5b6ea8",
        lineHeight: 1.6,
      }}>
        <strong>Admin mode:</strong> The &ldquo;Owner&rsquo;s email&rdquo; field will appear in the form. The listing won&rsquo;t be linked to your admin account — instead, when the owner signs up with that email, the listing will automatically appear in their dashboard.
      </div>

      <div style={{ maxWidth: 600 }}>
        <ApplyForm
          prefillEmail={user.email ?? ""}
          prefillName=""
          enabledTypes={enabledTypes}
          adminMode
        />
      </div>
    </div>
  );
}
