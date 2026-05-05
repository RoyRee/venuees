import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { Ornament } from "../components/icons";
import { Photo } from "../components/photo";
import { api } from "../lib/api";
import { realWeddingPhotos } from "../lib/images";

export default function RealWeddingsHub() {
  const { data: realWeddings = [], isLoading } = useQuery({
    queryKey: ["real-weddings"],
    queryFn: () => api.realWeddings.list(),
  });

  const withQuotes = realWeddings.filter((w) => w.quote);

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
        {isLoading ? (
          <div style={{ height: 400, background: "var(--surface)", borderRadius: "var(--radius-md)", opacity: 0.4 }} />
        ) : (
          <div className="realgrid">
            {realWeddings.map((w, i) => (
              <Link key={w.slug} href={`/real-weddings/${w.slug}`} className={`realcard r${i % 5}`}>
                <Photo
                  src={w.images[0]?.url ?? realWeddingPhotos[w.slug]}
                  variant={w.ph as "v2"}
                  label={w.couple.toLowerCase()}
                  style={{ height: "100%" }}
                />
                <div className="realcard-caption">
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#FFF8EA", letterSpacing: "-0.01em" }}>{w.couple}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,248,234,0.8)", marginTop: 3, letterSpacing: "0.05em" }}>
                    {w.venue} · {w.date} · {w.guests} guests
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {withQuotes.length > 0 && (
        <section className="block">
          <div className="block-head">
            <div>
              <Ornament>FEATURED STORIES</Ornament>
              <h2 className="block-title">Notes from <span className="italic-serif" style={{ color: "var(--brand)" }}>the couples.</span></h2>
            </div>
          </div>
          <div className="vgrid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {withQuotes.slice(0, 4).map((w) => (
              <div key={w.slug} className="vcard" style={{ padding: 28 }}>
                <blockquote style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic", lineHeight: 1.4, color: "var(--ink)", margin: 0 }}>
                  &ldquo;{w.quote}&rdquo;
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
      )}

      <Footer />
      <MobileTabbar />
    </div>
  );
}
