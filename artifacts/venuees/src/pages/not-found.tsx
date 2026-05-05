import { Link } from "wouter";
import { TopNav, MobileNav } from "../components/nav";
import { Footer } from "../components/footer";

export default function NotFound() {
  return (
    <div>
      <MobileNav />
      <TopNav />
      <section className="page-hero" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(60px, 8vw, 120px)", color: "var(--brand)" }}>404</h1>
        <h2 style={{ marginTop: 12 }}>Page not found</h2>
        <p style={{ marginTop: 16, color: "var(--ink-soft)" }}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div style={{ marginTop: 30 }}>
          <Link href="/" className="btn btn-primary btn-lg">Back to home</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
