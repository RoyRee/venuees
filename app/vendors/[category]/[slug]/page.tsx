export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars } from "@/components/icons";
import { db, vendorImagesTable, vendorsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getVendorBySlug } from "@/lib/db/queries";
import { Photo } from "@/components/photo";
import { vendorPhotos, venuePhotos } from "@/lib/images";
import { EnquiryForm } from "@/components/enquiry-form";
import { requireSection } from "@/lib/section-guard";
import { getSiteConfig, CONFIG_DEFAULTS } from "@/lib/site-config";
import { RecordView } from "@/components/record-view";
import { VendorTabs } from "@/components/vendor-tabs";
import { DynamicGallery } from "@/components/dynamic-gallery";
import { StickyLeadBar } from "@/components/sticky-lead-bar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVendorBySlug(slug);
  if (!v) return {};
  return { title: `${v.name} · ${v.category} — Venuees.in`, description: v.tagline };
}

function VendorJsonLd({ v }: { v: { name: string; description?: string | null; locality: string; city: string; slug: string; categorySlug: string; rating: number; reviews: number; priceFrom: number } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": v.name,
    "description": v.description || v.name,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": v.locality,
      "addressRegion": v.city,
      "addressCountry": "IN",
    },
    "url": `https://venuees.in/vendors/${v.categorySlug}/${v.slug}`,
    ...(v.reviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": v.rating.toFixed(1),
        "reviewCount": v.reviews,
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
    "priceRange": `₹${v.priceFrom.toLocaleString("en-IN")}+`,
    "currenciesAccepted": "INR",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function VendorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("section_vendors");
  const { slug } = await params;
  const [v, cfg] = await Promise.all([
    getVendorBySlug(slug).catch(() => null),
    getSiteConfig().catch(() => ({ ...CONFIG_DEFAULTS })),
  ]);
  if (!v) return notFound();

  // Gallery grid style adapts to actual photo count so there's never blank cells.
  function galleryGridStyle(count: number) {
    if (count <= 0) return {};
    if (count === 1) return { gridTemplateColumns: "1fr", gridTemplateRows: "480px" };
    if (count === 2) return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "480px" };
    if (count === 3) return { gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "400px" };
    if (count === 4) return { gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "240px 240px" };
    return {};
  }

  // Fetch uploaded photos + contact info in parallel
  const [dbImages, contactRows] = await Promise.all([
    db.select({ url: vendorImagesTable.url, alt: vendorImagesTable.alt, order: vendorImagesTable.order })
      .from(vendorImagesTable)
      .innerJoin(vendorsTable, eq(vendorImagesTable.vendorId, vendorsTable.id))
      .where(eq(vendorsTable.slug, slug))
      .orderBy(vendorImagesTable.order)
      .catch(() => [] as { url: string; alt: string; order: number }[]),
    db.select({ contactName: vendorsTable.contactName, contactPhone: vendorsTable.contactPhone, contactEmail: vendorsTable.contactEmail, whatsapp: vendorsTable.whatsapp })
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, slug))
      .limit(1)
      .catch(() => [] as { contactName: string | null; contactPhone: string | null; contactEmail: string | null; whatsapp: string | null }[]),
  ]);
  const contact = contactRows[0] ?? null;

  return (
    <div className="venue-detail">
      <VendorJsonLd v={v} />
      <MobileNav />
      <TopNav />

      <nav className="vd-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/vendors">Vendors</Link>
        <span className="sep">/</span>
        <Link href={`/vendors/${v.categorySlug}`}>{v.category}</Link>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{v.name}</span>
      </nav>

      {dbImages.length > 0 ? (
        <DynamicGallery 
          images={dbImages.map(img => ({ src: img.url, alt: img.alt || v.name, label: v.locality, variant: v.ph }))} 
          gridStyle={galleryGridStyle(Math.min(dbImages.length, 5))}
          totalPhotos={dbImages.length}
        />
      ) : (
        <DynamicGallery 
          images={[
            { src: vendorPhotos[v.slug], alt: v.name, label: v.scene, variant: v.ph },
            { src: venuePhotos["the-centre-point-grand"]?.gallery[1], alt: "haldi", label: "haldi · sunlight", variant: "v2" },
            { src: venuePhotos["mahalaxmi-lawns"]?.gallery[2], alt: "sangeet", label: "sangeet · stage", variant: "dusk" },
            { src: vendorPhotos["rhea-bridal-makeup"], alt: "bridal", label: "bridal portrait", variant: "rose" },
            { src: venuePhotos["signature-resorts-nagpur"]?.gallery[3], alt: "mandap", label: "mandap · detail", variant: "garden" },
          ]}
          gridStyle={galleryGridStyle(5)}
          totalPhotos={240}
        />
      )}

      <header className="vd-header" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span className="chip" style={{ background: "var(--brand)", color: "#fff" }}>{v.category}</span>
            <span className="chip outline">{v.yearsExp} years experience</span>
            <span className="chip outline">{v.completed} weddings completed</span>
          </div>
          <h1>{v.name}</h1>
          <div className="vd-meta">
            <span><I.Pin width={13} height={13} /> {v.locality}, {v.city}</span>
            <span><Stars value={v.rating} size={13} /> {v.rating} · {v.reviews} reviews</span>
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontStyle: "italic", color: "var(--brand)", marginTop: 20, maxWidth: 560 }}>
            &ldquo;{v.tagline}&rdquo;
          </p>
        </div>
      </header>

      <VendorTabs
        vendor={{
          name: v.name,
          category: v.category,
          yearsExp: v.yearsExp,
          completed: v.completed,
          rating: v.rating,
          reviews: v.reviews,
          priceFrom: v.priceFrom,
          locality: v.locality,
          city: v.city,
          description: v.description,
          ph: v.ph,
        }}
        images={dbImages}
      >
        <aside className="vd-sidebar" id="enquire" style={{ position: "sticky", top: 70 }}>
          <div className="vd-price-row">
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Package starts at</div>
              <div className="plate">₹{v.priceFrom.toLocaleString("en-IN")}</div>
              <small>Final price varies by event days + team size</small>
            </div>
          </div>
          {cfg.feature_enquiries !== false ? (
            <EnquiryForm
              kind="vendor_enquiry"
              vendorSlug={v.slug}
              venueName={v.name}
              contactPhone={contact?.contactPhone ?? undefined}
              whatsapp={contact?.whatsapp ?? undefined}
              variant="sidebar"
            />
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>
              Enquiries are temporarily paused. <Link href="/contact" style={{ color: "var(--brand)" }}>Contact us directly →</Link>
            </p>
          )}
        </aside>
      </VendorTabs>

      <div className="mobile-sticky-cta">
        <a href={`tel:${(contact?.contactPhone ?? "+919922151527").replace(/\s/g, "")}`} className="btn btn-ghost">
          <I.Phone width={14} height={14} /> Call
        </a>
        <a href="#enquire" className="btn btn-primary">Request pricing</a>
      </div>
      <RecordView slug={v.slug} name={v.name} locality={`${v.locality}, ${v.city}`} vegPlate={v.priceFrom} ph={v.ph} heroImage={vendorPhotos[v.slug]} type="vendor" categorySlug={v.categorySlug} />
      <StickyLeadBar slug={v.slug} name={v.name} type="vendor" />
      <Footer />
      <MobileTabbar />
    </div>
  );
}
