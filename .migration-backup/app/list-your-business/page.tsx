import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";

export const metadata = {
  title: "List your business — Venuees.in",
  description: "Partner with Venuees.in. Flat annual listing · zero commission on bookings · transparent analytics for venue owners and wedding vendors across Nagpur.",
};

export default function ListYourBusinessPage() {
  return (
    <div className="dh">
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg"><div className="ph garden"><span className="ph-label">venue owners · partnership</span></div></div>
        <div className="dh-hero-content">
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>For venue owners & vendors</div>
          <h1>Keep your margins. <span className="italic-serif">Grow your book.</span></h1>
          <p>
            We&rsquo;re an owner-operator platform. Meaning we charge a flat annual listing — and take zero commission on the weddings we send you. What you quote is what you keep.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <Link href="#apply" className="btn btn-primary btn-lg">Apply to list <I.Arrow width={14} height={14} /></Link>
            <Link href="/contact" className="btn btn-ghost btn-lg" style={{ borderColor: "#FFF8EA", color: "#FFF8EA" }}>Talk to partnerships</Link>
          </div>
        </div>
      </section>

      <section className="dh-section">
        <Ornament>HOW IT WORKS</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "14px 0 28px" }}>
          Flat listing. <span className="italic-serif" style={{ color: "var(--brand)" }}>No per-booking cut.</span>
        </h2>
        <div className="steps">
          <div className="step"><div className="step-n">01</div><h4>Apply</h4><p>Send us your property/portfolio. We review in 5 business days — we don&rsquo;t take everyone.</p></div>
          <div className="step"><div className="step-n">02</div><h4>Site visit</h4><p>We physically visit your venue or review your last 20 weddings. Our shoot + copy team takes 2 days.</p></div>
          <div className="step"><div className="step-n">03</div><h4>Go live</h4><p>Within 2 weeks you&rsquo;re on the platform with a branded page, booking form, and availability calendar.</p></div>
          <div className="step"><div className="step-n">04</div><h4>Grow the book</h4><p>Leads come to your inbox directly. We never insert ourselves. You negotiate, you close, you keep 100%.</p></div>
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>PRICING</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "14px 0 28px" }}>Three tiers · billed annually</h2>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { n: "Essential", p: "₹24,000 / year", tag: "For solo vendors", f: ["1 listing", "Basic profile + 20 photos", "Up to 30 leads/year", "Dashboard analytics", "Standard support"] },
            { n: "Assured", p: "₹72,000 / year", tag: "For small operators", f: ["Up to 3 listings", "Premium profile + unlimited photos", "Unlimited leads", "Priority placement in category", "Dedicated account manager"] },
            { n: "Signature", p: "₹2,40,000 / year", tag: "For flagship partners", f: ["Unlimited listings", "Custom branded pages", "Homepage + editorial features", "Priority in all searches", "Co-marketing (email + social + journal)"] },
          ].map((r, i) => (
            <div key={r.n} className="vcard" style={{ padding: 32, border: i === 1 ? "2px solid var(--brand)" : "1px solid var(--line-soft)" }}>
              {i === 1 && <div style={{ background: "var(--brand)", color: "#fff", padding: "4px 12px", fontSize: 10, letterSpacing: "0.15em", borderRadius: 10, display: "inline-block", marginBottom: 12 }}>MOST PARTNERS CHOOSE THIS</div>}
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-mute)", textTransform: "uppercase", marginBottom: 6 }}>{r.tag}</div>
              <h3 style={{ fontSize: 30, margin: "0 0 8px" }}>{r.n}</h3>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--brand)", letterSpacing: "-0.02em", marginBottom: 20 }}>{r.p}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--ink-soft)" }}>
                {r.f.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <I.Check width={16} height={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="#apply" className="btn btn-ghost" style={{ width: "100%", marginTop: 22 }}>Apply</Link>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 20, textAlign: "center" }}>
          Every plan: zero commission on bookings · direct-to-you enquiries · your brand, your rules.
        </p>
      </section>

      <section id="apply">
        <div className="enq-form">
          <div>
            <h2>Apply to list <span className="italic-serif">on Venuees.in</span></h2>
            <p>Tell us about your business. We&rsquo;ll revert within 5 business days with a fit / no-fit and the next steps.</p>
          </div>
          <div className="enq-fields">
            <div><label>Business name</label><input placeholder="e.g. Orange County Farms" /></div>
            <div><label>Owner name</label><input placeholder="Your full name" /></div>
            <div className="row2">
              <div><label>Phone</label><input placeholder="+91 " /></div>
              <div><label>Category</label>
                <select><option>Venue · hotel</option><option>Venue · lawn</option><option>Venue · heritage</option><option>Venue · farmhouse</option><option>Photography</option><option>Décor</option><option>Catering</option><option>Makeup</option><option>Music/DJ</option><option>Other vendor</option></select>
              </div>
            </div>
            <div><label>Website / Instagram / portfolio link</label><input placeholder="URL" /></div>
            <div><label>Tell us about your work</label><textarea rows={4} placeholder="Years in business, last 3 weddings, capacity..." /></div>
            <button className="enq-submit">Submit application</button>
          </div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
