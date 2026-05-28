import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";

export function SectionDisabled({ label }: { label: string }) {
  return (
    <div>
      <MobileNav />
      <TopNav />
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.3 }}>🔒</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "var(--ink)", marginBottom: 12 }}>
          Coming soon
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
          The <strong>{label}</strong> section is temporarily unavailable. Check back soon — we&rsquo;re working on it.
        </p>
        <Link href="/" className="btn btn-primary btn-lg">Back to home</Link>
      </div>
      <Footer />
      <MobileTabbar />
    </div>
  );
}
