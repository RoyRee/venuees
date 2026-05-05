import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { SITE } from "@/lib/data";

export const metadata = {
  title: "About us — Venuees.in",
  description: "Bsquare Hospitality — the Nagpur team behind Venuees.in, owner-operators of Signature Resorts and the platform for the orange city's wedding ecosystem.",
};

export default function AboutPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>ABOUT</Ornament>
        <h1>A family business <span className="italic-serif" style={{ color: "var(--brand)" }}>in the wedding business.</span></h1>
        <p>
          We started in 2012 with one property — Signature Resorts on Wardha Road. Seven years later we couldn&rsquo;t in good conscience refer couples to vendors we hadn&rsquo;t vetted, so we built Venuees.in — a Nagpur-only platform where every venue and vendor is someone we&rsquo;d hire for our own sister&rsquo;s wedding.
        </p>
      </section>

      <section className="sig-strip" style={{ borderTop: "none" }}>
        <div className="sig-inner">
          <div className="sig-media ph garden"><span className="ph-label">the founding family · 2012</span></div>
          <div>
            <div className="eyebrow" style={{ color: "var(--brand)" }}>The story</div>
            <h2 style={{ fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.1, margin: "12px 0 18px" }}>
              Three generations, one address.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              Our grandfather planted the first orange grove on Wardha Road in 1968. Our father built the first banquet hall there in 1994. We turned those 14 acres into Signature Resorts in 2012. And now — with 7,800 weddings hosted across the orange city — we run the platform that most Nagpur couples use to find their hall.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", marginTop: 14 }}>
              Everyone on staff lives in Nagpur. Everyone has walked every property. And every vendor on the platform knows us by name — which means when something needs to be fixed at 4am on a Saturday, it gets fixed.
            </p>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div>
            <Ornament>WHAT WE BELIEVE</Ornament>
            <h2 className="block-title">Six rules, <span className="italic-serif" style={{ color: "var(--brand)" }}>non-negotiable.</span></h2>
          </div>
        </div>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { n: "01", t: "No middlemen commissions", p: "We never take a cut from vendors. Either they pay a flat annual listing, or they don't — but your quote is never marked up." },
            { n: "02", t: "No \"starting from\" lies", p: "Prices shown are actual prices. Final estimate rarely exceeds the quote by more than 3%." },
            { n: "03", t: "Real availability", p: "Calendar on every venue is a live mirror of their bookings system. If you see a date, it's actually free." },
            { n: "04", t: "Site-visited venues", p: "Every listing was personally inspected in the last 12 months. Photos match what you see when you walk in." },
            { n: "05", t: "Owner access", p: "For Signature Resorts and 9 partner venues, you talk to the owner. Not a sales rep." },
            { n: "06", t: "Nagpur-first always", p: "We'll grow to Pune and Mumbai in 2026. But Nagpur is home. Nagpur gets our best attention forever." },
          ].map((r) => (
            <div key={r.n} className="step">
              <div className="step-n">{r.n}</div>
              <h4>{r.t}</h4>
              <p>{r.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="block-head">
          <div>
            <Ornament>THE TEAM</Ornament>
            <h2 className="block-title">The people <span className="italic-serif" style={{ color: "var(--brand)" }}>on the ground.</span></h2>
          </div>
        </div>
        <div className="vgrid">
          {[
            { n: "Rohit Sharma", r: "Founder · Signature Resorts", ph: "v2" },
            { n: "Kavya Sharma", r: "Head of Partnerships", ph: "rose" },
            { n: "Sneha Deshmukh", r: "Day-of Operations", ph: "dusk" },
            { n: "Aniket Patil", r: "Vendor Network", ph: "garden" },
          ].map((p) => (
            <div key={p.n} className="vcard">
              <div className={`ph ${p.ph} vcard-img`} style={{ height: 280 }}>
                <span className="ph-label">{p.n.toLowerCase()}</span>
              </div>
              <div className="vcard-body">
                <h3 className="vcard-name">{p.n}</h3>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{p.r}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="hero-trust" style={{ marginTop: 0, position: "static", background: "var(--surface-tint)" }}>
          <div><span className="num">{SITE.established}</span><span>Founded</span></div>
          <div><span className="num">42</span><span>Nagpur venues listed</span></div>
          <div><span className="num">87</span><span>Vetted vendors</span></div>
          <div><span className="num">7,800+</span><span>Weddings hosted</span></div>
          <div><span className="num">4.86</span><span>Avg. couple rating</span></div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
