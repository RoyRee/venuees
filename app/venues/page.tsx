export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars } from "@/components/icons";
import { SaveButton } from "@/components/save-button";
import { Photo } from "@/components/photo";
import { VenueFilters } from "@/components/venue-filters";
import { SortSelect } from "@/components/sort-select";
import { venueHero } from "@/lib/images";
import { getVenues } from "@/lib/db/queries";

export const metadata = {
  title: "Wedding venues in Nagpur — Venuees.in",
  description: "42 handpicked wedding venues across Nagpur — hotels, lawns, resorts, heritage havelis. Filter by capacity, budget and locality.",
};

const TYPES = [
  { slug: "hotel", label: "Hotels & ballrooms" },
  { slug: "lawn", label: "Lawns & banquets" },
  { slug: "resort", label: "Resorts" },
  { slug: "heritage", label: "Heritage venues" },
  { slug: "farmhouse", label: "Farmhouses" },
  { slug: "banquet", label: "Banquet halls" },
];

type SP = {
  q?: string; sort?: string;
  type?: string | string[]; locality?: string | string[];
  minCap?: string; maxVegPlate?: string; minRating?: string;
  rooms?: string; parking?: string; bar?: string;
  dj?: string; generator?: string; catering?: string;
};

export default async function VenuesListPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  // Normalise: params can be string or string[] (when repeated)
  const toArr = (v?: string | string[]) => v ? (Array.isArray(v) ? v : [v]) : undefined;

  const venues = await getVenues({
    q:           sp.q,
    types:       toArr(sp.type),
    localities:  toArr(sp.locality),
    minCap:      sp.minCap     ? Number(sp.minCap)     : undefined,
    maxVegPlate: sp.maxVegPlate? Number(sp.maxVegPlate): undefined,
    minRating:   sp.minRating  ? Number(sp.minRating)  : undefined,
    hasRooms:    !!sp.rooms,
    hasParking:  !!sp.parking,
    hasBar:      !!sp.bar,
    hasDJ:       !!sp.dj,
    hasGenerator:!!sp.generator,
    hasCatering: !!sp.catering,
    sort:        sp.sort,
  });

  const hasFilters = !!(sp.q || sp.type || sp.locality || sp.minCap ||
    sp.maxVegPlate || sp.minRating || sp.rooms || sp.parking ||
    sp.bar || sp.dj || sp.generator || sp.catering);

  // Keep Signature pinned first only when no filters/search active
  const signature = !hasFilters ? venues.find((v) => v.isSignature) : undefined;
  const rest = venues.filter((v) => !v.isSignature);
  const ordered = signature ? [signature, ...rest] : venues;

  return (
    <div>
      <MobileNav />
      <TopNav />

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span> <span>Nagpur venues</span>
          </nav>

          {sp.q ? (
            <>
              <h1>Results for <span className="italic-serif" style={{ color: "var(--brand)" }}>&ldquo;{sp.q}&rdquo;</span></h1>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 580, lineHeight: 1.6 }}>
                {ordered.length === 0
                  ? "No venues matched — try a different term."
                  : `${ordered.length} venue${ordered.length !== 1 ? "s" : ""} found · `}
                <Link href="/venues" style={{ color: "var(--brand)" }}>Clear search</Link>
              </p>
            </>
          ) : (
            <>
              <h1>Wedding venues in <span className="italic-serif" style={{ color: "var(--brand)" }}>Nagpur.</span></h1>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 580, lineHeight: 1.6 }}>
                {ordered.length} handpicked halls across the orange city — hotels, lawns, resorts, and heritage havelis. Every venue pre-visited, owner-verified, and priced transparently.
              </p>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {TYPES.map((t) => (
              <Link key={t.slug} href={`/venues?type=${t.slug}`} className="chip outline">{t.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="vl-body">
        {/* Filter sidebar — useSearchParams requires Suspense in Next.js 15 */}
        <Suspense fallback={<aside className="vl-filters" style={{ opacity: 0.4 }} />}>
          <VenueFilters />
        </Suspense>

        <main>
          <div className="vl-results-head">
            <div className="vl-count">
              <b>{ordered.length}</b> venue{ordered.length !== 1 ? "s" : ""} · Nagpur
              {hasFilters && (
                <Link href="/venues" style={{ marginLeft: 10, fontSize: 12, color: "var(--brand)" }}>
                  Clear all filters
                </Link>
              )}
            </div>
            <div className="vl-sort">
              Sort by
              <Suspense fallback={<select><option>Recommended</option></select>}>
                <SortSelect
                  basePath="/venues"
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

          {ordered.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <h3 style={{ marginBottom: 8 }}>No venues matched</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Try removing some filters or broadening your search.</p>
              <Link href="/venues" className="btn btn-primary">Clear all filters</Link>
            </div>
          ) : (
            <div className="vl-grid">
              {ordered.map((v) => (
                <Link key={v.slug} href={`/venues/nagpur/${v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-")}/${v.slug}`} className="vcard">
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
                      {v.isSignature && <span className="badge-assured" style={{ background: "var(--brand)", color: "#fff" }}>Signature</span>}
                    </div>
                    <SaveButton type="venue" slug={v.slug} size={16} />
                    <div className="badges-bot"><I.Camera width={11} height={11} /> 48</div>
                  </Photo>
                  <div className="vcard-body">
                    <div className="vcard-row1">
                      <span className="chip outline">{v.type}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <Stars value={v.rating} size={12} /> {v.rating} <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>({v.reviews})</span>
                      </span>
                    </div>
                    <h3 className="vcard-name">{v.name}</h3>
                    <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}</div>
                    <div className="vcard-specs">
                      <span><I.Users width={12} height={12} /> {v.capacity.min}–{v.capacity.max}</span>
                      <span>·</span>
                      <span>{v.halls.length} halls</span>
                      {v.rooms && (<><span>·</span><span><I.Bed width={12} height={12} /> {v.rooms} rooms</span></>)}
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

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
