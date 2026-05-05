import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { getaways, getGetawayBySlug } from "@/lib/data";
import { Photo } from "@/components/photo";
import { getawayPhotos } from "@/lib/images";

export function generateStaticParams() {
  return getaways.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGetawayBySlug(slug);
  if (!g) return {};
  return { title: `${g.name} · ${g.location} — Venuees.in`, description: g.tagline };
}

const ADDONS = [
  { k: "safari", name: "Jungle Safari", price: 4500, ph: "v4", desc: "6-seat jeep · 4am pickup" },
  { k: "chef", name: "Private Chef", price: 6800, ph: "saffron", desc: "3 meals · regional menu" },
  { k: "bonfire", name: "Bonfire + BBQ", price: 3200, ph: "dusk", desc: "Evening · 3 hrs · grill" },
  { k: "yoga", name: "Yoga + Breakfast", price: 2400, ph: "garden", desc: "Sunrise · instructor" },
];

export default async function GetawayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGetawayBySlug(slug);
  if (!g) return notFound();

  const nights = 2;
  const subtotal = g.weekday + g.weekend; // 1 weeknight + 1 weekend night
  const cleaning = 1800;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + cleaning + taxes;

  return (
    <div>
      <MobileNav />
      <TopNav />

      <nav className="vd-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/weekend-getaways">Weekend getaways</Link>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{g.name}</span>
      </nav>

      <section className="gd-hero">
        <div className="gd-hero-grid">
          <div>
            <Photo src={getawayPhotos[g.slug]?.hero} variant={g.ph} label={g.scene} style={{ height: "100%" }} />
          </div>
          <div>
            <Photo src={getawayPhotos[g.slug]?.gallery[1]} variant={g.ph === "garden" ? "v5" : "garden"} label="bedroom · morning light" style={{ height: "100%" }} />
            <Photo src={getawayPhotos[g.slug]?.gallery[2]} variant={g.ph === "ocean" ? "dusk" : "ocean"} label="private deck · sunset" style={{ height: "100%" }} />
          </div>
        </div>
      </section>

      <header className="gd-header">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span className="chip">{g.hoursFromNagpur}</span>
            <span className="chip outline"><Stars value={g.rating} size={12} /> {g.rating} · {g.reviews} reviews</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 4.4vw, 60px)", lineHeight: 1.02, marginBottom: 12 }}>
            {g.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-soft)", fontSize: 14 }}>
            <I.Pin width={14} height={14} /> {g.location}
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic", color: "var(--brand)", marginTop: 18 }}>
            &ldquo;{g.tagline}&rdquo;
          </p>

          <div className="gd-specs-row">
            <div><I.Bed width={16} height={16} /> {g.beds} bedrooms</div>
            <div><I.Users width={16} height={16} /> Up to {g.guests} guests</div>
            <div><I.Pool width={16} height={16} /> Private pool</div>
            <div><I.Wifi width={16} height={16} /> Wi-Fi + work desk</div>
            <div><I.Utensils width={16} height={16} /> Chef on-call</div>
            <div><I.Car width={16} height={16} /> Gated parking</div>
          </div>

          <section style={{ marginTop: 30 }}>
            <Ornament>THE STAY</Ornament>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 14px" }}>A {g.beds}-bedroom villa held just for your party.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 680 }}>
              Four acres of fenced grounds, a pool that looks like it&rsquo;s been there forever, and a kitchen that smells of filter coffee at 6am. The property is yours end-to-end — no other bookings on your dates, no neighbors sharing the pool. We keep it that way on purpose.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 680, marginTop: 14 }}>
              The villa comes with a resident cook and housekeeper; stock the pantry yourself from the village market, or pre-order a menu and we&rsquo;ll have groceries waiting when you arrive.
            </p>
          </section>

          <section style={{ marginTop: 40 }}>
            <Ornament>ADD-ONS</Ornament>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 18px" }}>Make a weekend of it.</h2>
            <div className="gd-addons">
              {ADDONS.map((a) => (
                <div key={a.k} className="gd-addon">
                  <div className="check"><I.Check width={11} height={11} /></div>
                  <div className={`ph ${a.ph}`}><span className="ph-label">{a.name.toLowerCase()}</span></div>
                  <h5>{a.name}</h5>
                  <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>{a.desc}</div>
                  <div className="price">+₹{a.price.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <Ornament>NEARBY</Ornament>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 18px" }}>Within 30 minutes of the villa.</h2>
            <div className="gd-nearby">
              <div>
                <div className="ph garden" />
                <div className="lbl">
                  <h5>Core forest gate</h5>
                  <small>12 min drive</small>
                </div>
              </div>
              <div>
                <div className="ph ocean" />
                <div className="lbl">
                  <h5>Lake viewpoint</h5>
                  <small>8 min drive</small>
                </div>
              </div>
              <div>
                <div className="ph v5" />
                <div className="lbl">
                  <h5>Village market</h5>
                  <small>4 min drive</small>
                </div>
              </div>
              <div>
                <div className="ph v3" />
                <div className="lbl">
                  <h5>Heritage temple</h5>
                  <small>18 min drive</small>
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <Ornament>HOUSE RULES</Ornament>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 18, fontSize: 14, color: "var(--ink-soft)" }}>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Check-in · Check-out</b>2pm · 11am · Early/late on request</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Pets</b>On request · one dog max · ₹1,500/night</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Smoking</b>Outdoor only</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Events</b>Small gatherings ok · no DJs past 10pm</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Cancellation</b>Free up to 72 hrs before check-in</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Security deposit</b>₹10,000 refundable on checkout</div>
            </div>
          </section>
        </div>

        <aside className="gd-booking">
          <div className="price-big">₹{g.weekday.toLocaleString("en-IN")}<small>/ night · weeknight</small></div>
          <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 500, marginTop: 2 }}>Weekend ₹{g.weekend.toLocaleString("en-IN")}/night</div>

          <div className="date-split">
            <div><small>Check-in</small><b>Fri · 12 Jun</b></div>
            <div><small>Check-out</small><b>Sun · 14 Jun</b></div>
          </div>
          <div className="guest-line">
            <div>
              <small style={{ display: "block", fontSize: 10, letterSpacing: "0.15em", color: "var(--ink-mute)", textTransform: "uppercase" }}>Guests</small>
              <b>{g.guests} adults · 0 kids</b>
            </div>
            <button style={{ color: "var(--brand)" }}><I.Arrow width={14} height={14} /></button>
          </div>

          <div className="price-breakdown">
            <div><span>₹{g.weekday.toLocaleString("en-IN")} × 1 weeknight</span><span>₹{g.weekday.toLocaleString("en-IN")}</span></div>
            <div><span>₹{g.weekend.toLocaleString("en-IN")} × 1 weekend</span><span>₹{g.weekend.toLocaleString("en-IN")}</span></div>
            <div><span>Cleaning & setup</span><span>₹{cleaning.toLocaleString("en-IN")}</span></div>
            <div><span>Taxes (GST)</span><span>₹{taxes.toLocaleString("en-IN")}</span></div>
            <div className="total"><span>Total · {nights} nights</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 14 }}>
            Request this stay <I.Arrow width={14} height={14} />
          </button>
          <div className="tinyline" style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "center", marginTop: 8 }}>
            Owner replies within 2 hours · No charge until confirmed
          </div>
        </aside>
      </header>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
