"use client";
import { useState, useEffect } from "react";
import { Photo } from "./photo";
import { Stars, Ornament, I } from "./icons";
import { VenueCalendar } from "./venue-calendar";

// ── Types ─────────────────────────────────────────────────────────────────────

type Hall       = { name: string; type: string; area: string; theatre: number; floating: number; dining: number; ph?: string };
type Package    = { name: string; pricePerPlate: number; features: string[] };
type ReviewItem = { name: string; date: string; text: string; rating?: number };

type LocationInfo = {
  airport?:      string;
  railway?:      string;
  hotelCluster?: string;
};

export type VenueTabsData = {
  venue: {
    id: number;
    slug: string;
    name: string;
    description: string;
    capacity: { min: number; max: number };
    parking: number;
    rooms?: number;
    vegPlate: number;
    amenities: string[];
    isSignature?: boolean;
    locality: string;
    rating: number;
  };
  halls:         Hall[];
  hallPhotos:    string[];
  packages:      Package[];
  blockedDates:  string[];
  reviewItems:   ReviewItem[];
  locationInfo:  LocationInfo;
  googleMapsUrl: string | null | undefined;
  googleRating:  number | string | null | undefined;
  googleReviewCount: number | string | null | undefined;
  hasReviews:    boolean;
  hasLocation:   boolean;
  gallery:       string[];
  signatureVideos: string[];
};

// ── Tab IDs ───────────────────────────────────────────────────────────────────

type TabId = "overview" | "halls" | "packages" | "amenities" | "availability" | "location";

function amenIcon(name: string): keyof typeof I {
  const n = name.toLowerCase();
  if (n.includes("parking"))   return "Car";
  if (n.includes("ac") || n.includes("air")) return "Music"; // closest available
  if (n.includes("generator")) return "Star";
  if (n.includes("bridal"))    return "Sparkle";
  if (n.includes("kitchen") || n.includes("catering")) return "Flame";
  if (n.includes("bar"))       return "Star";
  if (n.includes("dj") || n.includes("sound")) return "Music";
  if (n.includes("room") || n.includes("suite")) return "Bed";
  if (n.includes("pool"))      return "Pool";
  if (n.includes("lawn") || n.includes("garden")) return "Leaf";
  return "Check";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VenueTabs({
  data,
  userProfile,
  children,
}: {
  data: VenueTabsData;
  userProfile: { name: string; email: string } | null;
  children?: React.ReactNode;
}) {
  const { venue: v, halls, hallPhotos, packages, blockedDates, reviewItems,
          locationInfo, googleMapsUrl, googleRating, googleReviewCount,
          hasReviews, hasLocation, gallery, signatureVideos } = data;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview",      label: "Overview" },
    ...(halls.length > 0       ? [{ id: "halls" as TabId,        label: "Halls & capacity" }] : []),
    ...(packages.length > 0    ? [{ id: "packages" as TabId,     label: "Packages" }]         : []),
    ...(v.amenities.length > 0 ? [{ id: "amenities" as TabId,    label: "Amenities" }]        : []),
    { id: "availability", label: "Availability" },
    ...(hasLocation             ? [{ id: "location" as TabId, label: hasReviews ? "Reviews & location" : "Location" }] : []),
  ];

  const [tab, setTab] = useState<TabId>("overview");
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(reviewItems);
  const [revRating, setRevRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [revText, setRevText] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectPath(window.location.pathname);
    }
  }, []);

  return (
    <>
      {/* ── Tab bar ── */}
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

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <section className="vd-section">
              <Ornament>OVERVIEW</Ornament>
              <h2 style={{ fontSize: "clamp(24px, 2.4vw, 34px)", margin: "14px 0 14px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                About {v.name}
              </h2>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 640 }}>{v.description}</p>
              <div className="vd-quickspecs">
                <div>
                  <div className="lbl">Guest capacity</div>
                  <div className="val">{v.capacity.min}–{v.capacity.max}<small>pax</small></div>
                </div>
                <div>
                  <div className="lbl">Event halls</div>
                  <div className="val">{halls.length || "—"}<small>indoor + open</small></div>
                </div>
                <div>
                  <div className="lbl">Parking</div>
                  <div className="val">{v.parking || "—"}<small>cars</small></div>
                </div>
                <div>
                  <div className="lbl">Rooms</div>
                  <div className="val">{v.rooms || "—"}<small>{v.rooms ? "on-site" : "off-site"}</small></div>
                </div>
                <div>
                  <div className="lbl">Veg plate</div>
                  <div className="val">
                    {v.vegPlate > 0 ? <>₹{v.vegPlate.toLocaleString("en-IN")}<small>/plate</small></> : "On request"}
                  </div>
                </div>
              </div>

              {/* Signature Instagram feed */}
              {v.isSignature && (
                <div style={{ marginTop: 40 }}>
                  <Ornament>LIVE FROM THE VENUE</Ornament>
                  <h2>
                    This week on{" "}
                    <span className="italic-serif" style={{ color: "var(--brand)" }}>@signature_resorts</span>
                  </h2>
                  <p style={{ marginBottom: 20 }}>
                    Real weddings, kitchen stories and fresh tablescape reels — straight from our Instagram.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                    {gallery.slice(0, 3).map((src, i) => (
                      <a key={i} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <Photo src={src} alt={`Signature Resorts · photo ${i + 1}`} variant="garden" style={{ height: 260, cursor: "pointer" }} />
                      </a>
                    ))}
                    {signatureVideos.map((src, i) => (
                      <a key={`v${i}`} href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", borderRadius: "var(--radius-md)", overflow: "hidden", height: 260 }}>
                        <video src={src} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </a>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <a href="https://www.instagram.com/signature_resorts/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                      Follow @signature_resorts on Instagram <I.Arrow width={14} height={14} />
                    </a>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── HALLS ── */}
          {tab === "halls" && halls.length > 0 && (
            <section className="vd-section">
              <Ornament>HALLS & CAPACITY</Ornament>
              <h2>{halls.length} venue{halls.length !== 1 ? "s" : ""} inside one address</h2>
              <p style={{ marginBottom: 24 }}>
                Mix and match for multi-day weddings — haldi in the courtyard, sangeet by the pool, pheras in the ballroom, reception on the lawn.
              </p>
              <div className="halls">
                {halls.map((h, i) => (
                  <div key={i} className="hallcard">
                    <Photo
                      src={(h.ph?.startsWith("data:") || h.ph?.startsWith("http") || h.ph?.startsWith("/")) ? h.ph : hallPhotos[i]}
                      alt={`${v.name} — ${h.name}`}
                      variant={(h.ph && !h.ph.startsWith("data:") && !h.ph.startsWith("http") && !h.ph.startsWith("/")) ? h.ph : "v2"}
                      label={h.name.toLowerCase()}
                    />
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

          {/* ── PACKAGES ── */}
          {tab === "packages" && (
            <section className="vd-section">
              {packages.length > 0 ? (
                <>
                  <Ornament>PACKAGES</Ornament>
                  <h2>Pricing packages</h2>
                  <p style={{ marginBottom: 28 }}>All-inclusive pricing per plate. Upgrade any layer separately.</p>
                  <div className="pricing-grid" style={{ "--pkg-count": packages.length } as React.CSSProperties}>
                    {packages.map((pkg, i) => (
                      <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", background: i === Math.floor(packages.length / 2) ? "var(--brand)" : "var(--surface)", color: i === Math.floor(packages.length / 2) ? "#fff" : "var(--ink)" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>
                          <div style={{ fontSize: 22, fontFamily: "var(--font-serif)", fontWeight: 700 }}>
                            ₹{pkg.pricePerPlate.toLocaleString("en-IN")}
                            <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, opacity: 0.8 }}>/plate</span>
                          </div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                          {pkg.features.map((feat, fi) => (
                            <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--ink-soft)" }}>
                              <I.Check width={14} height={14} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
                              {feat}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
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
                    <div className="rowlbl">Photography</div><div><I.X width={14} height={14} style={{ color: "var(--ink-mute)" }} /> Add-on</div><div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 1-photographer · half-day</div><div><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> 2-photographer · 2-day + film</div>
                    <div className="rowlbl">Rooms</div><div>—</div><div>5 rooms · night of</div><div>20 rooms · 2 nights</div>
                    <div className="rowlbl" style={{ borderBottom: "none" }}>Day-of manager</div>
                    <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
                    <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Included</div>
                    <div style={{ borderBottom: "none" }}><I.Check width={14} height={14} style={{ color: "var(--accent)" }} /> Dedicated team of 3</div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* ── AMENITIES ── */}
          {tab === "amenities" && v.amenities.length > 0 && (
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

          {/* ── AVAILABILITY ── */}
          {tab === "availability" && (
            <section className="vd-section">
              <Ornament>AVAILABILITY</Ornament>
              <h2>Check dates & muhurats</h2>
              <p style={{ marginBottom: 20 }}>
                Tap any available date to pre-fill your enquiry.{" "}
                <strong style={{ color: "#92400e" }}>✦ Golden dates</strong> are auspicious muhurat days — they fill up first.
              </p>
              <VenueCalendar blockedDates={blockedDates} />
            </section>
          )}

          {/* ── LOCATION & REVIEWS ── */}
          {tab === "location" && hasLocation && (
            <section className="vd-section">
              <Ornament>{hasReviews ? "LOCATION & REVIEWS" : "LOCATION"}</Ornament>
              <h2>Getting here</h2>

              {googleMapsUrl && (
                <div style={{ marginTop: 16, position: "relative" }}>
                  <iframe
                    width="100%"
                    height="260"
                    style={{ border: 0, borderRadius: "var(--radius-md)" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${v.name}, ${v.locality}, Nagpur`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ position: "absolute", bottom: 14, right: 14, background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#1a73e8", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", textDecoration: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Open in Google Maps
                  </a>
                </div>
              )}

              {(locationInfo.airport || locationInfo.railway || locationInfo.hotelCluster) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
                  {locationInfo.airport      && <div><b style={{ display: "block", color: "var(--ink)" }}>Airport</b>{locationInfo.airport}</div>}
                  {locationInfo.railway      && <div><b style={{ display: "block", color: "var(--ink)" }}>Railway</b>{locationInfo.railway}</div>}
                  {locationInfo.hotelCluster && <div><b style={{ display: "block", color: "var(--ink)" }}>Hotel cluster</b>{locationInfo.hotelCluster}</div>}
                </div>
              )}

              <div style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 16 }}>What couples say</h3>

                {(googleMapsUrl || googleRating) && (
                  <a
                    href={googleMapsUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", marginBottom: reviewsList.length > 0 ? 24 : 0, borderRadius: 10, border: "1px solid #e0e0e0", background: "#fff", textDecoration: "none", fontSize: 14, color: "var(--ink)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {googleRating ? (
                      <span>
                        <strong style={{ fontSize: 16 }}>{googleRating}</strong>
                        <span style={{ color: "#fbbc05", marginLeft: 4 }}>{"★".repeat(Math.round(Number(googleRating)))}</span>
                        {googleReviewCount && <span style={{ color: "var(--ink-mute)", marginLeft: 6, fontSize: 13 }}>{Number(googleReviewCount).toLocaleString("en-IN")} reviews on Google</span>}
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#1a73e8" }}>Read on Google →</span>
                      </span>
                    ) : (
                      <span style={{ color: "#1a73e8" }}>Read on Google →</span>
                    )}
                  </a>
                )}

                {reviewsList.length > 0 ? (
                  <>
                    <div className="rev-summary">
                      <div>
                        <div className="rev-big">{googleRating ?? v.rating}</div>
                        <Stars value={Number(googleRating ?? v.rating)} size={18} />
                        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>{reviewsList.length} verified review{reviewsList.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    {reviewsList.map((r, i) => (
                      <div key={i} className="rev-item">
                        <div className="ava ph rose" />
                        <div>
                          <h5>{r.name}</h5>
                          <div className="rev-meta">{r.date} · <Stars value={r.rating ?? 5} size={11} /></div>
                          <p>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: "20px 0 30px", color: "var(--ink-soft)", fontSize: 14 }}>
                    No reviews yet. Be the first to leave a review!
                  </div>
                )}

                {/* Review Submission Form */}
                <div style={{ marginTop: 32, padding: 24, border: "1px solid var(--line)", borderRadius: 12, background: "#fff" }}>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>Write a Review</h4>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>Share your experience with other couples.</p>
                  
                  {!userProfile ? (
                    <div style={{ textAlign: "center", padding: "24px 16px", border: "1px dashed var(--line)", borderRadius: 12, background: "var(--surface)" }}>
                      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>
                        Only registered and signed-in users can write a review.
                      </p>
                      <a
                        href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                        className="btn btn-primary"
                        style={{ display: "inline-flex", textDecoration: "none" }}
                      >
                        Log In to Write a Review
                      </a>
                    </div>
                  ) : submitStatus === "success" ? (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>✓</span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#166534" }}>Thank you! Your review has been submitted successfully.</div>
                    </div>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!revText.trim()) {
                        setErrorMessage("Please write a review.");
                        return;
                      }
                      setErrorMessage("");
                      setSubmitStatus("submitting");
                      try {
                        const res = await fetch(`/api/venues/${v.slug}/reviews`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rating: revRating, text: revText }),
                        });
                        if (!res.ok) {
                          let errMsg = "Failed to submit review";
                          try {
                            const resData = await res.json();
                            errMsg = resData.error || errMsg;
                          } catch {
                            errMsg = `Error ${res.status}: ${res.statusText}`;
                          }
                          throw new Error(errMsg);
                        }
                        const resData = await res.json();
                        setReviewsList((prev) => [resData.newReview, ...prev]);
                        setSubmitStatus("success");
                        setRevText("");
                        setRevRating(5);
                      } catch (err: any) {
                        setSubmitStatus("error");
                        setErrorMessage(err.message || "An error occurred. Please try again.");
                      }
                    }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--line)" }}>
                        <div className="ava ph rose" style={{ width: 32, height: 32, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand)", fontWeight: 600 }}>
                          {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                          Posting review as <strong style={{ color: "var(--ink)" }}>{userProfile.name}</strong>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", marginBottom: 6 }}>Your Rating</label>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = hoverRating ? star <= hoverRating : star <= revRating;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRevRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                style={{ background: "none", border: "none", padding: 2, cursor: "pointer", fontSize: 24, color: active ? "#fbbc05" : "#e0e0e0", transition: "color 0.15s ease" }}
                              >
                                ★
                              </button>
                            );
                          })}
                          <span style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 8 }}>
                            {revRating} star{revRating !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", marginBottom: 6 }}>Review</label>
                        <textarea
                          required
                          rows={4}
                          value={revText}
                          onChange={(e) => setRevText(e.target.value)}
                          placeholder="Tell us about the venue, food, service, and decor..."
                          style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                        />
                      </div>
                      
                      {errorMessage && (
                        <div style={{ fontSize: 13, color: "#c00" }}>{errorMessage}</div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={submitStatus === "submitting"}
                        style={{ padding: "12px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: submitStatus === "submitting" ? "not-allowed" : "pointer", opacity: submitStatus === "submitting" ? 0.7 : 1, transition: "background 0.2s" }}
                      >
                        {submitStatus === "submitting" ? "Submitting review..." : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          )}

        </main>

        {children && <aside>{children}</aside>}
      </div>
    </>
  );
}
