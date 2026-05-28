export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars } from "@/components/icons";
import { SaveButton } from "@/components/save-button";
import { getVendors } from "@/lib/db/queries";
import { VendorFilters } from "@/components/vendor-filters";
import { SortSelect } from "@/components/sort-select";
import { Photo } from "@/components/photo";
import { vendorPhotos } from "@/lib/images";
import { getSiteConfig } from "@/lib/site-config";
import { SectionDisabled } from "@/components/section-disabled";

const CATEGORY_META: Record<string, { name: string; blurb: string; ph: string }> = {
  photographers: { name: "Photographers", blurb: "From candid-only storytellers to 3-photographer + film crews. Every portfolio below is from a wedding we personally attended.", ph: "v3" },
  decorators: { name: "Decorators & florists", blurb: "Marigold classicism to pastel florals to full-installation production houses. Price by scale — small mandap to full reception.", ph: "garden" },
  makeup: { name: "Makeup artists", blurb: "Bridal, engagement, mother-of-bride, pre-wedding shoot. Airbrush, HD, and traditional — with honest skin-finish photos.", ph: "rose" },
  caterers: { name: "Caterers", blurb: "Pure veg, Jain, non-veg multi-cuisine — Nagpur&rsquo;s best kitchens. Live stations, chaat counters, dessert bars, late-night snacks.", ph: "saffron" },
  mehendi: { name: "Mehendi artists", blurb: "Arabic, Rajasthani, bridal, kids — solo artists and 4-artist crews that handle full guest lists without smudges.", ph: "v5" },
  music: { name: "Music & DJs", blurb: "Sangeet specialists, shaadi DJs, live instrumentalists and dhol players. Every sound system tested for banquet and lawn acoustics.", ph: "plum" },
  pandits: { name: "Pandits", blurb: "Multi-regional pandits — Maharashtrian, Rajasthani, South Indian, inter-caste ceremonies. Sanskrit shlokas explained in Marathi / Hindi / English.", ph: "v2" },
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return {};
  return { title: `${meta.name} in Nagpur — Venuees.in`, description: meta.blurb };
}

type SP = {
  sort?: string; maxPrice?: string;
  minYears?: string; locality?: string; minRating?: string;
};

export default async function VendorCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SP>;
}) {
  const [{ category }, sp, siteConfig] = await Promise.all([params, searchParams, getSiteConfig()]);
  if (!siteConfig.section_vendors) return <SectionDisabled label="Vendors" />;

  const meta = CATEGORY_META[category];
  if (!meta) return notFound();
  const basePath = `/vendors/${category}`;

  const list = await getVendors({
    categorySlug: category,
    maxPrice:  sp.maxPrice  ? Number(sp.maxPrice)  : undefined,
    minYears:  sp.minYears  ? Number(sp.minYears)  : undefined,
    locality:  sp.locality,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sort:      sp.sort,
  });

  const hasFilters = !!(sp.maxPrice || sp.minYears || sp.locality || sp.minRating);

  return (
    <div>
      <MobileNav />
      <TopNav />

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span>
            <Link href="/vendors">Vendors</Link> <span className="sep">/</span>
            <span>{meta.name}</span>
          </nav>
          <h1>{meta.name} <span className="italic-serif" style={{ color: "var(--brand)" }}>in Nagpur.</span></h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 640, lineHeight: 1.6 }}>{meta.blurb}</p>
        </div>
      </div>

      <div className="vl-body">
        <Suspense fallback={<aside className="vl-filters" style={{ opacity: 0.4 }} />}>
          <VendorFilters basePath={basePath} />
        </Suspense>

        <main>
          <div className="vl-results-head">
            <div className="vl-count">
              <b>{list.length}</b> {meta.name.toLowerCase()} · Nagpur
              {hasFilters && (
                <Link href={basePath} style={{ marginLeft: 10, fontSize: 12, color: "var(--brand)" }}>
                  Clear filters
                </Link>
              )}
            </div>
            <div className="vl-sort">
              Sort by
              <Suspense fallback={<select><option>Recommended</option></select>}>
              <SortSelect
                basePath={basePath}
                options={[
                  { value: "rec",        label: "Recommended" },
                  { value: "price-asc",  label: "Price · low to high" },
                  { value: "price-desc", label: "Price · high to low" },
                  { value: "rating",     label: "Rating" },
                  { value: "bookings",   label: "Most booked" },
                ]}
              />
              </Suspense>
            </div>
          </div>

          {list.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <h3 style={{ marginBottom: 8 }}>No vendors matched</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Try adjusting the filters.</p>
              <Link href={basePath} className="btn btn-primary">Clear filters</Link>
            </div>
          ) : (
            <div className="vl-grid">
              {list.map((v) => (
                <Link key={v.slug} href={`/vendors/${v.categorySlug}/${v.slug}`} className="vcard">
                  <Photo src={vendorPhotos[v.slug]} variant={v.ph} label={v.scene} className="vcard-img" style={{ height: 240 }}>
                    <div className="badges-top">
                      <span className="badge-assured">{v.yearsExp} yr pro</span>
                    </div>
                    <SaveButton type="vendor" slug={v.slug} size={16} />
                  </Photo>
                  <div className="vcard-body">
                    <div className="vcard-row1">
                      <span className="chip outline">{v.locality}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <Stars value={v.rating} size={12} /> {v.rating} <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>({v.reviews})</span>
                      </span>
                    </div>
                    <h3 className="vcard-name">{v.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", margin: "4px 0 10px" }}>&ldquo;{v.tagline}&rdquo;</p>
                    <div className="vcard-specs">
                      <span>{v.completed} weddings</span>
                      <span>·</span>
                      <span>{v.yearsExp} yrs experience</span>
                    </div>
                    <div className="vcard-price">
                      <div>
                        <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Starts at</div>
                        <b>₹{v.priceFrom.toLocaleString("en-IN")}</b>
                      </div>
                      <span className="chip">View work</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
