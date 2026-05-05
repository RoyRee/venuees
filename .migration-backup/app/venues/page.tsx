import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Stars } from "@/components/icons";
import { Photo } from "@/components/photo";
import { venues } from "@/lib/data";
import { venueHero } from "@/lib/images";

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

const LOCALITIES = [
  "Wardha Road", "Ramdaspeth", "Civil Lines", "Koradi Road", "Katol Road", "MIHAN",
];

export default function VenuesListPage() {
  const signature = venues.find((v) => v.isSignature)!;
  const rest = venues.filter((v) => !v.isSignature);
  const ordered = [signature, ...rest];

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
            {ordered.length} handpicked halls across the orange city — from Signature Resorts on Wardha Road to heritage havelis in Civil Lines. Every venue is pre-visited, owner-verified, and priced without &ldquo;starting from&rdquo; surprises.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {TYPES.map((t) => (
              <Link key={t.slug} href={`/venues?type=${t.slug}`} className="chip outline">{t.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="vl-body">
        <aside className="vl-filters">
          <div className="f-group">
            <h6>Venue type</h6>
            {TYPES.map((t) => (
              <label key={t.slug}><input type="checkbox" /> {t.label}</label>
            ))}
          </div>
          <div className="f-group">
            <h6>Locality</h6>
            {LOCALITIES.map((l) => (
              <label key={l}><input type="checkbox" /> {l}</label>
            ))}
          </div>
          <div className="f-group">
            <h6>Capacity</h6>
            <div className="f-range">
              <input type="range" min={50} max={1500} defaultValue={400} />
              <div className="bounds"><span>50</span><span>1,500+</span></div>
            </div>
          </div>
          <div className="f-group">
            <h6>Veg plate budget</h6>
            <div className="f-range">
              <input type="range" min={500} max={2500} defaultValue={1200} />
              <div className="bounds"><span>₹500</span><span>₹2,500</span></div>
            </div>
          </div>
          <div className="f-group">
            <h6>Must-haves</h6>
            <label><input type="checkbox" /> In-house catering</label>
            <label><input type="checkbox" /> Alcohol permitted</label>
            <label><input type="checkbox" /> Rooms on-site</label>
            <label><input type="checkbox" /> Parking 100+</label>
            <label><input type="checkbox" /> Late-night DJ</label>
            <label><input type="checkbox" /> Generator backup</label>
          </div>
          <div className="f-group" style={{ borderBottom: "none" }}>
            <h6>Rating</h6>
            <label><input type="checkbox" /> 4.5 & above</label>
            <label><input type="checkbox" /> 4.8 & above</label>
          </div>
        </aside>

        <main>
          <div className="vl-results-head">
            <div className="vl-count"><b>{ordered.length}</b> venues · Nagpur · Dec 2026 dates available</div>
            <div className="vl-sort">
              Sort by
              <select defaultValue="rec">
                <option value="rec">Recommended</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
                <option value="rating">Rating</option>
                <option value="bookings">Most booked</option>
              </select>
            </div>
          </div>

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
                  <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
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
        </main>
      </div>

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}
