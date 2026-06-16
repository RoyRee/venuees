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
import { getGooglePlaceInfo } from "@/lib/google-places";
import { SiteVisitButton } from "@/components/site-visit-button";
import { StickyLeadBar } from "@/components/sticky-lead-bar";
import { AvailabilityChecker } from "@/components/availability-checker";
import { RecordView } from "@/components/record-view";
import { PriceAlertWidget } from "@/components/price-alert-widget";

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

  // All DB operations run in parallel; any failure falls back gracefully.
  const [v, dbImages, contactRows] = await Promise.all([
    getVenueBySlug(slug).catch(() => null),
    db.select({ url: venueImagesTable.url, alt: venueImagesTable.alt, order: venueImagesTable.order })
      .from(venueImagesTable)
      .innerJoin(venuesTable, eq(venueImagesTable.venueId, venuesTable.id))
      .where(eq(venuesTable.slug, slug))
      .orderBy(venueImagesTable.order)
      .catch(() => [] as { url: string; alt: string; order: number }[]),
    db.select({ id: venuesTable.id, contactName: venuesTable.contactName, contactPhone: venuesTable.contactPhone, contactEmail: venuesTable.contactEmail, whatsapp: venuesTable.whatsapp })
      .from(venuesTable)
      .where(eq(venuesTable.slug, slug))
      .limit(1)
      .catch(() => [] as { id: number; contactName: string | null; contactPhone: string | null; contactEmail: string | null; whatsapp: string | null }[]),
  ]);
  if (!v) return notFound();
  const contact = contactRows[0] ?? null;
  const venueDbId = contact?.id ?? 0;

  const meta = v.meta ?? {};

  // Google Reviews — use live Places API data if Place ID + API key configured,
  // otherwise fall back to manually entered rating/count in meta.
  const googleLive = meta.googlePlaceId ? await getGooglePlaceInfo(meta.googlePlaceId).catch(() => null) : null;
  const googleMapsUrl     = googleLive?.mapsUrl       ?? meta.googleMapsUrl;
  const googleRating      = googleLive?.rating        ?? meta.googleRating;
  const googleReviewCount = googleLive?.reviewCount   ?? meta.googleReviewCount;
  const halls = v.halls.length > 0 ? v.halls : (meta.halls ?? []);
  const packages = meta.packages ?? [];
  const reviewItems = meta.reviewItems ?? [];
  const locationInfo = meta.locationInfo ?? {};
  const blockedDates = meta.blockedDates ?? [];

  const hasReviews = !!(googleMapsUrl || googleRating || reviewItems.length > 0);
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

      <header className="vd-header" style={{ gridTemplateColumns: "1fr" }}>
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

          {/* Overview lives here (not a separate section below) so the header's
              left column fills the height of the enquiry sidebar. */}
          <div id="overview" style={{ marginTop: 28 }}>
            <Ornament>OVERVIEW</Ornament>
            <h2 style={{ fontSize: "clamp(24px, 2.4vw, 34px)", margin: "14px 0 14px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>About {v.name}</h2>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 640 }}>{v.description}</p>
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
          </div>
        </div>
      </header>

      <VenueTabs sections={[
        { id: "overview", label: "Overview" },
        ...(halls.length > 0        ? [{ id: "halls",        label: "Halls & capacity" }] : []),
        ...(packages.length > 0     ? [{ id: "packages",     label: "Packages" }]         : []),
        ...(v.amenities.length > 0  ? [{ id: "amenities",    label: "Amenities" }]        : []),
        { id: "availability", label: "Availability" },
        ...(hasReviews ? [{ id: "reviews", label: "Reviews & location" }] : [{ id: "location", label: "Location" }]),
      ]} />

      <div className="vd-body">
        <main>
          {/* Overview */}
          <section id="overview" className="vd-section">
            <Ornament>OVERVIEW</Ornament>
            <h2 style={{ fontSize: "clamp(24px, 2.4vw, 34px)", margin: "14px 0 14px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>About {v.name}</h2>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 640 }}>{v.description}</p>
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

          {/* Location + Reviews — merged section */}
          <section id={hasReviews ? "reviews" : "location"} className="vd-section">
            <Ornament>{hasReviews ? "LOCATION & REVIEWS" : "LOCATION"}</Ornament>
            <h2>Getting here</h2>

            {googleMapsUrl ? (
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
                <div className="ph ocean" style={{ height: 260, borderRadius: "var(--radius-md)", marginTop: 16, position: "relative" }}>
                  <span className="ph-label">map · {v.locality.toLowerCase()}</span>
                  <div style={{ position: "absolute", bottom: 14, right: 14, background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#1a73e8", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Open in Google Maps
                  </div>
                </div>
              </a>
            ) : (
              <div className="ph ocean" style={{ height: 260, borderRadius: "var(--radius-md)", marginTop: 16 }}>
                <span className="ph-label">map · {v.locality.toLowerCase()}</span>
              </div>
            )}

            {(locationInfo.airport || locationInfo.railway || locationInfo.hotelCluster) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
                {locationInfo.airport      && <div><b style={{ display: "block", color: "var(--ink)" }}>Airport</b>{locationInfo.airport}</div>}
                {locationInfo.railway      && <div><b style={{ display: "block", color: "var(--ink)" }}>Railway</b>{locationInfo.railway}</div>}
                {locationInfo.hotelCluster && <div><b style={{ display: "block", color: "var(--ink)" }}>Hotel cluster</b>{locationInfo.hotelCluster}</div>}
              </div>
            )}

            {hasReviews && (
              <div style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 16 }}>What couples say</h3>

                {(googleMapsUrl || googleRating) && (
                  <a
                    href={googleMapsUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", marginBottom: reviewItems.length > 0 ? 24 : 0, borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", textDecoration: "none", fontSize: 14, color: "var(--ink)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
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

                {reviewItems.length > 0 && (
                  <>
                    <div className="rev-summary">
                      <div>
                        <div className="rev-big">{googleRating ?? v.rating}</div>
                        <Stars value={Number(googleRating ?? v.rating)} size={18} />
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
                )}
              </div>
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

        </main>

        <aside>
          <div className="vd-sidebar" id="enquire" style={{ position: "sticky", top: 70 }}>
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
            <SiteVisitButton venueSlug={v.slug} venueName={v.name} />
            <AvailabilityChecker venueId={venueDbId} venueName={v.name} venueSlug={v.slug} />
            <PriceAlertWidget venueSlug={v.slug} venueName={v.name} />
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-cta">
        <a href={`tel:${(contact?.contactPhone ?? "+919922151527").replace(/\s/g, "")}`} className="btn btn-ghost">
          <I.Phone width={14} height={14} /> Call
        </a>
        <a href="#enquire" className="btn btn-primary">Request availability</a>
      </div>

      <RecordView slug={v.slug} name={v.name} locality={v.locality} vegPlate={v.vegPlate} ph={v.ph} heroImage={v.heroImage} />
      <StickyLeadBar venueSlug={v.slug} venueName={v.name} />

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
