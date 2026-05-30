import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars } from "@/components/icons";
import { Photo } from "@/components/photo";
import { venueHero } from "@/lib/images";
import { getVenues } from "@/lib/db/queries";
import { requireSection } from "@/lib/section-guard";

// Maps locality slug → display name
const LOCALITY_NAMES: Record<string, string> = {
  "wardha-road":  "Wardha Road",
  "civil-lines":  "Civil Lines",
  "ramdaspeth":   "Ramdaspeth",
  "koradi-road":  "Koradi Road",
  "mihan":        "MIHAN",
  "katol-road":   "Katol Road",
};

const CITY_NAMES: Record<string, string> = {
  nagpur: "Nagpur",
};

export async function generateMetadata({ params }: { params: Promise<{ city: string; locality: string }> }) {
  const { city, locality } = await params;
  const cityName     = CITY_NAMES[city];
  const localityName = LOCALITY_NAMES[locality];
  if (!cityName || !localityName) return {};
  return {
    title: `Wedding venues in ${localityName}, ${cityName} — Venuees.in`,
    description: `Handpicked wedding venues on ${localityName}, ${cityName}. Hotels, banquet halls, resorts and lawns — transparent pricing, real availability.`,
    openGraph: {
      title: `Wedding venues in ${localityName}, ${cityName}`,
      description: `Handpicked wedding venues on ${localityName}, ${cityName}. Transparent pricing, real availability.`,
      type: "website",
      url: `https://venuees.in/venues/${city}/${locality}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(LOCALITY_NAMES).flatMap((loc) =>
    Object.keys(CITY_NAMES).map((city) => ({ city, locality: loc }))
  );
}

export const dynamic = "force-dynamic";

export default async function LocalityVenuesPage({ params }: { params: Promise<{ city: string; locality: string }> }) {
  await requireSection("section_venues");
  const { city, locality } = await params;
  const cityName     = CITY_NAMES[city];
  const localityName = LOCALITY_NAMES[locality];
  if (!cityName || !localityName) return notFound();

  const allVenues = await getVenues();
  const localVenues = allVenues.filter((v) =>
    v.citySlug === city &&
    v.locality.toLowerCase().includes(localityName.toLowerCase())
  );

  // JSON-LD breadcrumb + ItemList
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",               "item": "https://venuees.in" },
          { "@type": "ListItem", "position": 2, "name": "Venues",             "item": "https://venuees.in/venues" },
          { "@type": "ListItem", "position": 3, "name": cityName,             "item": `https://venuees.in/venues/${city}` },
          { "@type": "ListItem", "position": 4, "name": localityName,         "item": `https://venuees.in/venues/${city}/${locality}` },
        ],
      },
      {
        "@type": "ItemList",
        "name": `Wedding venues in ${localityName}, ${cityName}`,
        "url": `https://venuees.in/venues/${city}/${locality}`,
        "numberOfItems": localVenues.length,
        "itemListElement": localVenues.map((v, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": v.name,
          "url": `https://venuees.in/venues/${city}/${locality}/${v.slug}`,
        })),
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MobileNav />
      <TopNav />

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span>
            <Link href="/venues">Venues</Link> <span className="sep">/</span>
            <Link href={`/venues/${city}`}>{cityName}</Link> <span className="sep">/</span>
            <span>{localityName}</span>
          </nav>
          <h1>
            Wedding venues in{" "}
            <span className="italic-serif" style={{ color: "var(--brand)" }}>{localityName}, {cityName}.</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 600, lineHeight: 1.6, marginTop: 12 }}>
            {localVenues.length > 0
              ? `${localVenues.length} venue${localVenues.length !== 1 ? "s" : ""} on ${localityName} — all pre-visited, owner-verified, and transparently priced.`
              : `Explore wedding venues near ${localityName}, ${cityName}.`}
          </p>
        </div>
      </div>

      <div className="vl-body" style={{ paddingTop: 0 }}>
        <main style={{ gridColumn: "1 / -1" }}>
          {localVenues.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                No venues listed here yet. <Link href={`/venues/${city}`} style={{ color: "var(--brand)" }}>Browse all {cityName} venues →</Link>
              </p>
            </div>
          ) : (
            <div className="vl-grid">
              {localVenues.map((v) => (
                <Link key={v.slug} href={`/venues/${city}/${locality}/${v.slug}`} className="vcard">
                  <Photo
                    src={venueHero(v.slug)}
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
                        <b>₹{v.vegPlate.toLocaleString("en-IN")}</b>
                        <small style={{ marginLeft: 4, color: "var(--ink-mute)", fontSize: 11 }}>/plate</small>
                      </div>
                      <span className="chip">View details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Internal SEO links */}
      <section className="block" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, color: "var(--ink-soft)" }}>
          Explore more in {cityName}
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(LOCALITY_NAMES)
            .filter(([slug]) => slug !== locality)
            .map(([slug, name]) => (
              <Link key={slug} href={`/venues/${city}/${slug}`} className="chip outline">
                Venues in {name}
              </Link>
            ))}
          <Link href={`/venues/${city}`} className="chip outline">All {cityName} venues</Link>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
