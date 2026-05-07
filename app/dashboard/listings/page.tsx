import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My listings — Venuees.in" };

export default function ListingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>My listings</h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Manage your venues, vendor profiles, and getaways.</p>
      </div>
      <div style={{ padding: "48px 36px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 10 }}>No listings yet</div>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>Submit a listing application to get started.</p>
        <Link href="/listings" className="btn btn-primary">Apply for a listing →</Link>
      </div>
    </div>
  );
}
