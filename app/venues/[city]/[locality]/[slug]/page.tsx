export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { VenueGallery } from "@/components/venue-gallery";
import { venueGallery, venuePhotos, venueHero, signatureResortsVideos } from "@/lib/images";
import { db, venueImagesTable, venuesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getVenueBySlug } from "@/lib/db/queries";
import { Photo } from "@/components/photo";
import { EnquiryForm } from "@/components/enquiry-form";
import { VenueTabs, type VenueTabsData } from "@/components/venue-tabs";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireSection } from "@/lib/section-guard";
import { getSiteConfig, CONFIG_DEFAULTS } from "@/lib/site-config";
import { VenueJsonLd } from "@/components/schema-org";
import { SaveButton } from "@/components/save-button";
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
    ...(v.reviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": v.rating.toFixed(1),
        "reviewCount": v.reviews,
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
    ...(v.vegPlate > 0 ? { "priceRange": `₹${v.vegPlate.toLocaleString("en-IN")} per plate` } : {}),
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
  const cfg = await getSiteConfig().catch(() => ({ ...CONFIG_DEFAULTS }));

  const supabase = await getServerSupabase();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const userProfile = user
    ? {
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
      }
    : null;

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
        { src: gallery[1], alt: `${v.name} ballroom`, label: "", variant: v.halls[1]?.ph || "v2" },
        { src: gallery[2], alt: `${v.name} baraat entry`, label: "", variant: v.halls[2]?.ph || "dusk" },
        { src: gallery[3], alt: `${v.name} mandap detail`, label: "", variant: v.halls[0]?.ph || "garden" },
        { src: gallery[4], alt: `${v.name} bridal suite`, label: "", variant: "rose" },
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
        <Link href={`/venues?locality=${encodeURIComponent(v.locality.split(",")[0].trim())}`}>{v.locality.split(",")[0]}</Link>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <h1>{v.name}</h1>
            <SaveButton type="venue" slug={v.slug} size={22} className="btn-save-detail" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }} />
          </div>
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
      </header>

      <VenueTabs
        userProfile={userProfile}
        data={{
          venue: {
            id: venueDbId,
            slug: v.slug,
            name: v.name,
            description: v.description,
            capacity: v.capacity,
            parking: v.parking,
            rooms: v.rooms,
            vegPlate: v.vegPlate,
            amenities: v.amenities,
            isSignature: v.isSignature,
            locality: v.locality,
            rating: v.rating,
          },
          halls,
          hallPhotos,
          packages,
          blockedDates,
          reviewItems,
          locationInfo,
          googleMapsUrl: googleMapsUrl ?? null,
          googleRating: googleRating ?? null,
          googleReviewCount: googleReviewCount ?? null,
          hasReviews,
          hasLocation: !!(googleMapsUrl || hasReviews || locationInfo.airport || locationInfo.railway || locationInfo.hotelCluster),
          gallery,
          signatureVideos: signatureResortsVideos,
        } satisfies VenueTabsData}
      >
        {/* Sidebar — passed as children, rendered in aside inside vd-body grid */}
        <div className="vd-sidebar" id="enquire" style={{ position: "sticky", top: 70 }}>
          <div className="vd-price-row">
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Veg plate</div>
              {v.vegPlate > 0 ? (
                <>
                  <div className="plate">₹{v.vegPlate.toLocaleString("en-IN")}</div>
                  <small>Non-veg ₹{v.nvPlate.toLocaleString("en-IN")} · Hall rent ₹{(v.hallRent / 1000).toFixed(0)}k</small>
                </>
              ) : (
                <div className="plate" style={{ fontSize: 22 }}>Price on request</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Min spend</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>
                {v.minGuarantee > 0 ? `₹${(v.minGuarantee / 100000).toFixed(1)}L` : "—"}
              </div>
            </div>
          </div>
          <div className="calendar-mini">
            Tap a date in Availability to check muhurtas
          </div>
          {cfg.feature_enquiries !== false ? (
            <>
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
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>
              Enquiries are temporarily paused. <Link href="/contact" style={{ color: "var(--brand)" }}>Contact us directly →</Link>
            </p>
          )}
        </div>
      </VenueTabs>

      <div className="mobile-sticky-cta">
        <a href={`tel:${(contact?.contactPhone ?? "+919922151527").replace(/\s/g, "")}`} className="btn btn-ghost">
          <I.Phone width={14} height={14} /> Call
        </a>
        <a href="#enquire" className="btn btn-primary">Request availability</a>
      </div>
      <RecordView slug={v.slug} name={v.name} locality={v.locality} vegPlate={v.vegPlate} ph={v.ph} heroImage={galleryImages[0]?.src} type="venue" />
      <StickyLeadBar slug={v.slug} name={v.name} />

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
