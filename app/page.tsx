export const dynamic = "force-dynamic";
import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { Photo } from "@/components/photo";
import { SITE } from "@/lib/data";
import { venueHero, getawayPhotos, destinationPhotos, realWeddingPhotos } from "@/lib/images";
import { HeroSearch } from "@/components/hero-search";
import { CarouselWrap } from "@/components/carousel-wrap";
import { HeroCarousel } from "@/components/hero-carousel";
import { SignatureCarousel } from "@/components/signature-carousel";
import { getVenues, getGetaways, getDestinations, getRealWeddings } from "@/lib/db/queries";
import { getSiteConfig, getSiteContent, CONFIG_DEFAULTS, CONTENT_DEFAULTS } from "@/lib/site-config";

export default async function HomePage() {
  const [[venues, getaways, destinations, realWeddings], cfg, siteContent] = await Promise.all([
    Promise.all([getVenues(), getGetaways(), getDestinations(), getRealWeddings()]).catch(() => [[], [], [], []] as const),
    getSiteConfig(),
    getSiteContent(),
  ]).catch(() => [[[], [], [], []], CONFIG_DEFAULTS, CONTENT_DEFAULTS] as const);
  const signatures = venues.filter((v) => v.isSignature);
  const featured = venues.filter((v) => !v.isSignature).slice(0, 4);

  return (
    <div className="home">
      <MobileNav />
      <TopNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <HeroCarousel images={siteContent.hero_images} interval={siteContent.hero_carousel_interval} />
        </div>
        <div className="hero-content">
          <div className="eyebrow" style={{ color: "#F0D7B0", letterSpacing: "0.28em" }}>
            Nagpur · est. {SITE.established}
          </div>
          <h1 className="hero-title">
            Crafted for <span className="italic-serif">celebrations.</span>
          </h1>
          <p className="hero-sub">
            Owner-operated venues and vetted vendors across Nagpur. No middlemen, no &ldquo;starting from&rdquo; pricing — the quote is the quote.
          </p>

          <HeroSearch />

          <div className="hero-chips">
            <Link href="/venues?type=lawn" className="chip outline" style={{ color: "#FFF8EA", borderColor: "rgba(255,248,234,0.4)" }}>Lawns & farmhouses</Link>
            <Link href="/venues?type=hotel" className="chip outline" style={{ color: "#FFF8EA", borderColor: "rgba(255,248,234,0.4)" }}>Hotels & ballrooms</Link>
            <Link href="/venues?type=heritage" className="chip outline" style={{ color: "#FFF8EA", borderColor: "rgba(255,248,234,0.4)" }}>Heritage havelis</Link>
            <Link href="/venues?type=resort" className="chip outline" style={{ color: "#FFF8EA", borderColor: "rgba(255,248,234,0.4)" }}>Resorts</Link>
          </div>
        </div>

        <div className="container">
          <div className="hero-trust">
            {(Array.isArray(siteContent.hero_stats) ? siteContent.hero_stats : []).map((s, i) => (
              <div key={i}><span className="num">{s.num}</span><span>{s.label}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE STRIP */}
      {cfg.section_venues && signatures.length > 0 && (
        <section className="sig-strip">
          <SignatureCarousel
            venues={signatures}
            interval={siteContent.flagship_carousel_interval}
            cfg={cfg}
          />
        </section>
      )}

      {/* FEATURED VENUES */}
      {cfg.section_venues && <section className="block">
        <div className="block-head">
          <div>
            <Ornament>NAGPUR VENUES</Ornament>
            <h2 className="block-title">
              Handpicked halls. <span className="italic-serif" style={{ color: "var(--brand)" }}>Honest numbers.</span>
            </h2>
          </div>
          <Link href="/venues" className="block-link">All 42 venues <I.Arrow width={12} height={12} /></Link>
        </div>
        <CarouselWrap count={featured.length}>
        <div className="vgrid">
          {featured.map((v) => (
            <Link key={v.slug} href={`/venues/nagpur/${v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-")}/${v.slug}`} className="vcard">
              <Photo src={venueHero(v.slug)} variant={v.ph} label={v.scene} className="vcard-img" style={{ height: 220 }}>
                <div className="badges-top">
                  <span className="badge-assured">{v.tag}</span>
                </div>
                <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
                <div className="badges-bot"><I.Camera width={11} height={11} /> 48</div>
              </Photo>
              <div className="vcard-body">
                <div className="vcard-row1">
                  <span className="chip outline">{v.type}</span>
                  {cfg.feature_reviews && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                      <I.Star width={13} height={13} style={{ color: "var(--accent)" }} /> {v.rating}
                    </span>
                  )}
                </div>
                <h3 className="vcard-name">{v.name}</h3>
                <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}</div>
                <div className="vcard-specs">
                  <span><I.Users width={12} height={12} /> {v.capacity.min}–{v.capacity.max}</span>
                  <span>·</span>
                  <span>{v.bookingsMonth} booked this month</span>
                </div>
                <div className="vcard-price">
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Veg plate from</div>
                    <b>₹{v.vegPlate.toLocaleString("en-IN")}</b>
                  </div>
                  <span className="chip">View</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </CarouselWrap>
      </section>}

      {/* WEEKEND GETAWAY */}
      {cfg.section_getaways && <section className="block">
        <div className="getaway-block">
          <div className="getaway-intro">
            <Ornament>WEEKEND ESCAPES</Ornament>
            <h2 className="block-title" style={{ marginTop: 12 }}>
              Within four hours <span className="italic-serif" style={{ color: "var(--brand)" }}>of the orange city.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", marginTop: 16 }}>
              Pench, Tadoba, Khindsi, Chikhaldara — forest villas and lake cottages that turn a Friday evening into a proper reset. Perfect for bachelor trips, family pre-weddings, or just a break.
            </p>
            <Link href="/weekend-getaways" className="btn btn-ghost btn-lg">
              All getaways <I.Arrow width={14} height={14} />
            </Link>
          </div>
          <CarouselWrap count={Math.min(getaways.length, 3)}>
          <div className="gcards">
            {getaways.slice(0, 3).map((g) => (
              <Link key={g.slug} href={`/weekend-getaways/${g.slug}`} className="gcard">
                <Photo src={getawayPhotos[g.slug]?.hero} variant={g.ph} label={g.scene} style={{ height: 180 }} />
                <div className="gcard-body">
                  <h4>{g.name}</h4>
                  <div className="gcard-loc"><I.Pin width={11} height={11} /> {g.hoursFromNagpur}</div>
                  <div className="gcard-specs">
                    <span><I.Bed width={11} height={11} /> {g.beds} bed</span>
                    <span><I.Users width={11} height={11} /> {g.guests} guests</span>
                  </div>
                  <div className="gcard-price">
                    <div>
                      <b>₹{g.weekday.toLocaleString("en-IN")}</b><small>/night · wknight</small>
                    </div>
                    <span className="wknd">wknd ₹{(g.weekend / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </CarouselWrap>
        </div>
      </section>}

      {/* DESTINATION BAND */}
      {cfg.section_destinations && <section className="destband">
        <div className="destband-inner">
          <div className="destband-head">
            <Ornament>BEYOND NAGPUR</Ornament>
            <h2 className="block-title" style={{ color: "#FFF8EA", marginTop: 12 }}>
              Destination weddings, <span className="italic-serif" style={{ color: "#F0D7B0" }}>planned end-to-end.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,248,234,0.75)", marginTop: 14, lineHeight: 1.6 }}>
              Udaipur lakes, Goan beaches, Jaipur courtyards — we handle venue, vendors, travel and stay for your entire party.
            </p>
          </div>
          <div className="destgrid">
            {destinations.slice(0, 4).map((d) => (
              <Link key={d.slug} href={`/destination-weddings/${d.slug}`} className="destcard">
                <Photo src={destinationPhotos[d.slug]} variant={d.ph} label={`${d.city.toLowerCase()} · ${d.tag.toLowerCase()}`} />
                <div className="destcard-lbl">
                  <div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#FFF8EA", letterSpacing: "-0.02em" }}>{d.city}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,248,234,0.8)", marginTop: 3 }}>{d.venues} venues · from {d.from}</div>
                  </div>
                  <div className="destcard-arrow"><I.Arrow width={14} height={14} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {/* HOW IT WORKS */}
      {cfg.section_how_it_works && (
        <section className="block">
          <div className="block-head">
            <div>
              <Ornament>HOW WE WORK</Ornament>
              <h2 className="block-title">
                Four steps, <span className="italic-serif" style={{ color: "var(--brand)" }}>one wedding.</span>
              </h2>
            </div>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-n">01</div>
              <h4>Tell us the date</h4>
              <p>Share your dates, guest count, and budget. We&rsquo;ll pull real availability across 42 Nagpur venues in under an hour.</p>
            </div>
            <div className="step">
              <div className="step-n">02</div>
              <h4>Walk three venues</h4>
              <p>We shortlist three — our pick, your pick, and a curveball. One Saturday, one site-visit, one decision made together.</p>
            </div>
            <div className="step">
              <div className="step-n">03</div>
              <h4>Lock vendors</h4>
              <p>Photographer, décor, makeup, catering, DJ, pandit — we bring the shortlist, you approve, we handle the paperwork.</p>
            </div>
            <div className="step">
              <div className="step-n">04</div>
              <h4>Show up + celebrate</h4>
              <p>Day-of coordinator on-site from 6am. You arrive at the mandap. Everything else is our problem.</p>
            </div>
          </div>
        </section>
      )}

      {/* REAL WEDDINGS */}
      {cfg.section_real_weddings && <section className="block">
        <div className="block-head">
          <div>
            <Ornament>REAL WEDDINGS</Ornament>
            <h2 className="block-title">
              The couples, <span className="italic-serif" style={{ color: "var(--brand)" }}>the stories.</span>
            </h2>
          </div>
          <Link href="/real-weddings" className="block-link">Full archive <I.Arrow width={12} height={12} /></Link>
        </div>
        <div className="realgrid">
          {realWeddings.slice(0, 5).map((w, i) => (
            <Link key={w.slug} href={`/real-weddings/${w.slug}`} className={`realcard r${i}`}>
              <Photo src={realWeddingPhotos[w.slug]} variant={w.ph} label={w.scene} style={{ height: "100%" }} />
              <div className="realcard-caption">
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#FFF8EA", letterSpacing: "-0.01em" }}>{w.couple}</div>
                <div style={{ fontSize: 11, color: "rgba(255,248,234,0.8)", marginTop: 3, letterSpacing: "0.05em" }}>{w.venue} · {w.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>}

      {/* TESTIMONIAL */}
      {cfg.section_testimonial && (
        <section className="testimonial">
          <Ornament>A COUPLE&apos;S NOTE</Ornament>
          <blockquote>
            &ldquo;The hall was exactly as the mockup. Our wedding cost <span className="italic-serif" style={{ color: "var(--brand)" }}>₹11,000 less</span> than the first estimate — I&rsquo;ve never heard of that happening anywhere in India.&rdquo;
          </blockquote>
          <div className="testi-by">
            <div className="testi-avatar ph rose" />
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>Priya & Arjun</div>
              <div style={{ color: "var(--ink-mute)" }}>Centre Point Grand · Dec 2025 · 420 guests</div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <MobileTabbar active="Home" />
    </div>
  );
}
