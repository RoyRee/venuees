export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { VenueGallery } from "@/components/venue-gallery";
import { venueGallery, venuePhotos, signatureResortsVideos } from "@/lib/images";
import { db, venueImagesTable, venuesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getVenueBySlug } from "@/lib/db/queries";
import { Photo } from "@/components/photo";
import { EnquiryForm } from "@/components/enquiry-form";
import { VenueTabs } from "@/components/venue-tabs";
import { VenueCalendar } from "@/components/venue-calendar";
import { requireSection } from "@/lib/section-guard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVenueBySlug(slug);
  if (!v) return {};
  return {
    title: `${v.name} · ${v.locality} — Venuees.in`,
    description: v.description,
    openGraph: {
      title: `${v.name} — Wedding venue in ${v.locality}`,
      description: v.description,
      type: "website",
      url: `https://venuees.in/venues/${v.citySlug}/${v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-")}/${v.slug}`,
    },
  };
}

function VenueJsonLd({ v, locality }: { v: { name: string; address: string; locality: string; citySlug: string; slug: string; rating: number; reviews: number; description: string; vegPlate: number }; locality: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": v.name,
    "description": v.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": v.address,
      "addressLocality": "Nagpur",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN",
    },
    "url": `https://venuees.in/venues/${v.citySlug}/${locality}/${v.slug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": v.rating.toFixed(1),
      "reviewCount": v.reviews,
      "bestRating": "5",
      "worstRating": "1",
    },
    "priceRange": `₹${v.vegPlate.toLocaleString("en-IN")} per plate`,
    "currenciesAccepted": "INR",
    "telephone": "+917125550180",
    "sameAs": ["https://venuees.in"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const AMENITY_ICON: Record<string, keyof typeof I> = {
  parking: "Car", ac: "AC", wifi: "Wifi", bar: "Utensils",
  dj: "Music", catering: "Utensils", rooms: "Bed", bridal: "Heart",
  pool: "Pool", valet: "Car", generator: "Flame", lift: "Plus",
};

function amenIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes("parking") || t.includes("valet") || t.includes("cars")) return AMENITY_ICON.parking;
  if (t.includes("ac")) return AMENITY_ICON.ac;
  if (t.includes("wi-fi") || t.includes("wifi")) return AMENITY_ICON.wifi;
  if (t.includes("bar")) return AMENITY_ICON.bar;
  if (t.includes("dj") || t.includes("music")) return AMENITY_ICON.dj;
  if (t.includes("kitchen") || t.includes("catering") || t.includes("cuisine")) return AMENITY_ICON.catering;
  if (t.includes("room")) return AMENITY_ICON.rooms;
  if (t.includes("bridal") || t.includes("suite") || t.includes("groom")) return AMENITY_ICON.bridal;
  if (t.includes("pool")) return AMENITY_ICON.pool;
  if (t.includes("generator")) return AMENITY_ICON.generator;
  if (t.includes("lift") || t.includes("accessible")) return AMENITY_ICON.lift;
  return "Check";
}


export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("section_venues");
  const { slug } = await params;

  // All four DB operations run in parallel:
  // getVenueBySlug is cached so generateMetadata's call is also deduplicated.
  // Image + contact queries both filter by slug so they don't need the venue ID first.
  const [v, dbImages, contactRows] = await Promise.all([
    getVenueBySlug(slug),
    db.select({ url: venueImagesTable.url, alt: venueImagesTable.alt, order: venueImagesTable.order })
      .from(venueImagesTable)
      .innerJoin(venuesTable, eq(venueImagesTable.venueId, venuesTable.id))
      .where(eq(venuesTable.slug, slug))
      .orderBy(venueImagesTable.order),
    db.select({ contactName: venuesTable.contactName, contactPhone: venuesTable.contactPhone, contactEmail: venuesTable.contactEmail, whatsapp: venuesTable.whatsapp })
      .from(venuesTable)
      .where(eq(venuesTable.slug, slug))
      .limit(1),
  ]);
  if (!v) return notFound();
  const contact = contactRows[0] ?? null;

  const meta = v.meta ?? {};
  const halls = v.halls.length > 0 ? v.halls : (meta.halls ?? []);
  const packages = meta.packages ?? [];
  const reviewItems = meta.reviewItems ?? [];
  const locationInfo = meta.locationInfo ?? {};
  const blockedDates = meta.blockedDates ?? [];

  // If DB images exist, use them; otherwise fall back to static photography library
  const gallery = venueGallery(v.slug);
  const hallPhotos = venuePhotos[v.slug]?.halls ?? [];
  const galleryImages = dbImages.length > 0
    ? dbImages.map((img, i) => ({
        src: img.url,
        alt: img.alt || `${v.name} photo ${i + 1}`,
        label: i === 0 ? v.locality : "",
      }))
    : [
        { src: gallery[0], alt: `${v.name} — ${v.scene}`, label: v.scene },
        { src: gallery[1], alt: `${v.name} ballroom`, label: "ballroom · evening", variant: v.halls[1]?.ph || "v2" },
        { src: gallery[2], alt: `${v.name} baraat entry`, label: "baraat entry", variant: v.halls[2]?.ph || "dusk" },
        { src: gallery[3], alt: `${v.name} mandap detail`, label: "mandap · detail", variant: v.halls[0]?.ph || "garden" },
        { src: gallery[4], alt: `${v.name} bridal suite`, label: "bridal suite · vanity", variant: "rose" },
        ...gallery.slice(5).map((src, i) => ({ src, alt: `${v.name} photo ${i + 6}`, label: "" })),
      ];

  const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="venue-detail">
      <VenueJsonLd v={v} locality={localitySlug} />
      <MobileNav />
      <TopNav />

      <nav className="vd-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/venues">Nagpur venues</Link>
        <span className="sep">/</span>
        <span>{v.locality.split(",")[0]}</span>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{v.name}</span>
      </nav>

      <VenueGallery
        heroVariant={v.ph}
        venueName={v.name}
        images={galleryImages}
      />

      <header className="vd-header">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className="chip" style={{ background: "var(--brand)", color: "#fff" }}>{v.tag}</span>
            {v.isSignature && <span className="chip" style={{ background: "var(--accent)", color: "#fff" }}>Our flagship</span>}
            <span className="chip outline">{v.type}</span>
          </div>
          <h1>{v.name}</h1>
          <div className="vd-meta">
            <span><I.Pin width={13} height={13} /> {v.address}</span>
            <span><Stars value={v.rating} size={13} /> {v.rating} · {v.reviews} reviews</span>
            <span><I.Flame width={13} height={13} /> {v.bookingsMonth} booked this month</span>
          </div>
          <div className="vd-badges">
            {v.amenities.length > 0
              ? v.amenities.slice(0, 6).map((a) => <span key={a} className="chip">{a}</span>)
              : <>
                  {v.rooms && <span className="chip">{v.rooms} rooms on-site</span>}
                  {v.parking > 0 && <span className="chip">{v.parking} car parking</span>}
                </>
            }
          </div>
        </div>
        <aside className="vd-sidebar">
          <div className="vd-price-row">
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Veg plate</div>
              <div className="plate">₹{v.vegPlate.toLocaleString("en-IN")}</div>
              <small>Non-veg ₹{v.nvPlate.toLocaleString("en-IN")} · Hall rent ₹{(v.hallRent / 1000).toFixed(0)}k</small>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Min spend</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>
                ₹{(v.minGuarantee / 100000).toFixed(1)}L
              </div>
            </div>
          </div>
          <div className="calendar-mini">
            Tap a date in Availability to check muhurtas
          </div>
          <EnquiryForm
            kind="venue_enquiry"
            venueSlug={v.slug}
            venueName={v.name}
            contactPhone={contact?.contactPhone ?? undefined}
            whatsapp={contact?.whatsapp ?? undefined}
            variant="sidebar"
          />
        </aside>
      </header>

      <VenueTabs sections={[
        { id: "overview",     label: "Overview" },
        ...(halls.length > 0        ? [{ id: "halls",        label: "Halls & capacity" }] : []),
        ...(packages.length > 0     ? [{ id: "packages",     label: "Packages" }]         : []),
        ...(v.amenities.length > 0  ? [{ id: "amenities",    label: "Amenities" }]        : []),
        { id: "availability", label: "Availability" },
        { id: "reviews",      label: `Reviews (${reviewItems.length > 0 ? reviewItems.length : v.reviews})` },
        { id: "location",     label: "Location" },
      ]} />

      <div className="vd-body">
        <main>
          {/* Overview */}
          <section id="overview" className="vd-section">
            <Ornament>OVERVIEW</Ornament>
            <h2>About {v.name}</h2>
            <p>{v.description}</p>
            <div className="vd-quickspecs">
              <div>
                <div className="lbl">Guest capacity</div>
                <div className="val">{v.capacity.min}–{v.capacity.max}<small>pax</small></div>
              </div>
              <div>
                <div className="lbl">Event halls</div>
                <div className="val">{halls.length || "—"}<small>indoor + open</small></div>
              </div>
              <div>
                <div className="lbl">Parking</div>
                <div className="val">{v.parking || "—"}<small>cars</small></div>
              </div>
              <div>
                <div className="lbl">Rooms</div>
                <div className="val">{v.rooms || "—"}<small>{v.rooms ? "on-site" : "off-site"}</small></div>
              </div>
              <div>
                <div className="lbl">Veg plate</div>
                <div className="val">₹{v.vegPlate.toLocaleString("en-IN")}<small>/plate</small></div>
              </div>
            </div>
          </section>

          {/* Halls */}
          {halls.length > 0 && (
            <section id="halls" className="vd-section">
              <Ornament>HALLS & CAPACITY</Ornament>
              <h2>{halls.length} venue{halls.length !== 1 ? "s" : ""} inside one address</h2>
              <p style={{ marginBottom: 24 }}>
                Mix and match for multi-day weddings — haldi in the courtyard, sangeet by the pool, pheras in the ballroom, reception on the lawn.
              </p>
              <div className="halls">
                {halls.map((h, i) => (
                  <div key={i} className="hallcard">
                    <Photo src={hallPhotos[i]} alt={`${v.name} — ${h.name}`} variant={(h as { ph?: string }).ph ?? "v2"} label={h.name.toLowerCase()} />
                    <div className="body">
                      <h4>{h.name}</h4>
                      <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 10 }}>
                        {h.type} · {h.area}
                      </div>
                      <div className="specs">
                        <div><b>{h.theatre}</b>Theatre</div>
                        <div><b>{h.floating}</b>Floating</div>
                        <div><b>{h.dining}</b>Dining</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Packages */}
          {packages.length > 0 ? (
            <section id="packages" className="vd-section">
              <Ornament>PACKAGES</Ornament>
              <h2>Pricing packages</h2>
              <p style={{ marginBottom: 28 }}>All-inclusive pricing per plate. Upgrade any layer separately.</p>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${packages.length}, 1fr)`, gap: 16 }}>
                {packages.map((pkg, i) => (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", background: i === Math.floor(packages.length / 2) ? "var(--brand)" : "var(--surface)", color: i === Math.floor(packages.length / 2) ? "#fff" : "var(--ink)" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>
                      <div style={{ fontSize: 22, fontFamily: "var(--font-serif)", fontWeight: 700 }}>
                        ₹{pkg.pricePerPlate.toLocaleString("en-IN")}
                        <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, opacity: 0.8 }}>/plate</span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      {pkg.features.map((feat, fi) => (
                        <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--ink-soft)" }}>
                          <I.Check width={14} height={14} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            // Fallback static packages when none defined
            <section id="packages" className="vd-section">
              <Ornament>PACKAGES</Ornament>
              <h2>Three ways to wed here</h2>
              <p style={{ marginBottom: 28 }}>All-inclusive pricing per plate — covers venue, catering, basic décor, and day-of coordination.</p>
              <div className="pkgs">
                <div className="h rowlbl">Starts at</div>
                <div className="h">
                  <div className="pname">Essential</div>
                  <div className="pprice">₹{v.vegPlate.toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 4 }}>/plate</small></div>
                </div>
                <div className="h feat">
                  <div className="pname" style={{ color: "#fff" }}>Signature</div>
                  <div className="pprice" style={{ color: "#fff" }}>₹{(v.vegPlate + 400).toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>/plate</small></div>
                </div>
                <div className="h">
                  <div className="pname">Royal</div>
                  <div className="pprice">₹{(v.vegPlate + 850).toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 4 }}>/plate</small></div>
                </div>

                <div className="rowlbl">Venue rental</div>
                <div>1 hall · 6 hours</div>
                <div>2 halls · 10 hours</div>
                <div>Whole property · 24h</div>

                <div className="rowlbl">Menu courses</div>
                <div>12 items · 1 live station</div>
                <div>18 items · 3 live stations</div>
                <div>26 items · 5 stations + dessert bar</div>

                <div className="rowlbl">Décor</div>
                <div>Classic marigold + lights</div>
                <div>Themed mandap · floral ceiling</div>
                <div>Full installation by Studio Rang</div>

                <div className="rowlbl">Photography</div>
                <div><I.X width={14} height={14} style={{ color: "var(--ink-mute)" }} /> Add-on</div>
                <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 1-photographer · half-day</div>
                <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 2-photographer · 2-day + film</div>

                <div className="rowlbl">Rooms</div>
                <div>—</div>
                <div>5 rooms · night of</div>
                <div>20 rooms · 2 nights</div>

                <div className="rowlbl" style={{ borderBottom: "none" }}>Day-of manager</div>
                <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
                <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
                <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Dedicated team of 3</div>
              </div>
            </section>
          )}

          {/* Amenities */}
          {v.amenities.length > 0 && (
            <section id="amenities" className="vd-section">
              <Ornament>AMENITIES</Ornament>
              <h2>What&rsquo;s included</h2>
              <div className="amen-grid">
                {v.amenities.map((a, i) => {
                  const IconComp = I[amenIcon(a)];
                  return (
                    <div key={i} className="amen-cell">
                      <IconComp width={22} height={22} />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Availability */}
          <section id="availability" className="vd-section">
            <Ornament>AVAILABILITY</Ornament>
            <h2>Check dates & muhurats</h2>
            <p style={{ marginBottom: 20 }}>
              Tap any available date to pre-fill your enquiry. <strong style={{ color: "#92400e" }}>✦ Golden dates</strong> are auspicious muhurat days — they fill up first.
            </p>
            <VenueCalendar blockedDates={blockedDates} />
          </section>

          {/* Reviews */}
          <section id="reviews" className="vd-section">
            <Ornament>REVIEWS</Ornament>
            <h2>What couples say</h2>
            {reviewItems.length > 0 ? (
              <>
                <div className="rev-summary">
                  <div>
                    <div className="rev-big">{v.rating || "5.0"}</div>
                    <Stars value={v.rating || 5} size={18} />
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{reviewItems.length} verified review{reviewItems.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                {reviewItems.map((r, i) => (
                  <div key={i} className="rev-item">
                    <div className="ava ph rose" />
                    <div>
                      <h5>{r.name}</h5>
                      <div className="rev-meta">{r.date} · <Stars value={5} size={11} /></div>
                      <p>{r.text}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Fallback static reviews
              <>
                <div className="rev-summary">
                  <div>
                    <div className="rev-big">{v.rating}</div>
                    <Stars value={v.rating} size={18} />
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{v.reviews} verified reviews</div>
                  </div>
                  <div className="rev-bars">
                    {[
                      { l: "Venue & ambience", v: 98 },
                      { l: "Food", v: 94 },
                      { l: "Staff", v: 96 },
                      { l: "Value for money", v: 88 },
                      { l: "Punctuality", v: 92 },
                    ].map((r) => (
                      <div key={r.l}>
                        <span>{r.l}</span>
                        <div className="rev-bar-fill"><div style={{ width: `${r.v}%` }} /></div>
                        <span style={{ textAlign: "right" }}>{(r.v / 20).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {[
                  { n: "Aarti M.", d: "Dec 2025 · 420 guests", t: "Our estimate was ₹18L and we closed at ₹17.89L. The Darbar ballroom looked exactly like the mock-up. Day-of manager Sneha was everywhere before I asked." },
                  { n: "Rohit K.", d: "Nov 2025 · 280 guests", t: "We had two grandmothers with wheelchairs — the ramps, the lift, and the reserved seating made the entire day easy. Food was regional Vidarbha done really well." },
                  { n: "Neha & Sahil", d: "Feb 2025 · 500 guests", t: "Hall, catering, décor, DJ, pandit — all under one roof. Zero coordination from us after the final walk-through." },
                ].map((r) => (
                  <div key={r.n} className="rev-item">
                    <div className="ava ph rose" />
                    <div>
                      <h5>{r.n}</h5>
                      <div className="rev-meta">{r.d} · <Stars value={5} size={11} /></div>
                      <p>{r.t}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>

          {/* Instagram feed — Signature Resorts only */}
          {v.isSignature && (
            <section className="vd-section">
              <Ornament>LIVE FROM THE VENUE</Ornament>
              <h2>This week on <span className="italic-serif" style={{ color: "var(--brand)" }}>@signature_resorts</span></h2>
              <p style={{ marginBottom: 20 }}>
                Real weddings, kitchen stories and fresh tablescape reels — straight from our Instagram.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {gallery.slice(0, 3).map((src, i) => (
                  <a key={i} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Photo src={src} alt={`Signature Resorts · photo ${i + 1}`} variant="garden" style={{ height: 260, cursor: "pointer" }} />
                  </a>
                ))}
                {signatureResortsVideos.map((src, i) => (
                  <a key={`v${i}`} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", borderRadius: "var(--radius-md)", overflow: "hidden", height: 260 }}>
                    <video
                      src={src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </a>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <a href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  Follow @signature_resorts on Instagram <I.Arrow width={14} height={14} />
                </a>
              </div>
            </section>
          )}

          {/* Location */}
          <section id="location" className="vd-section">
            <Ornament>LOCATION</Ornament>
            <h2>Getting here</h2>
            <div className="ph ocean" style={{ height: 300, borderRadius: "var(--radius-md)", marginTop: 16 }}>
              <span className="ph-label">map · {v.locality.toLowerCase()}</span>
            </div>
            {(locationInfo.airport || locationInfo.railway || locationInfo.hotelCluster) ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
                {locationInfo.airport && (
                  <div><b style={{ display: "block", color: "var(--ink)" }}>Airport</b>{locationInfo.airport}</div>
                )}
                {locationInfo.railway && (
                  <div><b style={{ display: "block", color: "var(--ink)" }}>Railway</b>{locationInfo.railway}</div>
                )}
                {locationInfo.hotelCluster && (
                  <div><b style={{ display: "block", color: "var(--ink)" }}>Hotel cluster</b>{locationInfo.hotelCluster}</div>
                )}
              </div>
            ) : (
              // Fallback static location
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
                <div><b style={{ display: "block", color: "var(--ink)" }}>Airport</b>12 min · Dr. B.R. Ambedkar Intl</div>
                <div><b style={{ display: "block", color: "var(--ink)" }}>Railway</b>18 min · Nagpur Junction</div>
                <div><b style={{ display: "block", color: "var(--ink)" }}>Hotel cluster</b>Ramdaspeth · 8 min</div>
              </div>
            )}
          </section>
        </main>

        <aside>
          <div className="vd-sidebar" style={{ position: "sticky", top: 70 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.1, marginBottom: 12 }}>
              Lock {v.name.split(" ")[0]} for your date
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
              Hold good for 72 hours · ₹25,000 refundable deposit · no credit card on file.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Hold this date <I.Arrow width={14} height={14} />
            </Link>
            <Link href="/contact" className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}>
              <I.Phone width={14} height={14} /> Talk to a planner
            </Link>
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-cta">
        <Link href="#" className="btn btn-ghost"><I.Phone width={14} height={14} /> Call</Link>
        <Link href="/contact" className="btn btn-primary">Request availability</Link>
      </div>

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
