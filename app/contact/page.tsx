import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { SITE } from "@/lib/data";

export const metadata = {
  title: "Contact · Enquire — Venuees.in",
  description: "Talk to the Venuees.in team. Based in Ramdaspeth, Nagpur. Walk-ins welcome.",
};

export default function ContactPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>GET IN TOUCH</Ornament>
        <h1>Let&rsquo;s plan something <span className="italic-serif" style={{ color: "var(--brand)" }}>properly.</span></h1>
        <p>
          Share the basics and we&rsquo;ll reply within two hours during business days. Walk-ins to our Ramdaspeth studio are always welcome — tea&rsquo;s on us.
        </p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60 }} className="vl-body" >
          <div style={{ background: "var(--brand)", color: "#fff", padding: 48, borderRadius: "var(--radius-lg)" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, marginBottom: 20 }}>
              Enquire
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>
              Tell us what you&rsquo;re planning. The more you share, the sharper our first reply.
            </p>
            <div className="enq-fields">
              <div><label>Your name</label><input placeholder="Full name" /></div>
              <div className="row2">
                <div><label>Phone</label><input placeholder="+91 " /></div>
                <div><label>Email</label><input placeholder="you@example.com" /></div>
              </div>
              <div className="row2">
                <div><label>Interested in</label>
                  <select>
                    <option>Wedding venue in Nagpur</option>
                    <option>Signature Resorts specifically</option>
                    <option>Weekend getaway</option>
                    <option>Destination wedding</option>
                    <option>Vendors only</option>
                    <option>Event management</option>
                    <option>Corporate event</option>
                  </select>
                </div>
                <div><label>Guest count</label>
                  <select><option>Under 150</option><option>150-500</option><option>500-1000</option><option>1000+</option></select>
                </div>
              </div>
              <div className="row2">
                <div><label>Event month</label><input placeholder="e.g. Dec 2026" /></div>
                <div><label>Budget range</label>
                  <select><option>Under ₹5L</option><option>₹5L – ₹15L</option><option>₹15L – ₹50L</option><option>₹50L+</option></select>
                </div>
              </div>
              <div><label>Tell us more</label><textarea rows={4} placeholder="Rituals, themes, dietary needs, accessibility..." /></div>
              <button className="enq-submit">Send enquiry</button>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>No credit card · No spam · Reply in 2 hours (9am–7pm IST)</div>
            </div>
          </div>

          <aside>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28, marginBottom: 20 }}>
              <div className="eyebrow">Visit us</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, lineHeight: 1.15, margin: "10px 0 6px" }}>
                {SITE.address}
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                The Venuees.in studio is on the first floor of the Centre Point Grand building, directly above reception.
              </p>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 14, lineHeight: 1.8 }}>
                <b style={{ color: "var(--ink)" }}>Hours</b><br />
                Mon–Sat · 10am – 7pm<br />
                Sun · 11am – 4pm (by appointment)
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28, marginBottom: 20 }}>
              <div className="eyebrow">Call</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--brand)", margin: "10px 0" }}>
                {SITE.phone}
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                Direct line · reaches the duty planner. For weekends or emergencies, leave a voice note on WhatsApp.
              </p>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28 }}>
              <div className="eyebrow">Email</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", margin: "10px 0" }}>
                {SITE.email}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>
                <div>press@venuees.in</div>
                <div>vendors@venuees.in</div>
                <div>careers@venuees.in</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
