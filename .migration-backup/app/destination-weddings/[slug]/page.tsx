import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { destinations, getDestinationBySlug } from "@/lib/data";
import { Photo } from "@/components/photo";
import { destinationPhotos } from "@/lib/images";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDestinationBySlug(slug);
  if (!d) return {};
  return { title: `Destination weddings in ${d.city} — Venuees.in`, description: `${d.tag} · ${d.venues} curated venues · Destination weddings from Nagpur.` };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDestinationBySlug(slug);
  if (!d) return notFound();

  return (
    <div className="dh">
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <Photo src={destinationPhotos[d.slug]} variant={d.ph} label={`${d.city.toLowerCase()} · ${d.tag.toLowerCase()}`} style={{ height: "100%" }} />
        </div>
        <div className="dh-hero-content">
          <nav style={{ fontSize: 12, color: "rgba(255,248,234,0.75)", marginBottom: 14 }}>
            <Link href="/destination-weddings" style={{ color: "inherit" }}>Destinations</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{d.city}</span>
          </nav>
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>{d.tag}</div>
          <h1>{d.city}, <span className="italic-serif">in winter.</span></h1>
          <p>{d.venues} curated venues from lake palaces to boutique havelis. Full-service planning from Nagpur — venue, vendors, travel, stay and guest experience for parties of 40–400.</p>
          <div style={{ marginTop: 24, fontSize: 13, color: "rgba(255,248,234,0.85)" }}>Package starts from <b style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#F0D7B0" }}>{d.from}</b> · 2 nights · 80 guests</div>
        </div>
      </section>

      <section className="dh-section">
        <Ornament>FEATURED VENUES IN {d.city.toUpperCase()}</Ornament>
        <div className="vgrid" style={{ marginTop: 30 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="vcard">
              <div className={`ph ${d.ph} vcard-img`} style={{ height: 220 }}>
                <span className="ph-label">{d.city.toLowerCase()} venue #{i}</span>
                <div className="badges-top"><span className="badge-assured">Handpicked</span></div>
              </div>
              <div className="vcard-body">
                <h3 className="vcard-name">The {d.city} {["Palace", "Retreat", "Haveli", "Lake House"][i - 1]}</h3>
                <div className="vcard-loc"><I.Pin width={12} height={12} /> {d.city}, India</div>
                <div className="vcard-specs">
                  <span><I.Users width={12} height={12} /> 80–250</span>
                  <span>·</span>
                  <span>{4 - (i - 1)} events</span>
                </div>
                <div className="vcard-price">
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Package from</div>
                    <b>{d.from}</b>
                  </div>
                  <span className="chip">Details</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dh-section">
        <Ornament>FOR COUPLES FROM NAGPUR</Ornament>
        <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "14px 0 20px", maxWidth: 760 }}>
          You plan from Ramdaspeth, we execute in {d.city}. <span className="italic-serif" style={{ color: "var(--brand)" }}>Single point of contact.</span>
        </h2>
        <div className="steps">
          <div className="step">
            <div className="step-n">01</div>
            <h4>Discovery call</h4>
            <p>45 minutes. We understand the couple, family dynamics, must-have rituals, budget reality.</p>
          </div>
          <div className="step">
            <div className="step-n">02</div>
            <h4>Shortlist & recce</h4>
            <p>We send three venues. You pick one. Optional recce trip — we accompany you.</p>
          </div>
          <div className="step">
            <div className="step-n">03</div>
            <h4>Production</h4>
            <p>Vendors locked, travel booked, rooms blocked for guests, itinerary sent out. You approve, we execute.</p>
          </div>
          <div className="step">
            <div className="step-n">04</div>
            <h4>On-ground crew</h4>
            <p>We fly in our team 2 days before. Day-of: wedding planner + 2 coordinators + concierge per 50 guests.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="enq-form">
          <div>
            <h2>A {d.city} wedding, <span className="italic-serif">starting now.</span></h2>
            <p>Share your dates and rough guest count — we&rsquo;ll have a shortlist of three venues in your inbox within 48 hours, with honest pricing and seasonal availability.</p>
          </div>
          <div className="enq-fields">
            <div><label>Name</label><input placeholder="Your full name" /></div>
            <div><label>Phone / WhatsApp</label><input placeholder="+91 " /></div>
            <div className="row2">
              <div><label>Month</label><select><option>Nov 2026</option><option>Dec 2026</option><option>Jan 2027</option><option>Feb 2027</option></select></div>
              <div><label>Guests</label><input defaultValue="80" /></div>
            </div>
            <div><label>Special requests</label><textarea rows={3} placeholder="Rituals, dietary needs, accessibility..." /></div>
            <button className="enq-submit">Get a {d.city} shortlist</button>
          </div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
