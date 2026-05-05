import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";

export const metadata = {
  title: "Journal — Venuees.in",
  description: "Writing from the Venuees.in team — planning guides, vendor deep-dives, and the real numbers behind Nagpur weddings.",
};

const POSTS = [
  { slug: "nagpur-wedding-budget-2026", title: "The real cost of a Nagpur wedding in 2026", category: "Planning", read: "8 min", ph: "v2", date: "Mar 14, 2026" },
  { slug: "winter-vs-monsoon", title: "Winter vs. monsoon weddings in Vidarbha — a data story", category: "Seasons", read: "6 min", ph: "garden", date: "Feb 28, 2026" },
  { slug: "signature-resorts-tour", title: "A walkthrough of Signature Resorts · four venues inside one compound", category: "Venues", read: "5 min", ph: "dusk", date: "Feb 12, 2026" },
  { slug: "vendor-red-flags", title: "5 vendor red flags we've learned to spot", category: "Vendors", read: "7 min", ph: "rose", date: "Jan 30, 2026" },
  { slug: "interfaith-weddings", title: "Interfaith weddings in Nagpur — logistics and etiquette", category: "Culture", read: "9 min", ph: "plum", date: "Jan 18, 2026" },
  { slug: "farmhouse-wedding-guide", title: "Farmhouse weddings · what nobody tells you about the bathrooms", category: "Planning", read: "4 min", ph: "v5", date: "Dec 22, 2025" },
];

export default function BlogPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>JOURNAL</Ornament>
        <h1>Writing from <span className="italic-serif" style={{ color: "var(--brand)" }}>the Venuees team.</span></h1>
        <p>
          Planning guides, vendor deep-dives, venue walk-throughs, and the honest numbers behind weddings in the orange city.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          {["All", "Planning", "Venues", "Vendors", "Culture", "Seasons"].map((c) => (
            <span key={c} className={c === "All" ? "chip" : "chip outline"}>{c}</span>
          ))}
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <Link href={`/blog/${POSTS[0].slug}`} className="vcard" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", marginBottom: 40, overflow: "hidden" }}>
          <div className={`ph ${POSTS[0].ph}`} style={{ minHeight: 380 }}><span className="ph-label">{POSTS[0].title.toLowerCase()}</span></div>
          <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="eyebrow" style={{ color: "var(--brand)" }}>Featured · {POSTS[0].category}</div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.1, margin: "12px 0 16px" }}>
              {POSTS[0].title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: 20 }}>
              We pulled data from 312 weddings we managed in 2025 and broke it down by venue type, guest count, and season. Here&rsquo;s what you&rsquo;re actually going to spend — and where the surprises hide.
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--ink-mute)" }}>
              <span>{POSTS[0].date}</span>
              <span>·</span>
              <span>{POSTS[0].read} read</span>
            </div>
          </div>
        </Link>

        <div className="vgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {POSTS.slice(1).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="vcard">
              <div className={`ph ${p.ph} vcard-img`} style={{ height: 200 }}>
                <span className="ph-label">{p.category.toLowerCase()}</span>
              </div>
              <div className="vcard-body">
                <div className="eyebrow" style={{ color: "var(--brand)", fontSize: 10 }}>{p.category}</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.2, margin: "8px 0 10px", letterSpacing: "-0.01em" }}>{p.title}</h3>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-mute)", marginTop: "auto" }}>
                  <span>{p.date}</span><span>·</span><span>{p.read} read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
