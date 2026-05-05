import { useState } from "react";
import { Link, useParams, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Ornament, Stars } from "../components/icons";
import { VenueGallery } from "../components/venue-gallery";
import { api, type Venue } from "../lib/api";
import { venueGallery, venuePhotos, signatureResortsVideos } from "../lib/images";
import { Photo } from "../components/photo";

const AMENITY_ICON: Record<string, keyof typeof I> = {
  parking: "Car", ac: "AC", wifi: "Wifi", bar: "Utensils",
  dj: "Music", catering: "Utensils", rooms: "Bed", bridal: "Heart",
  pool: "Pool", valet: "Car", generator: "Flame", lift: "Plus",
};

function amenIcon(text: string): keyof typeof I {
  const t = text.toLowerCase();
  if (t.includes("parking") || t.includes("valet") || t.includes("cars")) return AMENITY_ICON.parking;
  if (t.includes("ac")) return AMENITY_ICON.ac;
  if (t.includes("wi-fi") || t.includes("wifi")) return AMENITY_ICON.wifi;
  if (t.includes("bar")) return AMENITY_ICON.bar;
  if (t.includes("dj") || t.includes("music")) return AMENITY_ICON.dj;
  if (t.includes("kitchen") || t.includes("catering") || t.includes("cuisine")) return AMENITY_ICON.catering;
  if (t.includes("room")) return AMENITY_ICON.rooms;
  if (t.includes("bridal") || t.includes("suite") || t.includes("groom")) return AMENITY_ICON.bridal;
  if (t.includes("pool")) return AMENITY_ICON.pool;
  if (t.includes("generator")) return AMENITY_ICON.generator;
  if (t.includes("lift") || t.includes("accessible")) return AMENITY_ICON.lift;
  return "Check";
}

function EnquiryForm({ venue }: { venue: Venue }) {
  const [form, setForm] = useState({ name: "", phone: "+91 ", eventDate: "Dec 2026", guestCount: "150–500 guests", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.enquiries.submit({
      kind: "venue_enquiry",
      venueSlug: venue.slug,
      name: form.name,
      phone: form.phone,
      eventDate: form.eventDate,
      guestCount: form.guestCount,
      message: form.message,
    }),
    onSuccess: () => setSubmitted(true),
    onError: (e: Error) => setSubmitErr(e.message),
  });

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
        <h4 style={{ marginBottom: 8 }}>Got it!</h4>
        <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>We'll have the venue owner call you within 2 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input placeholder="Phone · +91" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      <input placeholder="Event date (or month)" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
      <select value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })}>
        <option>Under 150 guests</option>
        <option value="150–500 guests">150–500 guests</option>
        <option value="500–1000 guests">500–1,000 guests</option>
        <option value="1000+ guests">1,000+ guests</option>
      </select>
      <textarea placeholder="Anything specific? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} style={{ resize: "none", fontSize: 14, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", fontFamily: "inherit" }} />
      {submitErr && <p style={{ color: "red", fontSize: 12 }}>{submitErr}</p>}
      <button className="btn btn-primary btn-lg" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : <>Request availability <I.Arrow width={14} height={14} /></>}
      </button>
      <button className="btn btn-ghost" type="button" style={{ width: "100%" }}>
        <I.Phone width={14} height={14} /> Call {venue.isSignature ? "owner" : "venue"}
      </button>
      <div className="tinyline">No spam. No credit card. Expect a call in 2 hours.</div>
    </form>
  );
}

function VenueDetailContent({ v }: { v: Venue }) {
  const calDays = Array.from({ length: 30 }, (_, i) => {
    const state = i % 7 === 2 ? "booked" : i % 5 === 0 ? "limit" : "avail";
    return { n: i + 1, state };
  });

  const gallery = venueGallery(v.slug);
  const hallPhotos = venuePhotos[v.slug]?.halls ?? [];

  return (
    <div className="venue-detail">
      <MobileNav />
      <TopNav />

      <nav className="vd-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/venues">Nagpur venues</Link>
        <span className="sep">/</span>
        <span>{v.locality.split(",")[0]}</span>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{v.name}</span>
      </nav>

      <VenueGallery
        heroVariant={v.ph as "v2"}
        venueName={v.name}
        images={[
          { src: v.images[0]?.url ?? gallery[0], alt: `${v.name}`, label: v.name.toLowerCase() },
          { src: v.images[1]?.url ?? gallery[1], alt: `${v.name} ballroom`, label: "ballroom · evening", variant: (v.halls[1]?.ph || "v2") as "v2" },
          { src: v.images[2]?.url ?? gallery[2], alt: `${v.name} baraat entry`, label: "baraat entry", variant: (v.halls[2]?.ph || "dusk") as "v2" },
          { src: v.images[3]?.url ?? gallery[3], alt: `${v.name} mandap detail`, label: "mandap · detail", variant: (v.halls[0]?.ph || "garden") as "v2" },
          { src: v.images[4]?.url ?? gallery[4], alt: `${v.name} bridal suite`, label: "bridal suite · vanity", variant: "rose" as "v2" },
          ...gallery.slice(5).map((src, i) => ({ src, alt: `${v.name} photo ${i + 6}`, label: "", variant: "v2" as "v2" })),
        ]}
      />

      <header className="vd-header">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className="chip" style={{ background: "var(--brand)", color: "#fff" }}>{v.tag}</span>
            {v.isSignature && <span className="chip" style={{ background: "var(--accent)", color: "#fff" }}>Our flagship</span>}
            <span className="chip outline">{v.type}</span>
          </div>
          <h1>{v.name}</h1>
          <div className="vd-meta">
            <span><I.Pin width={13} height={13} /> {v.address}</span>
            <span><Stars value={Number(v.rating)} size={13} /> {v.rating} · {v.reviews} reviews</span>
            <span><I.Flame width={13} height={13} /> {v.bookingsMonth} booked this month</span>
          </div>
          <div className="vd-badges">
            <span className="chip">Alcohol permitted</span>
            <span className="chip">DJ till late</span>
            {v.rooms && <span className="chip">{v.rooms} rooms on-site</span>}
            <span className="chip">In-house catering</span>
            <span className="chip">{v.parking} car parking</span>
          </div>
        </div>
        <aside className="vd-sidebar">
          <div className="vd-price-row">
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Veg plate</div>
              <div className="plate">₹{v.vegPlate.toLocaleString("en-IN")}</div>
              <small>Non-veg ₹{v.nvPlate.toLocaleString("en-IN")} · Hall rent ₹{(v.hallRent / 1000).toFixed(0)}k</small>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Min spend</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>
                ₹{(v.minGuarantee / 100000).toFixed(1)}L
              </div>
            </div>
          </div>
          <div className="calendar-mini">
            <b>Dec 2026</b> · 19 dates still open · Mar 2027 filling fast
          </div>
          <EnquiryForm venue={v} />
        </aside>
      </header>

      <div className="vd-tabs">
        <button className="active">Overview</button>
        <button>Halls &amp; capacity</button>
        <button>Packages</button>
        <button>Amenities</button>
        <button>Availability</button>
        <button>Reviews ({v.reviews})</button>
        <button>Location</button>
      </div>

      <div className="vd-body">
        <main>
          <section className="vd-section">
            <Ornament>OVERVIEW</Ornament>
            <h2>About {v.name}</h2>
            <p>{v.description}</p>
            <div className="vd-quickspecs">
              <div><div className="lbl">Guest capacity</div><div className="val">{v.capacityMin}–{v.capacityMax}<small>pax</small></div></div>
              <div><div className="lbl">Event halls</div><div className="val">{v.halls.length}<small>indoor + open</small></div></div>
              <div><div className="lbl">Parking</div><div className="val">{v.parking}<small>cars</small></div></div>
              <div><div className="lbl">Rooms</div><div className="val">{v.rooms || "—"}<small>{v.rooms ? "on-site" : "off-site"}</small></div></div>
            </div>
          </section>

          {v.halls.length > 0 && (
            <section className="vd-section">
              <Ornament>HALLS &amp; CAPACITY</Ornament>
              <h2>{v.halls.length} venues inside one address</h2>
              <p style={{ marginBottom: 24 }}>Mix and match for multi-day weddings — haldi in the courtyard, sangeet by the pool, pheras in the ballroom, reception on the lawn.</p>
              <div className="halls">
                {v.halls.map((h, i) => (
                  <div key={h.id} className="hallcard">
                    <Photo src={hallPhotos[i]} alt={`${v.name} — ${h.name}`} variant={h.ph as "v2"} label={h.name.toLowerCase()} />
                    <div className="body">
                      <h4>{h.name}</h4>
                      <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 10 }}>{h.type} · {h.area}</div>
                      <div className="specs">
                        <div><b>{h.theatre}</b>Theatre</div>
                        <div><b>{h.floating}</b>Floating</div>
                        <div><b>{h.dining}</b>Dining</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="vd-section">
            <Ornament>PACKAGES</Ornament>
            <h2>Three ways to wed here</h2>
            <p style={{ marginBottom: 28 }}>All-inclusive pricing per plate — covers venue, catering, basic décor, and day-of coordination.</p>
            <div className="pkgs">
              <div className="h rowlbl">Starts at</div>
              <div className="h"><div className="pname">Essential</div><div className="pprice">₹{v.vegPlate.toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 4 }}>/plate</small></div></div>
              <div className="h feat"><div className="pname" style={{ color: "#fff" }}>Signature</div><div className="pprice" style={{ color: "#fff" }}>₹{(v.vegPlate + 400).toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>/plate</small></div></div>
              <div className="h"><div className="pname">Royal</div><div className="pprice">₹{(v.vegPlate + 850).toLocaleString("en-IN")}<small style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 4 }}>/plate</small></div></div>
              <div className="rowlbl">Venue rental</div><div>1 hall · 6 hours</div><div>2 halls · 10 hours</div><div>Whole property · 24h</div>
              <div className="rowlbl">Menu courses</div><div>12 items · 1 live station</div><div>18 items · 3 live stations</div><div>26 items · 5 stations + dessert bar</div>
              <div className="rowlbl">Décor</div><div>Classic marigold + lights</div><div>Themed mandap · floral ceiling</div><div>Full installation by Studio Rang</div>
              <div className="rowlbl">Photography</div>
              <div><I.X width={14} height={14} style={{ color: "var(--ink-mute)" }} /> Add-on</div>
              <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 1-photographer · half-day</div>
              <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 2-photographer · 2-day + film</div>
              <div className="rowlbl">Day-of manager</div>
              <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
              <div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
              <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Dedicated team of 3</div>
            </div>
          </section>

          {v.amenities.length > 0 && (
            <section className="vd-section">
              <Ornament>AMENITIES</Ornament>
              <h2>What&rsquo;s included</h2>
              <div className="amen-grid">
                {v.amenities.map((a, i) => {
                  const IconComp = I[amenIcon(a)];
                  return (
                    <div key={i} className="amen-cell">
                      <IconComp width={22} height={22} />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="vd-section">
            <Ornament>AVAILABILITY</Ornament>
            <h2>December 2026</h2>
            <p style={{ marginBottom: 20 }}>Live availability from our bookings system. Sunday muhurtas are in high demand between Nov–Feb.</p>
            <div className="cal-head">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (<div key={d}>{d}</div>))}
            </div>
            <div className="cal">
              {calDays.map((d) => (
                <div key={d.n} className={`day ${d.state}`}>{d.n}</div>
              ))}
            </div>
            <div className="cal-legend">
              <span><span className="dot" style={{ background: "var(--mehendi)" }} /> Available</span>
              <span><span className="dot" style={{ background: "var(--accent)" }} /> Only 1 slot</span>
              <span><span className="dot" style={{ background: "var(--line)" }} /> Booked</span>
            </div>
          </section>

          <section className="vd-section">
            <Ornament>REVIEWS</Ornament>
            <h2>What couples say</h2>
            <div className="rev-summary">
              <div>
                <div className="rev-big">{v.rating}</div>
                <Stars value={Number(v.rating)} size={18} />
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{v.reviews} verified reviews</div>
              </div>
              <div className="rev-bars">
                {[
                  { l: "Venue & ambience", v: 98 },
                  { l: "Food", v: 94 },
                  { l: "Staff", v: 96 },
                  { l: "Value for money", v: 88 },
                  { l: "Punctuality", v: 92 },
                ].map((r) => (
                  <div key={r.l}>
                    <span>{r.l}</span>
                    <div className="rev-bar-fill"><div style={{ width: `${r.v}%` }} /></div>
                    <span style={{ textAlign: "right" }}>{(r.v / 20).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {v.isSignature && (
            <section className="vd-section">
              <Ornament>LIVE FROM THE VENUE</Ornament>
              <h2>This week on <span className="italic-serif" style={{ color: "var(--brand)" }}>@signature_resorts</span></h2>
              <p style={{ marginBottom: 20 }}>Real weddings, kitchen stories and fresh tablescape reels — straight from our Instagram.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {venueGallery(v.slug).slice(0, 3).map((src, i) => (
                  <a key={i} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Photo src={src} alt={`Signature Resorts · photo ${i + 1}`} variant="garden" style={{ height: 260, cursor: "pointer" }} />
                  </a>
                ))}
                {signatureResortsVideos.map((src, i) => (
                  <a key={`v${i}`} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", borderRadius: "var(--radius-md)", overflow: "hidden", height: 260 }}>
                    <video src={src} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="vd-section">
            <Ornament>LOCATION</Ornament>
            <h2>Getting here</h2>
            <div className="ph ocean" style={{ height: 300, borderRadius: "var(--radius-md)", marginTop: 16 }}>
              <span className="ph-label">map · {v.locality.toLowerCase()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
              <div><b style={{ display: "block", color: "var(--ink)" }}>Airport</b>12 min · Dr. B.R. Ambedkar Intl</div>
              <div><b style={{ display: "block", color: "var(--ink)" }}>Railway</b>18 min · Nagpur Junction</div>
              <div><b style={{ display: "block", color: "var(--ink)" }}>Hotel cluster</b>Ramdaspeth · 8 min</div>
            </div>
          </section>
        </main>

        <aside>
          <div className="vd-sidebar" style={{ position: "sticky", top: 70 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.1, marginBottom: 12 }}>
              Lock {v.name.split(" ")[0]} for your date
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
              Hold good for 72 hours · ₹25,000 refundable deposit · no credit card on file.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Hold this date <I.Arrow width={14} height={14} />
            </Link>
            <Link href="/contact" className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}>
              <I.Phone width={14} height={14} /> Talk to a planner
            </Link>
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-cta">
        <Link href="#" className="btn btn-ghost"><I.Phone width={14} height={14} /> Call</Link>
        <Link href="/contact" className="btn btn-primary">Request availability</Link>
      </div>

      <Footer />
      <MobileTabbar active="Venues" />
    </div>
  );
}

export default function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: venue, isLoading, error } = useQuery({
    queryKey: ["venue", slug],
    queryFn: () => api.venues.get(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div>
        <MobileNav />
        <TopNav />
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--ink-mute)" }}>
          Loading venue…
        </div>
      </div>
    );
  }

  if (error || !venue) return <Redirect to="/venues" />;

  return <VenueDetailContent v={venue} />;
}
