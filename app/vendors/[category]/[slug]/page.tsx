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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVendorBySlug(slug);
  if (!v) return {};
  return { title: `${v.name} · ${v.category} — Venuees.in`, description: v.tagline };
}

export default async function VendorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("section_vendors");
  const { slug } = await params;
  const [v, cfg] = await Promise.all([
    getVendorBySlug(slug),
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
      .orderBy(vendorImagesTable.order),
    db.select({ contactName: vendorsTable.contactName, contactPhone: vendorsTable.contactPhone, contactEmail: vendorsTable.contactEmail, whatsapp: vendorsTable.whatsapp })
      .from(vendorsTable)
      .where(eq(vendorsTable.slug, slug))
      .limit(1),
  ]);
  const contact = contactRows[0] ?? null;

  return (
    <div className="venue-detail">
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

      <div className="vd-gallery" style={dbImages.length > 0 ? galleryGridStyle(Math.min(dbImages.length, 5)) : {}}>
        {dbImages.length > 0 ? (
          // Show uploaded photos from listing application
          dbImages.slice(0, 5).map((img, i) => (
            <Photo key={i} src={img.url} alt={img.alt || v.name} variant={v.ph} label={i === 0 ? v.locality : ""}>
              {i === 0 && <button className="vd-gallery-all"><I.Camera width={14} height={14} /> {dbImages.length} photos</button>}
            </Photo>
          ))
        ) : (
          // Fall back to static photography library
          <>
            <Photo src={vendorPhotos[v.slug]} variant={v.ph} label={v.scene}>
              <button className="vd-gallery-all"><I.Camera width={14} height={14} /> Portfolio · 240 photos</button>
            </Photo>
            <Photo src={venuePhotos["the-centre-point-grand"]?.gallery[1]} variant="v2" label="haldi · sunlight" />
            <Photo src={venuePhotos["mahalaxmi-lawns"]?.gallery[2]} variant="dusk" label="sangeet · stage" />
            <Photo src={vendorPhotos["rhea-bridal-makeup"]} variant="rose" label="bridal portrait" />
            <Photo src={venuePhotos["signature-resorts-nagpur"]?.gallery[3]} variant="garden" label="mandap · detail" />
          </>
        )}
      </div>

      <header className="vd-header">
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
        <aside className="vd-sidebar" id="enquire">
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
      />

      <RecordView slug={v.slug} name={v.name} locality={`${v.locality}, ${v.city}`} vegPlate={v.priceFrom} ph={v.ph} heroImage={vendorPhotos[v.slug]} type="vendor" categorySlug={v.categorySlug} />
      <Footer />
      <MobileTabbar />
    </div>
  );
}
