"use client";
import { useState } from "react";
import { Photo } from "./photo";
import { Stars } from "./icons";

type TabId = "about" | "portfolio" | "packages" | "reviews";

type VendorInfo = {
  name: string;
  category: string;
  yearsExp: number;
  completed: number;
  rating: number;
  reviews: number;
  priceFrom: number;
  locality: string;
  city: string;
  description?: string | null;
  ph: string;
};

type Image = { url: string; alt: string };

export function VendorTabs({ vendor: v, images }: { vendor: VendorInfo; images: Image[] }) {
  const [tab, setTab] = useState<TabId>("about");

  const tabs: { id: TabId; label: string }[] = [
    { id: "about",     label: "About" },
    { id: "portfolio", label: `Portfolio${images.length > 0 ? ` (${images.length})` : ""}` },
    { id: "packages",  label: "Packages" },
    { id: "reviews",   label: `Reviews (${v.reviews})` },
  ];

  const bio = v.description?.trim() ||
    `${v.name} has been part of the Nagpur wedding circuit for ${v.yearsExp} years. ` +
    `Based in ${v.locality}, they bring a personal approach to every event — ` +
    `${v.completed} weddings completed across Vidarbha, each attended personally. ` +
    `No outsourced work, no subcontracted teams.`;

  const solo  = v.priceFrom;
  const mid   = Math.round(v.priceFrom * 1.8);
  const prem  = Math.round(v.priceFrom * 3.2);

  return (
    <>
      <div className="vd-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="vd-body">
        <main>
          {/* ── ABOUT ── */}
          {tab === "about" && (
            <section className="vd-section">
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--ink-soft)", maxWidth: 680 }}>{bio}</p>
              <div className="vd-quickspecs" style={{ marginTop: 28 }}>
                <div><div className="lbl">Weddings completed</div><div className="val">{v.completed}<small>lifetime</small></div></div>
                <div><div className="lbl">Experience</div><div className="val">{v.yearsExp}<small>years</small></div></div>
                <div><div className="lbl">Rating</div><div className="val">{v.rating}<small>/ 5.0</small></div></div>
                <div><div className="lbl">Base city</div><div className="val">NGP<small>{v.city}</small></div></div>
              </div>
            </section>
          )}

          {/* ── PORTFOLIO ── */}
          {tab === "portfolio" && (
            <section className="vd-section">
              {images.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "4/3" }}>
                      <Photo src={img.url} alt={img.alt || v.name} variant={v.ph} style={{ height: "100%" }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ink-mute)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
                  <p style={{ fontSize: 15 }}>Portfolio photos are being uploaded.</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Send an enquiry to request their full portfolio directly.</p>
                </div>
              )}
            </section>
          )}

          {/* ── PACKAGES ── */}
          {tab === "packages" && (
            <section className="vd-section">
              <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 20 }}>
                Indicative pricing — final quote depends on event days, team size, and travel. Send an enquiry for a custom package.
              </p>
              <div className="pkgs">
                <div className="h rowlbl">Starts at</div>
                <div className="h">
                  <div className="pname">Essential</div>
                  <div className="pprice">₹{solo.toLocaleString("en-IN")}</div>
                </div>
                <div className="h feat">
                  <div className="pname" style={{ color: "#fff" }}>Classic</div>
                  <div className="pprice" style={{ color: "#fff" }}>₹{mid.toLocaleString("en-IN")}</div>
                </div>
                <div className="h">
                  <div className="pname">Premium</div>
                  <div className="pprice">₹{prem.toLocaleString("en-IN")}</div>
                </div>

                <div className="rowlbl">Coverage</div>
                <div>1 day · key moments</div>
                <div>Full-day coverage</div>
                <div>Multi-day + pre-wedding</div>

                <div className="rowlbl" style={{ borderBottom: "none" }}>Custom quote</div>
                <div style={{ borderBottom: "none", color: "var(--ink-mute)", fontSize: 13 }}>Available</div>
                <div style={{ borderBottom: "none", color: "var(--ink-mute)", fontSize: 13 }}>Available</div>
                <div style={{ borderBottom: "none", color: "var(--ink-mute)", fontSize: 13 }}>Available</div>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 16, textAlign: "center" }}>
                Prices above are starting points. Use the enquiry form for a personalised quote.
              </p>
            </section>
          )}

          {/* ── REVIEWS ── */}
          {tab === "reviews" && (
            <section className="vd-section">
              {v.reviews > 0 ? (
                <div className="rev-summary" style={{ marginBottom: 32 }}>
                  <div>
                    <div className="rev-big">{v.rating}</div>
                    <Stars value={v.rating} size={18} />
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{v.reviews} verified reviews</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 320 }}>
                      Ratings collected from couples who booked {v.name} through Venuees. Individual reviews are being collated and will appear here soon.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ink-mute)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
                  <p style={{ fontSize: 15 }}>No reviews yet.</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Be the first to review after your event.</p>
                </div>
              )}
            </section>
          )}
        </main>

        <aside>
          <div className="vd-sidebar" style={{ position: "sticky", top: 70 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.1, marginBottom: 12 }}>
              Book {v.name.split(" ")[0]}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
              Send an enquiry to check availability and get a personalised quote.
            </p>
            <a href="#enquire" className="btn btn-primary btn-lg" style={{ width: "100%", display: "block", textAlign: "center" }}>
              Check availability
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
