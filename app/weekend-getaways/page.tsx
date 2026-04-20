import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { getaways } from "@/lib/data";
import { Photo } from "@/components/photo";
import { getawayPhotos } from "@/lib/images";

export const metadata = {
  title: "Weekend getaways from Nagpur — Venuees.in",
  description: "Forest villas, lake cottages and hill escapes within 4 hours of Nagpur. Pench, Tadoba, Khindsi, Chikhaldara and more.",
};

export default function GetawayHubPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>WEEKEND ESCAPES</Ornament>
        <h1>
          Four hours out. <span className="italic-serif" style={{ color: "var(--brand)" }}>A world away.</span>
        </h1>
        <p>
          Curated stays within a half-tank drive of Nagpur — forest villas, lakeside cottages, and hill hideouts. Friday evening out, Sunday evening home. No queues, no city noise.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <span className="chip">Pench · 2.5 hrs</span>
          <span className="chip">Tadoba · 3 hrs</span>
          <span className="chip">Khindsi · 1.5 hrs</span>
          <span className="chip">Chikhaldara · 4 hrs</span>
          <span className="chip">Seoni · 2 hrs</span>
          <span className="chip">Ramtek · 1 hr</span>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="gcards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {getaways.map((g) => (
            <Link key={g.slug} href={`/weekend-getaways/${g.slug}`} className="gcard">
              <Photo src={getawayPhotos[g.slug]?.hero} variant={g.ph} label={g.scene} style={{ height: 240 }} />
              <div className="gcard-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="chip outline">{g.hoursFromNagpur}</span>
                  <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <Stars value={g.rating} size={12} /> {g.rating}
                  </span>
                </div>
                <h4 style={{ fontSize: 22 }}>{g.name}</h4>
                <div className="gcard-loc"><I.Pin width={11} height={11} /> {g.location}</div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", margin: "8px 0 10px" }}>
                  &ldquo;{g.tagline}&rdquo;
                </p>
                <div className="gcard-specs">
                  <span><I.Bed width={11} height={11} /> {g.beds} bedrooms</span>
                  <span><I.Users width={11} height={11} /> up to {g.guests}</span>
                </div>
                <div className="gcard-price">
                  <div>
                    <b>₹{g.weekday.toLocaleString("en-IN")}</b><small>/night · weeknight</small>
                  </div>
                  <span className="wknd">wknd ₹{(g.weekend / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div>
            <Ornament>WHY BOOK WITH US</Ornament>
            <h2 className="block-title">We&rsquo;ve stayed at <span className="italic-serif" style={{ color: "var(--brand)" }}>every single one.</span></h2>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-n">01</div>
            <h4>Pre-visited</h4>
            <p>Every property is inspected by our team. Listings match reality — no Photoshopped kitchens.</p>
          </div>
          <div className="step">
            <div className="step-n">02</div>
            <h4>Direct to owner</h4>
            <p>You talk to the owner, not a call center. Special requests — vegan menu, early check-in — just work.</p>
          </div>
          <div className="step">
            <div className="step-n">03</div>
            <h4>Add-ons ready</h4>
            <p>Safari jeep, private chef, bonfire, yoga instructor — pick from a menu, we line it up before you arrive.</p>
          </div>
          <div className="step">
            <div className="step-n">04</div>
            <h4>Cancel-friendly</h4>
            <p>Free cancellation up to 72 hours before check-in. No hidden platform fees.</p>
          </div>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
