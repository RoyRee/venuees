import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";

type Service = {
  name: string;
  headline: string;
  italic: string;
  ph: string;
  blurb: string;
  pillars: { n: string; t: string; p: string }[];
  scope: string[];
  rates: { n: string; p: string; includes: string[] }[];
};

const SERVICES: Record<string, Service> = {
  hospitality: {
    name: "Hospitality",
    headline: "Your guests should feel picked up.",
    italic: "Not processed.",
    ph: "v2",
    blurb:
      "From airport greeting to farewell chai — we handle the entire guest journey. Room blocks, transport rotations, mehendi-day breakfast, dietary preferences, grandparent care — every touchpoint.",
    pillars: [
      { n: "01", t: "Arrival grid", p: "Airport + railway pickups, welcome kit, room keys in-hand before they land." },
      { n: "02", t: "Transport rota", p: "4 vehicles on standby for every 50 guests. Hotline, driver training, bilingual crew." },
      { n: "03", t: "In-stay concierge", p: "1 hospitality crew per 30 guests. WhatsApp channel, 16-hour availability, real response times." },
      { n: "04", t: "Farewell flow", p: "Checkout orchestration, baggage claim, return transfers, thank-you hamper." },
    ],
    scope: [
      "Room blocking & rate negotiation at partner hotels",
      "Airport + railway pickups · 3-tier cars",
      "Welcome kits · personalized per guest tier",
      "Breakfast/lunch/dinner coordination with hotel F&B",
      "Dietary mapping (Jain/vegan/allergies) across all meals",
      "In-stay WhatsApp concierge · 16 hrs/day",
      "Senior-citizen + kids care · dedicated crew",
      "Multi-hotel shuttle rota for inter-event transport",
      "Farewell kits + airport drop coordination",
    ],
    rates: [
      { n: "Essential", p: "₹1,800 / guest / day", includes: ["Room blocking", "Single pickup + drop", "Basic welcome kit", "Shared concierge"] },
      { n: "Signature", p: "₹3,600 / guest / day", includes: ["All Essential features", "Dedicated crew (1 per 30)", "Custom kits + dietary mapping", "Multi-event shuttle rota"] },
      { n: "Royal", p: "₹6,200 / guest / day", includes: ["All Signature features", "Private car per family", "White-glove concierge (1 per 15)", "VIP protocol + gift orchestration"] },
    ],
  },
  "corporate-events": {
    name: "Corporate events",
    headline: "Conferences, offsites,",
    italic: "annual days.",
    ph: "plum",
    blurb:
      "We&rsquo;ve run offsites for IT campuses on MIHAN, banking annual days at Chitnavis, pharma launches at Radisson, and EdTech townhalls at Centre Point. Predictable production, measurable outcomes.",
    pillars: [
      { n: "01", t: "Brief → scope", p: "We translate your theme and KPI into a production sheet, signed off before anything moves." },
      { n: "02", t: "Pre-production", p: "Venue scouting, AV design, stage + screen mapping, rehearsals — 2 weeks before showtime." },
      { n: "03", t: "Show day", p: "Director, stage manager, AV team, 2 floor managers, runners, emcee liaison — one command centre." },
      { n: "04", t: "Measurement", p: "Attendance, NPS, session-wise ratings, highlight reel · delivered within 48 hours." },
    ],
    scope: [
      "Venue sourcing across Nagpur + Vidarbha",
      "Stage design · LED backdrops · content production",
      "Audio-visual: mic, sound, cameras, live streaming",
      "Registration desk · digital badges · RFID tracking",
      "Speaker management · green room · teleprompter",
      "F&B: breakfast, lunch, high-tea, cocktails, dinner",
      "Entertainment booking (DJ, band, MC, performers)",
      "Photography + cinematography + same-day edits",
      "Post-event data: NPS, highlight reel, media kit",
    ],
    rates: [
      { n: "Offsite", p: "from ₹4,500 / head / day", includes: ["Venue + AV + meals", "1-day · up to 100 pax", "2 breakout rooms", "Photo coverage"] },
      { n: "Annual Day", p: "from ₹7,200 / head", includes: ["Full production", "2-hr program + cocktails", "DJ + emcee + performer", "Video + NPS report"] },
      { n: "Conference", p: "from ₹12,000 / head / day", includes: ["2-day flagship event", "Live streaming + on-demand", "Branded swag + badges", "Press + LinkedIn assets"] },
    ],
  },
  celebrations: {
    name: "Birthdays & anniversaries",
    headline: "Milestone moments,",
    italic: "properly produced.",
    ph: "rose",
    blurb:
      "60th birthdays, silver jubilees, baby showers, surprise engagements. Smaller scale than weddings — same care, same production values.",
    pillars: [
      { n: "01", t: "The story", p: "We start with the guest of honour — what matters to them, what the room should feel like." },
      { n: "02", t: "The room", p: "Venue sized right. Décor pitched to mood, not to Instagram. Menu curated to the person." },
      { n: "03", t: "The moments", p: "Video tribute, speeches-with-slideshow, surprise live act — 2-3 peak moments, orchestrated." },
      { n: "04", t: "The memory", p: "Professional photo-video, highlight reel within 72 hrs, printed album in 3 weeks." },
    ],
    scope: [
      "Venue at partner hotels, lawns, or private residences",
      "Themed décor · florals, lights, table settings",
      "Curated menus with chef consultation",
      "Bartending + mocktail station",
      "DJ / live band / acoustic duo",
      "Video tribute · family interviews · slideshow",
      "Photo + film coverage",
      "Gift table · guest book · printable takeaways",
      "Day-of coordinator + backup crew",
    ],
    rates: [
      { n: "Intimate", p: "from ₹2.5L", includes: ["30-60 guests", "Private residence or boutique hall", "Décor + catering", "Photo + slideshow"] },
      { n: "Classic", p: "from ₹6L", includes: ["80-150 guests", "Hotel banquet", "Themed décor + live band", "Photo + film + album"] },
      { n: "Grand", p: "from ₹12L", includes: ["200+ guests", "Premium hall or resort", "Full production", "Multi-day weekend plan"] },
    ],
  },
  social: {
    name: "Social & festival",
    headline: "When the calendar",
    italic: "demands a party.",
    ph: "saffron",
    blurb:
      "Diwali parties, NYE soirees, Holi brunches, festival-weekend specials. High-turnover, high-energy events built for the social circuit.",
    pillars: [
      { n: "01", t: "Concept", p: "We design a look and theme 60 days out — invites, visual identity, dress code." },
      { n: "02", t: "Venue + vibe", p: "Rooftop, farmhouse, ballroom — scouted to match the number of guests and the season." },
      { n: "03", t: "Menu + bar", p: "Small-plate stations, signature cocktails, a dessert moment. Dietary flexibility built-in." },
      { n: "04", t: "Entertainment", p: "DJ line-ups, live music, dance performances, surprise acts — the &lsquo;did that really just happen&rsquo; factor." },
    ],
    scope: [
      "Theme + invite design",
      "Venue scouting (rooftops, farmhouses, ballrooms)",
      "Décor: lights, florals, installations",
      "Live cooking stations + mixology",
      "DJ line-up + live acts",
      "Photo booth · 360 video · highlight reels",
      "Guest list management · RSVP tool",
      "Bouncer + valet coordination",
      "Post-event highlight edit",
    ],
    rates: [
      { n: "Intimate", p: "from ₹3L", includes: ["40-80 guests", "Private rooftop or home", "Bar + snacks", "Live music"] },
      { n: "Social", p: "from ₹8L", includes: ["100-200 guests", "Themed venue + décor", "Full bar + chef menu", "DJ till late"] },
      { n: "Signature", p: "from ₹16L", includes: ["300+ guests", "Bigger venues + installations", "Multi-zone bar + food", "Live act headliner"] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) return {};
  return { title: `${s.name} — Event management · Venuees.in`, description: s.blurb };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) return notFound();

  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <div className={`ph ${s.ph}`}><span className="ph-label">{s.name.toLowerCase()}</span></div>
        </div>
        <div className="dh-hero-content">
          <nav style={{ fontSize: 12, color: "rgba(255,248,234,0.75)", marginBottom: 14 }}>
            <Link href="/event-management" style={{ color: "inherit" }}>Event management</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{s.name}</span>
          </nav>
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>{s.name}</div>
          <h1>{s.headline} <span className="italic-serif">{s.italic}</span></h1>
          <p>{s.blurb}</p>
        </div>
      </section>

      <section className="dh-section">
        <Ornament>HOW WE WORK</Ornament>
        <h2 style={{ fontSize: "clamp(30px, 3.6vw, 44px)", margin: "14px 0 30px" }}>Four pillars · <span className="italic-serif" style={{ color: "var(--brand)" }}>zero gaps.</span></h2>
        <div className="steps">
          {s.pillars.map((p) => (
            <div key={p.n} className="step">
              <div className="step-n">{p.n}</div>
              <h4>{p.t}</h4>
              <p>{p.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>SCOPE</Ornament>
        <h2 style={{ fontSize: "clamp(30px, 3.6vw, 44px)", margin: "14px 0 24px" }}>What&rsquo;s in a typical engagement</h2>
        <div className="amen-grid">
          {s.scope.map((item, i) => (
            <div key={i} className="amen-cell" style={{ textAlign: "left", alignItems: "flex-start" }}>
              <I.Check width={20} height={20} />
              <span style={{ fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>PRICING TIERS</Ornament>
        <h2 style={{ fontSize: "clamp(30px, 3.6vw, 44px)", margin: "14px 0 24px" }}>Three tiers · customised on brief</h2>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {s.rates.map((r, i) => (
            <div key={r.n} className="vcard" style={{ padding: 28, border: i === 1 ? "2px solid var(--brand)" : "1px solid var(--line-soft)" }}>
              {i === 1 && (
                <div style={{ position: "absolute", top: -12, left: 20, background: "var(--brand)", color: "#fff", padding: "4px 12px", fontSize: 10, letterSpacing: "0.15em", borderRadius: 10 }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--ink-mute)", textTransform: "uppercase", marginBottom: 6 }}>Tier {i + 1}</div>
              <h3 style={{ fontSize: 28, margin: "0 0 6px" }}>{r.n}</h3>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--brand)", letterSpacing: "-0.02em", marginBottom: 18 }}>
                {r.p}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--ink-soft)" }}>
                {r.includes.map((inc) => (
                  <li key={inc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <I.Check width={16} height={16} style={{ color: "var(--accent)", flexShrink: 0 }} /> {inc}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn btn-ghost" style={{ width: "100%", marginTop: 22 }}>Get a quote</Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
