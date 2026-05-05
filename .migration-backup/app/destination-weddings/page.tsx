import * as React from "react";
import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { destinations } from "@/lib/data";
import { Photo } from "@/components/photo";
import { destinationPhotos } from "@/lib/images";

export const metadata = {
  title: "Destination weddings — Venuees.in",
  description: "End-to-end destination weddings from Nagpur. Udaipur, Goa, Jaipur, Coorg, Jaisalmer, Rishikesh. Venues, vendors, travel and stay for your full guest list.",
};

export default function DestinationHubPage() {
  return (
    <div className="dh">
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <Photo src={destinationPhotos["udaipur"]} variant="plum" label="udaipur · pichola lake" style={{ height: "100%" }} />
        </div>
        <div className="dh-hero-content">
          <div className="eyebrow" style={{ color: "#F0D7B0", letterSpacing: "0.28em" }}>Beyond Nagpur · est. 2018</div>
          <h1>
            Your wedding, <span className="italic-serif">somewhere</span> unforgettable.
          </h1>
          <p>
            Udaipur palaces, Goa beaches, Jaipur havelis, Coorg coffee estates — we handle venue, vendors, travel, stay, and the full guest experience for destination weddings of 40–400.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Link href="#destinations" className="btn btn-primary btn-lg">Pick a destination <I.Arrow width={14} height={14} /></Link>
            <Link href="/contact" className="btn btn-ghost btn-lg" style={{ borderColor: "#FFF8EA", color: "#FFF8EA" }}>Book a planning call</Link>
          </div>
        </div>
      </section>

      <section className="dh-section" id="destinations">
        <Ornament>DESTINATIONS</Ornament>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, margin: "14px 0 10px" }}>
          Six cities. <span className="italic-serif" style={{ color: "var(--brand)" }}>One fixer in Nagpur.</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 620, lineHeight: 1.6 }}>
          We&rsquo;ve shot weddings in each of these cities. We know which palace doesn&rsquo;t allow baraat drums, which resort in Goa charges per-head corkage, and which Jaisalmer dune is actually photogenic at sunrise.
        </p>

        <div className="dh-destgrid">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destination-weddings/${d.slug}`} className={`dh-destcard ${d.feat ? "feat" : ""}`}>
              <Photo src={destinationPhotos[d.slug]} variant={d.ph} label={`${d.city.toLowerCase()} · ${d.tag.toLowerCase()}`} style={{ height: "100%" }} />
              <div className="dh-destcard-info">
                <div className="ci">
                  {d.city}
                  <em>{d.tag}</em>
                </div>
                <div className="meta">
                  <span>{d.venues} venues · from {d.from}</span>
                  <span>{d.feat ? "Our most-booked" : "Explore →"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 20 }}>
        <Ornament>PACKAGES</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "14px 0 30px" }}>
          Three tiers · all-inclusive · <span className="italic-serif" style={{ color: "var(--brand)" }}>no surprises.</span>
        </h2>
        <div className="pkg-compare">
          <div className="head"><h3>What&rsquo;s inside</h3><div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Per-head starting prices</div></div>
          <div className="head">
            <h3>Heritage</h3>
            <div className="p">₹12,500<small>/head</small></div>
          </div>
          <div className="head feat">
            <h3>Signature</h3>
            <div className="p">₹18,500<small>/head</small></div>
          </div>
          <div className="head">
            <h3>Royal</h3>
            <div className="p">₹28,000<small>/head</small></div>
          </div>

          {[
            ["Venue", "1 day · 1 event", "2 days · 3 events", "4 days · full takeover"],
            ["Stay", "2 nights · 3-star", "3 nights · 4-star hotel", "4 nights · palace/villa"],
            ["Transfers", "Airport + back", "All inter-event", "Private car + chauffeur"],
            ["Catering", "2 meals · buffet", "5 meals · 2 live stations", "All meals · chef-curated"],
            ["Décor", "Standard florals", "Themed + mandap design", "Full production · hand-installed"],
            ["Photography", "1 day · photo only", "2 days · photo + film", "4 days · photo + film + drone"],
            ["Planner", "Virtual · 3 calls", "Dedicated planner · on-site 2 days", "Full crew · on-site throughout"],
          ].map((row, i) => (
            <React.Fragment key={i}>
              <div className="rowlbl">{row[0]}</div>
              <div>{row[1]}</div>
              <div>{row[2]}</div>
              <div>{row[3]}</div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>THE 4-DAY TEMPLATE</Ornament>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "14px 0 30px" }}>
          A destination wedding, <span className="italic-serif" style={{ color: "var(--brand)" }}>day by day.</span>
        </h2>
        <div className="planner-days">
          {[
            { day: "01", title: "Arrival & Welcome", items: ["Airport transfers", "Welcome lunch · pool deck", "Haldi · early evening", "Family dinner at hotel"] },
            { day: "02", title: "Mehendi & Sangeet", items: ["Late breakfast · spa", "Mehendi · garden", "Sangeet rehearsal", "Sangeet night · DJ till 2am"] },
            { day: "03", title: "Wedding Day", items: ["Bride ready by 5am", "Baraat · horse + band", "Pheras · sunset mandap", "Reception · chef-curated dinner"] },
            { day: "04", title: "Reception & Farewell", items: ["Late brunch · hangover menu", "Group photos · heritage walk", "Farewell tea", "Airport transfers back"] },
          ].map((d) => (
            <div key={d.day} className="planner-day">
              <div className="day-no">{d.day}</div>
              <h4>{d.title}</h4>
              <ul>
                {d.items.map((i) => (<li key={i}>{i}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="enq-form">
          <div>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>Start planning</div>
            <h2>Your destination wedding, <span className="italic-serif">mapped in one call.</span></h2>
            <p>
              Tell us your dream city, rough dates, guest count, and budget. One of our senior planners will call you back with a shortlist of 3 venues, a day-by-day outline, and a transparent estimate. No deposit, no commitment.
            </p>
          </div>
          <div className="enq-fields">
            <div><label>Name</label><input placeholder="Your full name" /></div>
            <div><label>Phone / WhatsApp</label><input placeholder="+91 " /></div>
            <div className="row2">
              <div><label>Destination</label>
                <select><option>Udaipur</option><option>Goa</option><option>Jaipur</option><option>Coorg</option><option>Jaisalmer</option><option>Rishikesh</option><option>Not sure yet</option></select>
              </div>
              <div><label>Month</label>
                <select><option>Nov 2026</option><option>Dec 2026</option><option>Jan 2027</option><option>Feb 2027</option></select>
              </div>
            </div>
            <div className="row2">
              <div><label>Guests</label><input defaultValue="80" /></div>
              <div><label>Budget (INR)</label>
                <select><option>Under ₹25L</option><option>₹25L – ₹50L</option><option>₹50L – ₹1Cr</option><option>₹1Cr+</option></select>
              </div>
            </div>
            <div><label>Anything else?</label><textarea rows={3} placeholder="Preferred vibe, guest profile, specific dates..." /></div>
            <button className="enq-submit">Get a plan · free consult</button>
          </div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
