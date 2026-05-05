import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Stars } from "../components/icons";
import { Photo } from "../components/photo";
import { api, type VenueListItem } from "../lib/api";
import { venueHero } from "../lib/images";

const TYPES = [
  { slug: "hotel", label: "Hotels & ballrooms" },
  { slug: "lawn", label: "Lawns & banquets" },
  { slug: "resort", label: "Resorts" },
  { slug: "heritage", label: "Heritage venues" },
  { slug: "farmhouse", label: "Farmhouses" },
  { slug: "banquet", label: "Banquet halls" },
];

const LOCALITIES = [
  "Wardha Road", "Ramdaspeth", "Civil Lines", "Koradi Road", "Katol Road", "MIHAN",
];

function VenueCard({ v }: { v: VenueListItem }) {
  const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
  return (
    <Link href={`/venues/nagpur/${localitySlug}/${v.slug}`} className="vcard">
      <Photo
        src={v.primaryImage ?? venueHero(v.slug)}
        alt={`${v.name}`}
        variant={v.ph as "v2"}
        label={v.name.toLowerCase()}
        className="vcard-img"
        style={{ height: 240 }}
      >
        <div className="badges-top">
          <span className="badge-assured">{v.tag}</span>
          {v.isSignature && <span className="badge-assured" style={{ background: "var(--brand)", color: "#fff" }}>Signature</span>}
        </div>
        <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
      </Photo>
      <div className="vcard-body">
        <div className="vcard-row1">
          <span className="chip outline">{v.type}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <Stars value={Number(v.rating)} size={12} /> {v.rating}{" "}
            <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>({v.reviews})</span>
          </span>
        </div>
        <h3 className="vcard-name">{v.name}</h3>
        <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}</div>
        <div className="vcard-specs">
          <span><I.Users width={12} height={12} /> {v.capacityMin}–{v.capacityMax}</span>
          <span>·</span>
          {v.rooms && (<><span><I.Bed width={12} height={12} /> {v.rooms} rooms</span><span>·</span></>)}
          <span>{v.parking} parking</span>
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
  );
}

export default function VenuesListPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [typeFilter, setTypeFilter] = useState(params.get("type") ?? "");
  const [localityFilter, setLocalityFilter] = useState("");
  const [sortBy, setSortBy] = useState("rec");

  const { data: venues = [], isLoading, error } = useQuery({
    queryKey: ["venues", typeFilter],
    queryFn: () => api.venues.list({ city: "nagpur", type: typeFilter || undefined }),
  });

  let sorted = [...venues];
  if (localityFilter) {
    sorted = sorted.filter((v) => v.locality.toLowerCase().includes(localityFilter.toLowerCase()));
  }
  if (sortBy === "price-asc") sorted.sort((a, b) => a.vegPlate - b.vegPlate);
  else if (sortBy === "price-desc") sorted.sort((a, b) => b.vegPlate - a.vegPlate);
  else if (sortBy === "rating") sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
  else if (sortBy === "bookings") sorted.sort((a, b) => b.bookingsMonth - a.bookingsMonth);
  else sorted.sort((a, b) => (b.isSignature ? 1 : 0) - (a.isSignature ? 1 : 0));

  return (
    <div>
      <MobileNav />
      <TopNav />

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span> <span>Nagpur venues</span>
          </nav>
          <h1>Wedding venues in <span className="italic-serif" style={{ color: "var(--brand)" }}>Nagpur.</span></h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 580, lineHeight: 1.6 }}>
            {isLoading ? "Loading..." : `${sorted.length} handpicked halls`} across the orange city — from Signature Resorts on Wardha Road to heritage havelis in Civil Lines. Every venue is pre-visited, owner-verified, and priced without &ldquo;starting from&rdquo; surprises.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <button className={`chip${!typeFilter ? " active" : " outline"}`} onClick={() => setTypeFilter("")}>All</button>
            {TYPES.map((t) => (
              <button key={t.slug} className={`chip${typeFilter === t.slug ? " active" : " outline"}`} onClick={() => setTypeFilter(t.slug === typeFilter ? "" : t.slug)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="vl-body">
        <aside className="vl-filters">
          <div className="f-group">
            <h6>Venue type</h6>
            {TYPES.map((t) => (
              <label key={t.slug}>
                <input type="checkbox" checked={typeFilter === t.slug} onChange={(e) => setTypeFilter(e.target.checked ? t.slug : "")} /> {t.label}
              </label>
            ))}
          </div>
          <div className="f-group">
            <h6>Locality</h6>
            {LOCALITIES.map((l) => (
              <label key={l}>
                <input type="checkbox" checked={localityFilter === l} onChange={(e) => setLocalityFilter(e.target.checked ? l : "")} /> {l}
              </label>
            ))}
          </div>
          <div className="f-group" style={{ borderBottom: "none" }}>
            <h6>Must-haves</h6>
            <label><input type="checkbox" /> In-house catering</label>
            <label><input type="checkbox" /> Alcohol permitted</label>
            <label><input type="checkbox" /> Rooms on-site</label>
            <label><input type="checkbox" /> Parking 100+</label>
            <label><input type="checkbox" /> Late-night DJ</label>
          </div>
        </aside>

        <main>
          <div className="vl-results-head">
            <div className="vl-count">
              {isLoading ? "Loading venues…" : <><b>{sorted.length}</b> venues · Nagpur · Dec 2026 dates available</>}
            </div>
            <div className="vl-sort">
              Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rec">Recommended</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
                <option value="rating">Rating</option>
                <option value="bookings">Most booked</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-mute)" }}>
              Failed to load venues. Please try again.
            </div>
          )}

          {isLoading ? (
            <div className="vl-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="vcard" style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", height: 360, opacity: 0.4, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : (
            <div className="vl-grid">
              {sorted.map((v) => <VenueCard key={v.slug} v={v} />)}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
