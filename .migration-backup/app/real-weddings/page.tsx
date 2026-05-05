import Link from "next/link";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I, Ornament } from "@/components/icons";
import { realWeddings } from "@/lib/data";
import { Photo } from "@/components/photo";
import { realWeddingPhotos } from "@/lib/images";

export const metadata = {
  title: "Real weddings — Venuees.in",
  description: "Actual weddings we hosted in Nagpur and beyond. Photos, numbers, notes from the couples.",
};

export default function RealWeddingsHub() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>REAL WEDDINGS</Ornament>
        <h1>The couples. <span className="italic-serif" style={{ color: "var(--brand)" }}>The stories. The numbers.</span></h1>
        <p>
          We don&rsquo;t post stock wedding photos. Every album below is from an actual wedding we managed — shot by our photographers, at venues you can book tomorrow. With honest guest counts and honest budgets.
        </p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="realgrid">
          {realWeddings.map((w, i) => (
            <Link key={w.slug} href={`/real-weddings/${w.slug}`} className={`realcard r${i % 5}`}>
              <Photo src={realWeddingPhotos[w.slug]} variant={w.ph} label={w.scene} style={{ height: "100%" }} />
              <div className="realcard-caption">
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#FFF8EA", letterSpacing: "-0.01em" }}>{w.couple}</div>
                <div style={{ fontSize: 11, color: "rgba(255,248,234,0.8)", marginTop: 3, letterSpacing: "0.05em" }}>{w.venue} · {w.date} · {w.guests} guests</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div>
            <Ornament>FEATURED STORIES</Ornament>
            <h2 className="block-title">Notes from <span className="italic-serif" style={{ color: "var(--brand)" }}>the couples.</span></h2>
          </div>
        </div>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {realWeddings.slice(0, 4).filter(w => w.quote).map((w) => (
            <div key={w.slug} className="vcard" style={{ padding: 28 }}>
              <blockquote style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic", lineHeight: 1.4, color: "var(--ink)", margin: 0 }}>
                &ldquo;{w.quote || "The best wedding we attended all year — and it was ours."}&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
                <div className={`ph ${w.ph}`} style={{ width: 44, height: 44, borderRadius: "50%" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{w.couple}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{w.venue} · {w.date}</div>
                </div>
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
