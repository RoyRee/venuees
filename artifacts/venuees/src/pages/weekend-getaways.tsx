import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Ornament, Stars } from "../components/icons";
import { Photo } from "../components/photo";
import { api } from "../lib/api";
import { getawayPhotos } from "../lib/images";

export default function GetawayHubPage() {
  const { data: getaways = [], isLoading } = useQuery({
    queryKey: ["getaways"],
    queryFn: () => api.getaways.list(),
  });

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
        {isLoading ? (
          <div className="gcards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", height: 320, opacity: 0.4 }} />
            ))}
          </div>
        ) : (
          <div className="gcards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {getaways.map((g) => (
              <Link key={g.slug} href={`/weekend-getaways/${g.slug}`} className="gcard">
                <Photo
                  src={g.images[0]?.url ?? getawayPhotos[g.slug]?.hero}
                  variant={g.ph as "v2"}
                  label={g.name.toLowerCase()}
                  style={{ height: 240 }}
                />
                <div className="gcard-body">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="chip outline">{g.hoursFromNagpur}</span>
                    <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <Stars value={Number(g.rating)} size={12} /> {g.rating}
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
        )}
      </section>

      <section className="block">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-lg)", padding: "48px 40px", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <Ornament>PLAN A TRIP</Ornament>
          <h2 style={{ margin: "16px 0 12px" }}>Not sure which getaway fits?</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Tell us your group size, dates, and vibe — forest, lake, hills, or farm — and we'll suggest the right stay.
          </p>
          <Link href="/contact" className="btn btn-primary btn-lg">
            Talk to us <I.Arrow width={14} height={14} />
          </Link>
        </div>
      </section>

      <Footer />
      <MobileTabbar active="Getaways" />
    </div>
  );
}
