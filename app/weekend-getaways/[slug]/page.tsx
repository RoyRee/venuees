export const dynamic = "force-dynamic";
import { requireSection } from "@/lib/section-guard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { getGetawayBySlug } from "@/lib/db/queries";
import { Photo } from "@/components/photo";
import { getawayPhotos } from "@/lib/images";
import { EnquiryForm } from "@/components/enquiry-form";
import { RecordView } from "@/components/record-view";
import { getSiteConfig, CONFIG_DEFAULTS } from "@/lib/site-config";
import { GetawayGallery } from "@/components/getaway-gallery";
import { StickyLeadBar } from "@/components/sticky-lead-bar";
import { VenueCalendar } from "@/components/venue-calendar";
import { SiteVisitButton } from "@/components/site-visit-button";
import { PriceAlertWidget } from "@/components/price-alert-widget";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await getGetawayBySlug(slug);
  if (!g) return {};
  return { title: `${g.name} · ${g.location} — Venuees.in`, description: g.tagline };
}

function GetawayJsonLd({ g }: { g: { name: string; tagline?: string; location: string; slug: string; rating: number; reviews: number; weekday: number } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": g.name,
    "description": g.tagline ?? g.name,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": g.location,
      "addressCountry": "IN",
    },
    "url": `https://venuees.in/weekend-getaways/${g.slug}`,
    ...(g.reviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": g.rating.toFixed(1),
        "reviewCount": g.reviews,
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
    "priceRange": `₹${g.weekday.toLocaleString("en-IN")} per night`,
    "currenciesAccepted": "INR",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const ADDONS = [
  { k: "safari", name: "Jungle Safari", price: 4500, ph: "v4", desc: "6-seat jeep · 4am pickup" },
  { k: "chef", name: "Private Chef", price: 6800, ph: "saffron", desc: "3 meals · regional menu" },
  { k: "bonfire", name: "Bonfire + BBQ", price: 3200, ph: "dusk", desc: "Evening · 3 hrs · grill" },
  { k: "yoga", name: "Yoga + Breakfast", price: 2400, ph: "garden", desc: "Sunrise · instructor" },
];

export default async function GetawayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("section_getaways");
  const { slug } = await params;
  const [g, cfg] = await Promise.all([
    getGetawayBySlug(slug),
    getSiteConfig().catch(() => ({ ...CONFIG_DEFAULTS })),
  ]);
  if (!g) return notFound();

  const nights = 2;
  const subtotal = g.weekday + g.weekend; // 1 weeknight + 1 weekend night
  const cleaning = 1800;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + cleaning + taxes;

  const googleMapsUrl: string | null = null; // Google Places integration pending DB migration
  const googleRating = g.rating;
  const googleReviewCount = g.reviews;
  const hasReviews = !!(googleMapsUrl || googleRating > 0);

  return (
    <div>
      <GetawayJsonLd g={g} />
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
        <GetawayGallery 
          images={[
            { src: getawayPhotos[g.slug]?.hero, variant: g.ph, label: g.scene, alt: "Hero" },
            { src: getawayPhotos[g.slug]?.gallery[1], variant: g.ph === "garden" ? "v5" : "garden", label: "bedroom · morning light", alt: "Bedroom" },
            { src: getawayPhotos[g.slug]?.gallery[2], variant: g.ph === "ocean" ? "dusk" : "ocean", label: "private deck · sunset", alt: "Deck" }
          ]}
        />
      </section>

      <header className="gd-header">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span className="chip">{g.hoursFromNagpur}</span>
            <span className="chip outline"><Stars value={Number(googleRating)} size={12} /> {googleRating} · {googleReviewCount} reviews</span>
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

          {hasReviews && (
            <section style={{ marginTop: 40 }}>
              <Ornament>REVIEWS</Ornament>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 18px" }}>What guests say</h2>
              {(googleMapsUrl || googleRating) && (
                  <a
                    href={googleMapsUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", marginBottom: 24, borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", textDecoration: "none", fontSize: 14, color: "var(--ink)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {googleRating ? (
                      <span>
                        <strong style={{ fontSize: 16 }}>{googleRating}</strong>
                        <span style={{ color: "#fbbc05", marginLeft: 4 }}>{"★".repeat(Math.round(Number(googleRating)))}</span>
                        {googleReviewCount && <span style={{ color: "var(--ink-mute)", marginLeft: 6, fontSize: 13 }}>{Number(googleReviewCount).toLocaleString("en-IN")} reviews on Google</span>}
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#1a73e8" }}>Read on Google →</span>
                      </span>
                    ) : (
                      <span style={{ color: "#1a73e8" }}>Read on Google →</span>
                    )}
                  </a>
              )}
            </section>
          )}
        </div>

        <aside className="gd-booking">
          <div className="price-big">₹{g.weekday.toLocaleString("en-IN")}<small>/ night · weeknight</small></div>
          <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 500, marginTop: 2 }}>Weekend ₹{g.weekend.toLocaleString("en-IN")}/night</div>

          <div className="date-split">
            <div><small>Check-in</small><b>Fri · 12 Jun</b></div>
            <div><small>Check-out</small><b>Sun · 14 Jun</b></div>
          </div>

          <div style={{ margin: "20px 0" }}>
            <VenueCalendar blockedDates={[]} showMuhurat={false} />
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

          {cfg.feature_enquiries !== false ? (
            <>
              <EnquiryForm
                kind="getaway_enquiry"
                getawaySlug={g.slug}
                venueName={g.name}
                variant="sidebar"
              />
              <SiteVisitButton venueSlug={g.slug} venueName={g.name} />
              <PriceAlertWidget venueSlug={g.slug} venueName={g.name} />
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>
              Enquiries are temporarily paused. <Link href="/contact" style={{ color: "var(--brand)" }}>Contact us directly →</Link>
            </p>
          )}
        </aside>
      </header>

      <div className="mobile-sticky-cta">
        <a href={`tel:+919922151527`} className="btn btn-ghost">
          <I.Phone width={14} height={14} /> Call
        </a>
        <a href="#enquire" className="btn btn-primary">Check dates</a>
      </div>
      <RecordView slug={g.slug} name={g.name} locality={g.location} vegPlate={g.weekday} ph={g.ph} heroImage={getawayPhotos[g.slug]?.hero} type="getaway" />
      <StickyLeadBar slug={g.slug} name={g.name} type="getaway" />
      <Footer />
      <MobileTabbar />
    </div>
  );
}
