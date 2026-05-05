import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { vendors, getVendorBySlug } from "@/lib/data";
import { Photo } from "@/components/photo";
import { vendorPhotos, venuePhotos } from "@/lib/images";

export function generateStaticParams() {
  return vendors.map((v) => ({ category: v.categorySlug, slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVendorBySlug(slug);
  if (!v) return {};
  return { title: `${v.name} · ${v.category} — Venuees.in`, description: v.tagline };
}

export default async function VendorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVendorBySlug(slug);
  if (!v) return notFound();

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

      <div className="vd-gallery">
        <Photo src={vendorPhotos[v.slug]} variant={v.ph} label={v.scene}>
          <button className="vd-gallery-all"><I.Camera width={14} height={14} /> Portfolio · 240 photos</button>
        </Photo>
        <Photo src={venuePhotos["the-centre-point-grand"]?.gallery[1]} variant="v2" label="haldi · sunlight" />
        <Photo src={venuePhotos["mahalaxmi-lawns"]?.gallery[2]} variant="dusk" label="sangeet · stage" />
        <Photo src={vendorPhotos["rhea-bridal-makeup"]} variant="rose" label="bridal portrait" />
        <Photo src={venuePhotos["signature-resorts-nagpur"]?.gallery[3]} variant="garden" label="mandap · detail" />
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
        <aside className="vd-sidebar">
          <div className="vd-price-row">
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Package starts at</div>
              <div className="plate">₹{v.priceFrom.toLocaleString("en-IN")}</div>
              <small>Final price varies by event days + team size</small>
            </div>
          </div>
          <form>
            <input placeholder="Your name" />
            <input placeholder="Phone · +91" defaultValue="+91 " />
            <input placeholder="Wedding date" defaultValue="Dec 2026" />
            <select defaultValue="1">
              <option value="1">1 day · single event</option>
              <option>2 days · sangeet + wedding</option>
              <option>3 days · haldi + sangeet + wedding</option>
              <option>Full week · destination</option>
            </select>
            <button className="btn btn-primary btn-lg" type="button" style={{ width: "100%" }}>
              Check availability <I.Arrow width={14} height={14} />
            </button>
            <button className="btn btn-ghost" type="button" style={{ width: "100%" }}>
              <I.Phone width={14} height={14} /> Call {v.name.split(" ")[0]}
            </button>
            <div className="tinyline">Free consult · No advance required · Reply within 4 hours</div>
          </form>
        </aside>
      </header>

      <div className="vd-tabs">
        <button className="active">About</button>
        <button>Portfolio</button>
        <button>Packages</button>
        <button>Reviews ({v.reviews})</button>
        <button>Availability</button>
      </div>

      <div className="vd-body">
        <main>
          <section className="vd-section">
            <Ornament>ABOUT</Ornament>
            <h2>The story</h2>
            <p>
              {v.name} has been in the Nagpur wedding circuit for {v.yearsExp} years. Started as a {v.category.toLowerCase().replace(/s$/, "")} apprentice in {v.locality}, took on solo weddings from 2018 onwards, now leads a team of 4 across Vidarbha. Every wedding listed here was personally attended — no outsourced shoots, no subcontracted teams.
            </p>
            <div className="vd-quickspecs">
              <div><div className="lbl">Weddings completed</div><div className="val">{v.completed}<small>lifetime</small></div></div>
              <div><div className="lbl">Experience</div><div className="val">{v.yearsExp}<small>years</small></div></div>
              <div><div className="lbl">Rating</div><div className="val">{v.rating}<small>/ 5.0</small></div></div>
              <div><div className="lbl">Team size</div><div className="val">4<small>crew</small></div></div>
              <div><div className="lbl">Base city</div><div className="val">NGP<small>travels nationwide</small></div></div>
            </div>
          </section>

          <section className="vd-section">
            <Ornament>PORTFOLIO</Ornament>
            <h2>Recent work · 2025</h2>
            <div className="halls" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {[
                { c: "Aarti × Mohit", v: "Chitnavis Centre", d: "Dec 2025", p: "v3", src: venuePhotos["chitnavis-centre"]?.gallery[0] },
                { c: "Neha × Sahil", v: "Centre Point Grand", d: "Nov 2025", p: "dusk", src: venuePhotos["the-centre-point-grand"]?.gallery[2] },
                { c: "Riya × Vikram", v: "Mahalaxmi Lawns", d: "Feb 2025", p: "garden", src: venuePhotos["mahalaxmi-lawns"]?.gallery[0] },
                { c: "Meera × Karan", v: "Haveli Ashirwad", d: "Jan 2025", p: "v5", src: venuePhotos["haveli-ashirwad"]?.gallery[0] },
                { c: "Ishita × Dev", v: "Pench", d: "Oct 2024", p: "v4", src: vendorPhotos["lenslight-films"] },
                { c: "Priya × Arjun", v: "Signature Resorts", d: "Dec 2024", p: "plum", src: venuePhotos["signature-resorts-nagpur"]?.gallery[0] },
              ].map((p, i) => (
                <div key={i} className="hallcard">
                  <Photo src={p.src} variant={p.p} label={p.c.toLowerCase()} />
                  <div className="body">
                    <h4 style={{ fontSize: 17 }}>{p.c}</h4>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{p.v} · {p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="vd-section">
            <Ornament>PACKAGES</Ornament>
            <h2>Three tiers · transparent pricing</h2>
            <div className="pkgs">
              <div className="h rowlbl">Starts at</div>
              <div className="h">
                <div className="pname">Solo</div>
                <div className="pprice">₹{v.priceFrom.toLocaleString("en-IN")}</div>
              </div>
              <div className="h feat">
                <div className="pname" style={{ color: "#fff" }}>Classic</div>
                <div className="pprice" style={{ color: "#fff" }}>₹{(v.priceFrom * 1.8).toLocaleString("en-IN")}</div>
              </div>
              <div className="h">
                <div className="pname">Cinematic</div>
                <div className="pprice">₹{(v.priceFrom * 3.2).toLocaleString("en-IN")}</div>
              </div>

              <div className="rowlbl">Event days</div>
              <div>1 day</div>
              <div>2 days</div>
              <div>3+ days</div>

              <div className="rowlbl">Team</div>
              <div>{v.name.split(" ")[0]} solo</div>
              <div>Lead + 1 assistant</div>
              <div>Lead + 2 assistants + drone op</div>

              <div className="rowlbl">Deliverables</div>
              <div>300 edited photos</div>
              <div>800 photos + 3-min film</div>
              <div>1,500 photos + 15-min film + reels</div>

              <div className="rowlbl">Turnaround</div>
              <div>30 days</div>
              <div>21 days</div>
              <div>14 days · same-day reel</div>

              <div className="rowlbl" style={{ borderBottom: "none" }}>Travel included</div>
              <div style={{ borderBottom: "none" }}>Nagpur only</div>
              <div style={{ borderBottom: "none" }}>Within Maharashtra</div>
              <div style={{ borderBottom: "none" }}>Anywhere in India</div>
            </div>
          </section>

          <section className="vd-section">
            <Ornament>REVIEWS</Ornament>
            <h2>What couples say</h2>
            <div className="rev-summary">
              <div>
                <div className="rev-big">{v.rating}</div>
                <Stars value={v.rating} size={18} />
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{v.reviews} verified reviews</div>
              </div>
              <div className="rev-bars">
                {[
                  { l: "Professionalism", v: 98 },
                  { l: "Quality", v: 96 },
                  { l: "Punctuality", v: 94 },
                  { l: "Value for money", v: 90 },
                  { l: "Responsiveness", v: 92 },
                ].map((r) => (
                  <div key={r.l}>
                    <span>{r.l}</span>
                    <div className="rev-bar-fill"><div style={{ width: `${r.v}%` }} /></div>
                    <span style={{ textAlign: "right" }}>{(r.v / 20).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            {[
              { n: "Sanya G.", d: "Nov 2025 · 1-day wedding", t: "Final delivery was in 12 days. Every photo was in focus, every emotion captured. Our family is still asking who shot the wedding." },
              { n: "Arjun P.", d: "Jan 2025 · 3-day destination (Udaipur)", t: "Travelled with us, stayed with us, shot from dawn to midnight for 3 days. Zero ego, full results." },
            ].map((r) => (
              <div key={r.n} className="rev-item">
                <div className="ava ph rose" />
                <div>
                  <h5>{r.n}</h5>
                  <div className="rev-meta">{r.d} · <Stars value={5} size={11} /></div>
                  <p>{r.t}</p>
                </div>
              </div>
            ))}
          </section>
        </main>

        <aside>
          <div className="vd-sidebar" style={{ position: "sticky", top: 70 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.1, marginBottom: 12 }}>Book {v.name.split(" ")[0]}</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
              Date hold against a ₹5,000 refundable deposit. Full balance only after the shoot.
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Check dates <I.Arrow width={14} height={14} />
            </button>
          </div>
        </aside>
      </div>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
