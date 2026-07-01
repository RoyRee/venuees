import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars, Ornament } from "@/components/icons";
import { Photo } from "@/components/photo";
import { venueHero } from "@/lib/images";
import { getVenues } from "@/lib/db/queries";
import { requireSection } from "@/lib/section-guard";

const CITY_META: Record<string, { name: string; state: string; tagline: string; description: string }> = {
  nagpur: {
    name: "Nagpur",
    state: "Maharashtra",
    tagline: "The orange city · heart of India",
    description: "Nagpur's most-booked wedding venues — hotels, lawns, resorts, and heritage havelis — with transparent pricing and real availability.",
  },
};

const LOCALITIES: Record<string, string[]> = {
  nagpur: ["Wardha Road", "Civil Lines", "Ramdaspeth", "Koradi Road", "MIHAN", "Katol Road"],
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const meta = CITY_META[city];
  if (!meta) return {};
  return {
    title: `Wedding venues in ${meta.name} — Venuees.in`,
    description: meta.description,
    openGraph: {
      title: `Wedding venues in ${meta.name} — Venuees.in`,
      description: meta.description,
      type: "website",
      url: `https://venuees.in/venues/${city}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(CITY_META).map((city) => ({ city }));
}

export const dynamic = "force-dynamic";

export default async function CityVenuesPage({ params }: { params: Promise<{ city: string }> }) {
  await requireSection("section_venues");
  const { city } = await params;
  const meta = CITY_META[city];
  if (!meta) return notFound();

  const allVenues = await getVenues();
  const cityVenues = allVenues.filter((v) => v.citySlug === city);
  const localities = LOCALITIES[city] ?? [];

  // JSON-LD for the city page
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Wedding venues in ${meta.name}`,
    "description": meta.description,
    "url": `https://venuees.in/venues/${city}`,
    "numberOfItems": cityVenues.length,
    "itemListElement": cityVenues.slice(0, 10).map((v, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": v.name,
      "url": `https://venuees.in/venues/${city}/${v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-")}/${v.slug}`,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MobileNav />
      <TopNav />

      {/* Breadcrumb */}
      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span>
            <Link href="/venues">Venues</Link> <span className="sep">/</span>
            <span>{meta.name}</span>
          </nav>
          <h1>
            Wedding venues in{" "}
            <span className="italic-serif" style={{ color: "var(--brand)" }}>{meta.name}.</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 600, lineHeight: 1.6, marginTop: 12 }}>
            {cityVenues.length} handpicked venues across the orange city — hotels, lawns, resorts, and heritage havelis. Every venue pre-visited, owner-verified, and priced transparently.
          </p>

          {/* Locality chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            {localities.map((l) => {
              const slug = l.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link key={l} href={`/venues/${city}/${slug}`} className="chip outline">
                  {l}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Venue grid */}
      <div className="vl-body" style={{ paddingTop: 0 }}>
        <main style={{ gridColumn: "1 / -1" }}>
          <div className="vl-results-head">
            <div className="vl-count"><b>{cityVenues.length}</b> venues · {meta.name}</div>
          </div>
          <div className="vl-grid">
            {cityVenues.map((v) => {
              const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
              return (
                <Link key={v.slug} href={`/venues/${city}/${localitySlug}/${v.slug}`} className="vcard">
                  <Photo
                    src={venueHero(v.slug, v.heroImage)}
                    alt={`${v.name} — ${v.scene}`}
                    variant={v.ph}
                    label={v.scene}
                    className="vcard-img"
                    style={{ height: 240 }}
                  >
                    <div className="badges-top">
                      <span className="badge-assured">{v.tag}</span>
                    </div>
                    <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
                  </Photo>
                  <div className="vcard-body">
                    <div className="vcard-row1">
                      <span className="chip outline">{v.type}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <Stars value={v.rating} size={12} /> {v.rating}
                        <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>({v.reviews})</span>
                      </span>
                    </div>
                    <h3 className="vcard-name">{v.name}</h3>
                    <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}</div>
                    <div className="vcard-specs">
                      <span><I.Users width={12} height={12} /> {v.capacity.min}–{v.capacity.max}</span>
                      <span>·</span>
                      <span>{v.halls.length} hall{v.halls.length !== 1 ? "s" : ""}</span>
                      {v.rooms && <><span>·</span><span><I.Bed width={12} height={12} /> {v.rooms} rooms</span></>}
                    </div>
                    <div className="vcard-price">
                      <div>
                        <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Veg from</div>
                        {v.vegPlate > 0 ? (
                          <>
                            <b>₹{v.vegPlate.toLocaleString("en-IN")}</b>
                            <small style={{ marginLeft: 4, color: "var(--ink-mute)", fontSize: 11 }}>/plate</small>
                          </>
                        ) : <b>On request</b>}
                      </div>
                      <span className="chip">View details</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>

      {/* Locality section */}
      {localities.length > 0 && (
        <section className="block" style={{ paddingTop: 0 }}>
          <Ornament>BROWSE BY AREA</Ornament>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "14px 0 24px" }}>
            Wedding venues by locality in <span className="italic-serif" style={{ color: "var(--brand)" }}>{meta.name}.</span>
          </h2>
          <div className="vgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {localities.map((l) => {
              const lSlug = l.toLowerCase().replace(/\s+/g, "-");
              const count = cityVenues.filter((v) => v.locality.toLowerCase().includes(l.toLowerCase())).length;
              return (
                <Link key={l} href={`/venues/${city}/${lSlug}`} className="vcard" style={{ padding: 24 }}>
                  <div className="vcard-body" style={{ padding: 0 }}>
                    <h3 className="vcard-name" style={{ fontSize: 22 }}>{l}</h3>
                    <div className="vcard-loc"><I.Pin width={12} height={12} /> {meta.name}, {meta.state}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 8 }}>
                      {count > 0 ? `${count} venue${count !== 1 ? "s" : ""}` : "View venues"}
                      <span style={{ color: "var(--brand)", marginLeft: 8 }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
      <MobileTabbar />
    </div>
  );
}
