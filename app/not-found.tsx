import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";

export default function NotFound() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero" style={{ textAlign: "center", padding: "100px 24px" }}>
        <Ornament>404</Ornament>
        <h1 style={{ fontSize: "clamp(56px, 8vw, 120px)", lineHeight: 1, margin: "24px 0" }}>
          <span className="italic-serif" style={{ color: "var(--brand)" }}>Not found.</span>
        </h1>
        <p style={{ maxWidth: 440, margin: "0 auto 28px" }}>
          The page you&rsquo;re looking for has moved, been renamed, or never existed. Let&rsquo;s get you back to the good stuff.
        </p>
        <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" className="btn btn-primary btn-lg">Homepage <I.Arrow width={14} height={14} /></Link>
          <Link href="/venues" className="btn btn-ghost btn-lg">Browse venues</Link>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
