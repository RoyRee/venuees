import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament, Stars } from "@/components/icons";
import { realWeddings } from "@/lib/data";

export function generateStaticParams() {
  return realWeddings.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = realWeddings.find((x) => x.slug === slug);
  if (!w) return {};
  return { title: `${w.couple} · ${w.venue} — Real weddings · Venuees.in` };
}

export default async function RealWeddingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = realWeddings.find((x) => x.slug === slug);
  if (!w) return notFound();

  return (
    <div className="dh">
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <div className={`ph ${w.ph}`}><span className="ph-label">{w.scene}</span></div>
        </div>
        <div className="dh-hero-content">
          <nav style={{ fontSize: 12, color: "rgba(255,248,234,0.75)", marginBottom: 14 }}>
            <Link href="/real-weddings" style={{ color: "inherit" }}>Real weddings</Link>
            <span style={{ margin: "0 8px" }}>/</span><span>{w.couple}</span>
          </nav>
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>{w.date} · {w.guests} guests</div>
          <h1>{w.couple}, <span className="italic-serif">a Nagpur wedding.</span></h1>
          <p>{w.venue} · {w.date} · {w.guests} guests · 3 ceremonies</p>
        </div>
      </section>

      <section className="dh-section">
        <Ornament>THE STORY</Ornament>
        <h2 style={{ fontSize: "clamp(30px, 3.6vw, 44px)", margin: "14px 0 24px", maxWidth: 720 }}>
          From a boardroom meet-cute to a <span className="italic-serif" style={{ color: "var(--brand)" }}>450-guest celebration.</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="vl-body">
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              {w.couple.split("&")[0].trim()} and {w.couple.split("&")[1]?.trim() || "her partner"} met at an IT campus on MIHAN in 2021. Three years, one long-distance gap, and a proposal at Khindsi Lake later — they settled on a classic-meets-contemporary wedding at {w.venue}.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", marginTop: 16 }}>
              We took on the brief in July for a December wedding. Venue locked in week two, vendor shortlist by week four, tasting and dry-run in October. Day of: one co-ordinator every 60 guests, a dedicated family liaison, and a drone operator that no one noticed.
            </p>
            {w.quote && (
              <blockquote style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic", color: "var(--brand)", marginTop: 28, paddingLeft: 20, borderLeft: "3px solid var(--brand)" }}>
                &ldquo;{w.quote}&rdquo;
                <span style={{ display: "block", fontSize: 13, color: "var(--ink-mute)", fontStyle: "normal", marginTop: 10 }}>— {w.couple}</span>
              </blockquote>
            )}
          </div>
          <aside style={{ background: "var(--surface-tint)", padding: 30, borderRadius: "var(--radius-md)", alignSelf: "start" }}>
            <div className="eyebrow">By the numbers</div>
            <div style={{ display: "grid", gap: 18, marginTop: 16, fontSize: 14 }}>
              <div><b style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>{w.guests}</b>Guests hosted</div>
              <div><b style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>3</b>Ceremonies · haldi, mehendi-sangeet, wedding</div>
              <div><b style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>₹42L</b>Total budget</div>
              <div><b style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>14</b>Vendors engaged</div>
              <div><b style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>6mo</b>Planning timeline</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>THE ALBUM</Ornament>
        <div className="realgrid" style={{ marginTop: 30 }}>
          <div className="realcard r0"><div className={`ph ${w.ph}`} /></div>
          <div className="realcard r1"><div className="ph dusk" /></div>
          <div className="realcard r2"><div className="ph garden" /></div>
          <div className="realcard r3"><div className="ph rose" /></div>
          <div className="realcard r4"><div className="ph v2" /></div>
        </div>
      </section>

      <section className="dh-section" style={{ paddingTop: 0 }}>
        <Ornament>VENDORS ON THIS WEDDING</Ornament>
        <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", margin: "14px 0 24px" }}>The team that pulled it off</h2>
        <div className="vgrid">
          {[
            { role: "Venue", name: w.venue, ph: w.ph },
            { role: "Photography", name: "Studio Ishara", ph: "v3" },
            { role: "Décor", name: "Marigold Mandap Co.", ph: "garden" },
            { role: "Catering", name: "Spice Route Catering", ph: "saffron" },
          ].map((v) => (
            <div key={v.role} className="vcard">
              <div className={`ph ${v.ph} vcard-img`} style={{ height: 180 }}>
                <span className="ph-label">{v.name.toLowerCase()}</span>
              </div>
              <div className="vcard-body">
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-mute)" }}>{v.role}</div>
                <h3 className="vcard-name" style={{ fontSize: 20 }}>{v.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
