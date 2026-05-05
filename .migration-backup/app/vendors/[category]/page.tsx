import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { vendors, getVendorsByCategory } from "@/lib/data";
import { Photo } from "@/components/photo";
import { vendorPhotos } from "@/lib/images";

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

export default async function VendorCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return notFound();
  const list = getVendorsByCategory(category);
  // Extend list with more vendor cards for visual density
  const display = [...list, ...list].slice(0, 8);

  return (
    <div>
      <MobileNav />
      <TopNav />

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span> <Link href="/vendors">Vendors</Link> <span className="sep">/</span> <span>{meta.name}</span>
          </nav>
          <h1>{meta.name} <span className="italic-serif" style={{ color: "var(--brand)" }}>in Nagpur.</span></h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 640, lineHeight: 1.6 }}>{meta.blurb}</p>
        </div>
      </div>

      <div className="vl-body">
        <aside className="vl-filters">
          <div className="f-group">
            <h6>Price</h6>
            <div className="f-range">
              <input type="range" min={10000} max={500000} defaultValue={150000} />
              <div className="bounds"><span>₹10k</span><span>₹5L+</span></div>
            </div>
          </div>
          <div className="f-group">
            <h6>Experience</h6>
            <label><input type="checkbox" /> 2+ years</label>
            <label><input type="checkbox" /> 5+ years</label>
            <label><input type="checkbox" /> 10+ years</label>
          </div>
          <div className="f-group">
            <h6>Locality</h6>
            <label><input type="checkbox" /> Dharampeth</label>
            <label><input type="checkbox" /> Civil Lines</label>
            <label><input type="checkbox" /> Sitabuldi</label>
            <label><input type="checkbox" /> Ramdaspeth</label>
            <label><input type="checkbox" /> Laxmi Nagar</label>
          </div>
          <div className="f-group" style={{ borderBottom: "none" }}>
            <h6>Availability</h6>
            <label><input type="checkbox" /> Next 30 days</label>
            <label><input type="checkbox" /> Open for destination weddings</label>
          </div>
        </aside>

        <main>
          <div className="vl-results-head">
            <div className="vl-count"><b>{list.length > 0 ? list.length : 8}</b> {meta.name.toLowerCase()} · Nagpur</div>
            <div className="vl-sort">
              Sort by
              <select defaultValue="rec">
                <option value="rec">Recommended</option>
                <option value="price-asc">Price · low to high</option>
                <option value="rating">Rating</option>
                <option value="bookings">Most booked</option>
              </select>
            </div>
          </div>

          <div className="vl-grid">
            {display.map((v, i) => (
              <Link key={`${v.slug}-${i}`} href={`/vendors/${v.categorySlug}/${v.slug}`} className="vcard">
                <Photo src={vendorPhotos[v.slug]} variant={v.ph} label={v.scene} className="vcard-img" style={{ height: 240 }}>
                  <div className="badges-top">
                    <span className="badge-assured">{v.yearsExp} yr pro</span>
                  </div>
                  <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
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
        </main>
      </div>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
