export const dynamic = "force-dynamic";
import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { Photo } from "@/components/photo";
import { vendorPhotos } from "@/lib/images";
import { getVendors } from "@/lib/db/queries";
import { requireSection } from "@/lib/section-guard";
import { CATEGORY_SLUG_ALIASES } from "@/lib/vendor-categories";

export const metadata = {
  title: "Wedding vendors in Nagpur — Venuees.in",
  description: "Photographers, decorators, makeup artists, caterers, mehendi, DJs and pandits — vetted wedding vendors in Nagpur.",
};

const CURATED_CATEGORIES = [
  { slug: "photographers", name: "Photographers" },
  { slug: "decorators", name: "Decorators & florists" },
  { slug: "makeup", name: "Makeup artists" },
  { slug: "caterers", name: "Caterers" },
  { slug: "mehendi", name: "Mehendi artists" },
  { slug: "music", name: "Music & DJs" },
  { slug: "pandits", name: "Pandits" },
  { slug: "event-management", name: "Event planners" },
  { slug: "invitations", name: "Invitations & stationery" },
];

export default async function VendorsHubPage() {
  await requireSection("section_vendors");
  const vendors = await getVendors();

  // Real per-category counts, folding legacy slug variants into the canonical
  // category. Curated categories always show; anything else found in the DB is
  // appended so no approved vendor is ever invisible.
  const canonical = (slug: string) =>
    Object.entries(CATEGORY_SLUG_ALIASES).find(([, aliases]) => aliases.includes(slug))?.[0] ?? slug;
  const countBySlug = new Map<string, number>();
  for (const v of vendors) {
    const slug = canonical(v.categorySlug);
    countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
  }
  const extraCategories = [...countBySlug.keys()]
    .filter((slug) => !CURATED_CATEGORIES.some((c) => c.slug === slug))
    .map((slug) => ({
      slug,
      name: vendors.find((v) => canonical(v.categorySlug) === slug)?.category
        ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    }));
  const CATEGORIES = [...CURATED_CATEGORIES, ...extraCategories]
    .map((c) => ({ ...c, count: countBySlug.get(c.slug) ?? 0 }))
    .filter((c) => c.count > 0 || CURATED_CATEGORIES.slice(0, 7).some((cc) => cc.slug === c.slug));
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>NAGPUR VENDORS</Ornament>
        <h1>
          The people who <span className="italic-serif" style={{ color: "var(--brand)" }}>make the day.</span>
        </h1>
        <p>
          {vendors.length} vetted wedding vendor{vendors.length !== 1 ? "s" : ""} across Nagpur. Every one has shot, styled, or served at weddings we&rsquo;ve managed. Transparent pricing, portfolio links, and verified reviews.
        </p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="vgrid">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/vendors/${c.slug}`} className="gcard">
              <Photo
                src={vendorPhotos[vendors.find(v => v.categorySlug === c.slug)?.slug ?? ""]}
                variant={c.slug === "decorators" ? "garden" : c.slug === "photographers" ? "v3" : c.slug === "makeup" ? "rose" : c.slug === "caterers" ? "saffron" : c.slug === "music" ? "plum" : c.slug === "mehendi" ? "v5" : "v2"}
                label={c.name.toLowerCase()}
                style={{ height: 160 }}
              />
              <div className="gcard-body">
                <h4 style={{ fontSize: 20 }}>{c.name}</h4>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{c.count > 0 ? `${c.count} vendor${c.count !== 1 ? "s" : ""}` : "Coming soon"}</span>
                  <I.Arrow width={14} height={14} style={{ color: "var(--brand)" }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div>
            <Ornament>TOP-RATED THIS SEASON</Ornament>
            <h2 className="block-title">Most-booked <span className="italic-serif" style={{ color: "var(--brand)" }}>in Nagpur.</span></h2>
          </div>
          <Link href="/vendors/photographers" className="block-link">Browse all <I.Arrow width={12} height={12} /></Link>
        </div>
        <div className="vgrid">
          {vendors.slice(0, 8).map((v) => (
            <Link key={v.slug} href={`/vendors/${v.categorySlug}/${v.slug}`} className="vcard">
              <Photo src={vendorPhotos[v.slug]} variant={v.ph} label={v.scene} className="vcard-img" style={{ height: 220 }}>
                <div className="badges-top"><span className="badge-assured">{v.category}</span></div>
              </Photo>
              <div className="vcard-body">
                <div className="vcard-row1">
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{v.yearsExp} yrs · {v.completed} weddings</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                    <I.Star width={13} height={13} style={{ color: "var(--accent)" }} /> {v.rating}
                  </span>
                </div>
                <h3 className="vcard-name">{v.name}</h3>
                <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}, {v.city}</div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", margin: "4px 0 10px" }}>&ldquo;{v.tagline}&rdquo;</p>
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
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
