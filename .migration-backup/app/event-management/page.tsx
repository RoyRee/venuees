import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";

export const metadata = {
  title: "Event management in Nagpur — Venuees.in",
  description: "Full-service event management — weddings, corporate events, hospitality, celebrations. Nagpur-based since 2018.",
};

const SERVICES = [
  { slug: "hospitality", name: "Hospitality", desc: "Guest stays, transport, concierge and on-ground crew for wedding parties of any size.", ph: "v2" },
  { slug: "corporate-events", name: "Corporate events", desc: "Offsites, annual days, product launches and conferences — from 30-person boardrooms to 600-person galas.", ph: "plum" },
  { slug: "celebrations", name: "Birthdays & anniversaries", desc: "Milestone birthdays, anniversary parties, baby showers. Full production, smaller scale.", ph: "rose" },
  { slug: "social", name: "Social & festival", desc: "Festive gatherings, Diwali parties, NYE soirees — curated menus, themed décor, licensed entertainment.", ph: "saffron" },
];

export default function EventMgmtPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <div className="ph dusk"><span className="ph-label">corporate gala · ballroom · nagpur</span></div>
        </div>
        <div className="dh-hero-content">
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>Event management</div>
          <h1>
            Weddings. Conferences. <span className="italic-serif">Anything with a guest list.</span>
          </h1>
          <p>
            A decade of running events across Nagpur — from 50-guest haldis to 800-person annual-day conferences. One crew, one operations manual, zero surprises.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            <Link href="/contact" className="btn btn-primary btn-lg">Brief us <I.Arrow width={14} height={14} /></Link>
            <Link href="#services" className="btn btn-ghost btn-lg" style={{ borderColor: "#FFF8EA", color: "#FFF8EA" }}>See services</Link>
          </div>
        </div>
      </section>

      <section className="dh-section" id="services">
        <Ornament>WHAT WE DO</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", margin: "14px 0 30px" }}>
          Four practices · <span className="italic-serif" style={{ color: "var(--brand)" }}>one production team.</span>
        </h2>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {SERVICES.map((s) => (
            <Link key={s.slug} href={`/event-management/${s.slug}`} className="vcard">
              <div className={`ph ${s.ph} vcard-img`} style={{ height: 280 }}>
                <span className="ph-label">{s.name.toLowerCase()}</span>
              </div>
              <div className="vcard-body">
                <h3 className="vcard-name" style={{ fontSize: 28 }}>{s.name}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 14 }}>{s.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--brand)", fontSize: 14 }}>
                  Learn more <I.Arrow width={14} height={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>WHY VENUEES</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "14px 0 30px" }}>
          Owner-run. <span className="italic-serif" style={{ color: "var(--brand)" }}>That changes everything.</span>
        </h2>
        <div className="steps">
          <div className="step"><div className="step-n">01</div><h4>One PoC, end-to-end</h4><p>Your project manager is the same person from brief to wrap. No call-centre loops, no ticket numbers.</p></div>
          <div className="step"><div className="step-n">02</div><h4>In-house crew</h4><p>Production, décor, coordination — all on our payroll. We know their strengths and schedule accordingly.</p></div>
          <div className="step"><div className="step-n">03</div><h4>Vendor leverage</h4><p>We book 300+ events a year. When we call a caterer, they answer — and they give us our price.</p></div>
          <div className="step"><div className="step-n">04</div><h4>Transparent P&L</h4><p>You see every line item. No &ldquo;miscellaneous,&rdquo; no hidden margins, no day-of surprise invoices.</p></div>
        </div>
      </section>

      <section>
        <div className="enq-form">
          <div>
            <h2>Have an event coming up?</h2>
            <p>Share the dates, guest count and rough vision — we&rsquo;ll reply within a business day with a scope and a first-pass estimate. No pitch deck fluff.</p>
          </div>
          <div className="enq-fields">
            <div><label>Name</label><input placeholder="Your full name" /></div>
            <div><label>Phone / WhatsApp</label><input placeholder="+91 " /></div>
            <div className="row2">
              <div><label>Event type</label><select><option>Wedding</option><option>Corporate</option><option>Birthday/anniversary</option><option>Festival party</option><option>Other</option></select></div>
              <div><label>Guests</label><input defaultValue="120" /></div>
            </div>
            <div className="row2">
              <div><label>Date</label><input placeholder="DD Mon YYYY" /></div>
              <div><label>Budget</label><select><option>Under ₹5L</option><option>₹5L – ₹25L</option><option>₹25L+</option><option>Not sure</option></select></div>
            </div>
            <div><label>Brief</label><textarea rows={3} placeholder="Theme, audience, must-haves..." /></div>
            <button className="enq-submit">Send brief</button>
          </div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
