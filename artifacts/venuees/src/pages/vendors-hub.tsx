import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Ornament, Stars } from "../components/icons";
import { Photo } from "../components/photo";
import { api } from "../lib/api";
import { vendorPhotos } from "../lib/images";

const CATEGORIES = [
  { slug: "photographers", name: "Photographers", ph: "v3" },
  { slug: "decorators", name: "Decorators & florists", ph: "garden" },
  { slug: "makeup", name: "Makeup artists", ph: "rose" },
  { slug: "caterers", name: "Caterers", ph: "saffron" },
  { slug: "mehendi", name: "Mehendi artists", ph: "v5" },
  { slug: "music", name: "Music & DJs", ph: "plum" },
  { slug: "pandits", name: "Pandits", ph: "v2" },
];

export default function VendorsHubPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.vendors.list(),
  });

  const byCategory = (slug: string) => vendors.filter((v) => v.categorySlug === slug);

  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>NAGPUR VENDORS</Ornament>
        <h1>The people who <span className="italic-serif" style={{ color: "var(--brand)" }}>make the day.</span></h1>
        <p>{vendors.length || 87} vetted wedding vendors across Nagpur. Every one has shot, styled, or served at least 10 weddings we&rsquo;ve managed. Transparent pricing, portfolio links, and verified reviews.</p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="vgrid">
          {CATEGORIES.map((c) => {
            const first = byCategory(c.slug)[0];
            return (
              <Link key={c.slug} href={`/vendors/${c.slug}`} className="gcard">
                <Photo
                  src={first?.images[0]?.url ?? vendorPhotos[first?.slug ?? ""]}
                  variant={c.ph as "v2"}
                  label={c.name.toLowerCase()}
                  style={{ height: 160 }}
                />
                <div className="gcard-body">
                  <h4 style={{ fontSize: 20 }}>{c.name}</h4>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{byCategory(c.slug).length || "—"} vendors</span>
                    <I.Arrow width={14} height={14} style={{ color: "var(--brand)" }} />
                  </div>
                </div>
              </Link>
            );
          })}
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
        {isLoading ? (
          <div className="vgrid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", height: 300, opacity: 0.4 }} />
            ))}
          </div>
        ) : (
          <div className="vgrid">
            {vendors.slice(0, 8).map((v) => (
              <Link key={v.slug} href={`/vendors/${v.categorySlug}/${v.slug}`} className="vcard">
                <Photo
                  src={v.images[0]?.url ?? vendorPhotos[v.slug]}
                  variant={v.ph as "v2"}
                  label={v.tagline}
                  className="vcard-img"
                  style={{ height: 220 }}
                >
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
        )}
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
