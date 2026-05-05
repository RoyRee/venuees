import { Link, useParams, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Ornament, Stars } from "../components/icons";
import { Photo } from "../components/photo";
import { api, type Getaway } from "../lib/api";
import { getawayPhotos } from "../lib/images";

const ADDONS = [
  { k: "safari", name: "Jungle Safari", price: 4500, ph: "v4", desc: "6-seat jeep · 4am pickup" },
  { k: "chef", name: "Private Chef", price: 6800, ph: "saffron", desc: "3 meals · regional menu" },
  { k: "bonfire", name: "Bonfire + BBQ", price: 3200, ph: "dusk", desc: "Evening · 3 hrs · grill" },
  { k: "yoga", name: "Yoga + Breakfast", price: 2400, ph: "garden", desc: "Sunrise · instructor" },
];

function GetawayContent({ g }: { g: Getaway }) {
  const [submitted, setSubmitted] = useState(false);

  const nights = 2;
  const subtotal = g.weekday + g.weekend;
  const cleaning = 1800;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + cleaning + taxes;

  const enquiry = useMutation({
    mutationFn: () => api.enquiries.submit({
      kind: "getaway_enquiry",
      getawaySlug: g.slug,
      name: "Website lead",
      message: "Getaway booking request",
    }),
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div>
      <MobileNav />
      <TopNav />

      <nav className="vd-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/weekend-getaways">Weekend getaways</Link>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink)" }}>{g.name}</span>
      </nav>

      <section className="gd-hero">
        <div className="gd-hero-grid">
          <div>
            <Photo
              src={g.images[0]?.url ?? getawayPhotos[g.slug]?.hero}
              variant={g.ph as "v2"}
              label={g.name.toLowerCase()}
              style={{ height: "100%" }}
            />
          </div>
          <div>
            <Photo
              src={g.images[1]?.url ?? getawayPhotos[g.slug]?.gallery?.[1]}
              variant={g.ph === "garden" ? "v5" : "garden"}
              label="bedroom · morning light"
              style={{ height: "100%" }}
            />
            <Photo
              src={g.images[2]?.url ?? getawayPhotos[g.slug]?.gallery?.[2]}
              variant={g.ph === "ocean" ? "dusk" : "ocean"}
              label="private deck · sunset"
              style={{ height: "100%" }}
            />
          </div>
        </div>
      </section>

      <header className="gd-header">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span className="chip">{g.hoursFromNagpur}</span>
            <span className="chip outline"><Stars value={Number(g.rating)} size={12} /> {g.rating} · {g.reviews} reviews</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 4.4vw, 60px)", lineHeight: 1.02, marginBottom: 12 }}>{g.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-soft)", fontSize: 14 }}>
            <I.Pin width={14} height={14} /> {g.location}
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic", color: "var(--brand)", marginTop: 18 }}>
            &ldquo;{g.tagline}&rdquo;
          </p>

          <div className="gd-specs-row">
            <div><I.Bed width={16} height={16} /> {g.beds} bedrooms</div>
            <div><I.Users width={16} height={16} /> Up to {g.guests} guests</div>
            <div><I.Pool width={16} height={16} /> Private pool</div>
            <div><I.Wifi width={16} height={16} /> Wi-Fi + work desk</div>
            <div><I.Utensils width={16} height={16} /> Chef on-call</div>
            <div><I.Car width={16} height={16} /> Gated parking</div>
          </div>

          <section style={{ marginTop: 30 }}>
            <Ornament>THE STAY</Ornament>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 14px" }}>A {g.beds}-bedroom villa held just for your party.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 680 }}>
              {g.description ?? `Four acres of fenced grounds, a pool that looks like it's been there forever, and a kitchen that smells of filter coffee at 6am. The property is yours end-to-end — no other bookings on your dates, no neighbors sharing the pool.`}
            </p>
          </section>

          <section style={{ marginTop: 40 }}>
            <Ornament>ADD-ONS</Ornament>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", margin: "14px 0 18px" }}>Make a weekend of it.</h2>
            <div className="gd-addons">
              {ADDONS.map((a) => (
                <div key={a.k} className="gd-addon">
                  <div className="check"><I.Check width={11} height={11} /></div>
                  <div className={`ph ${a.ph}`}><span className="ph-label">{a.name.toLowerCase()}</span></div>
                  <h5>{a.name}</h5>
                  <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>{a.desc}</div>
                  <div className="price">+₹{a.price.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <Ornament>HOUSE RULES</Ornament>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 18, fontSize: 14, color: "var(--ink-soft)" }}>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Check-in · Check-out</b>2pm · 11am · Early/late on request</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Pets</b>On request · one dog max · ₹1,500/night</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Smoking</b>Outdoor only</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Events</b>Small gatherings ok · no DJs past 10pm</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Cancellation</b>Free up to 72 hrs before check-in</div>
              <div><b style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>Security deposit</b>₹10,000 refundable on checkout</div>
            </div>
          </section>
        </div>

        <aside className="gd-booking">
          <div className="price-big">₹{g.weekday.toLocaleString("en-IN")}<small>/ night · weeknight</small></div>
          <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 500, marginTop: 2 }}>Weekend ₹{g.weekend.toLocaleString("en-IN")}/night</div>
          <div className="date-split">
            <div><small>Check-in</small><b>Fri · 12 Jun</b></div>
            <div><small>Check-out</small><b>Sun · 14 Jun</b></div>
          </div>
          <div className="price-breakdown">
            <div><span>₹{g.weekday.toLocaleString("en-IN")} × 1 weeknight</span><span>₹{g.weekday.toLocaleString("en-IN")}</span></div>
            <div><span>₹{g.weekend.toLocaleString("en-IN")} × 1 weekend</span><span>₹{g.weekend.toLocaleString("en-IN")}</span></div>
            <div><span>Cleaning &amp; setup</span><span>₹{cleaning.toLocaleString("en-IN")}</span></div>
            <div><span>Taxes (GST)</span><span>₹{taxes.toLocaleString("en-IN")}</span></div>
            <div className="total"><span>Total · {nights} nights</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "16px 0", color: "var(--brand)" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>✓</div>
              <p style={{ fontSize: 13 }}>Request sent! Owner will call within 2 hours.</p>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 14 }}
              onClick={() => enquiry.mutate()}
              disabled={enquiry.isPending}
            >
              {enquiry.isPending ? "Sending…" : <>Request this stay <I.Arrow width={14} height={14} /></>}
            </button>
          )}
          <div className="tinyline" style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "center", marginTop: 8 }}>
            Owner replies within 2 hours · No charge until confirmed
          </div>
        </aside>
      </header>

      <Footer />
      <MobileTabbar />
    </div>
  );
}

export default function GetawayDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: getaway, isLoading, error } = useQuery({
    queryKey: ["getaway", slug],
    queryFn: () => api.getaways.get(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div>
        <MobileNav />
        <TopNav />
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--ink-mute)" }}>Loading…</div>
      </div>
    );
  }

  if (error || !getaway) return <Redirect to="/weekend-getaways" />;

  return <GetawayContent g={getaway} />;
}
