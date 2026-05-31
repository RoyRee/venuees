"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { I, Stars } from "@/components/icons";
import { venueHero, venueGallery } from "@/lib/images";
import type { Venue } from "@/lib/data";
import type { SiteConfig } from "@/lib/site-config";

type Props = {
  venues: Venue[];
  interval: number;
  cfg: Pick<SiteConfig, "feature_reviews">;
};

export function SignatureCarousel({ venues, interval, cfg }: Props) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (venues.length <= 1) return;
    const id = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % venues.length);
    }, interval);
    return () => clearInterval(id);
  }, [venues.length, interval]);

  if (venues.length === 0) return null;

  return (
    <div
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div className="sig-inner">

        {/* ── Image column: all slides stacked, crossfade ── */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius)" }}>
          {venues.map((v, i) => {
            const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
            const gallery = venueGallery(v.slug);
            const imgSrc = gallery[1] ?? venueHero(v.slug);
            return (
              <Link
                key={v.slug}
                href={`/venues/${v.citySlug}/${localitySlug}/${v.slug}`}
                className="sig-media ph dusk has-img"
                aria-label={`View ${v.name} details`}
                style={{
                  display: "block",
                  position: i === 0 ? "relative" : "absolute",
                  inset: i === 0 ? undefined : 0,
                  opacity: i === active ? 1 : 0,
                  transition: "opacity 0.8s ease",
                  pointerEvents: i === active ? "auto" : "none",
                  borderRadius: 0,
                }}
              >
                <img src={imgSrc} alt={v.name} loading="lazy" decoding="async" />
                <span className="ph-label">{v.name.toLowerCase()} · {v.locality.toLowerCase()}</span>
                <span className="sig-media-hover">View property →</span>
              </Link>
            );
          })}
        </div>

        {/* ── Text column: all slides stacked, crossfade ── */}
        <div style={{ position: "relative" }}>
          {venues.map((v, i) => (
            <div
              key={v.slug}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: i === active ? 1 : 0,
                transition: "opacity 0.8s ease",
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              {/* Title — clamped to 3 lines so height is consistent */}
              <h2 style={{
                fontSize: "clamp(36px, 4vw, 56px)",
                lineHeight: 1.05,
                margin: "0 0 20px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "calc(clamp(36px, 4vw, 56px) * 1.05 * 3)",
              }}>
                {v.name}{" "}
                <span className="italic-serif" style={{ color: "var(--brand)" }}>
                  — where every wedding is ours.
                </span>
              </h2>

              {/* Description — clamped to 3 lines */}
              <p style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--ink-soft)",
                marginBottom: 22,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "calc(16px * 1.7 * 3)",
              }}>
                {v.description}
              </p>

              {/* Specs — always render all 4 rows so height never shifts */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24, fontSize: 13, color: "var(--ink-soft)" }}>
                <span><I.Users width={14} height={14} /> {v.capacity.min.toLocaleString("en-IN")} – {v.capacity.max.toLocaleString("en-IN")} guests</span>
                <span><I.Bed width={14} height={14} /> {v.rooms ? `${v.rooms} rooms on-site` : "—"}</span>
                <span><I.Car width={14} height={14} /> {v.parking} cars · valet</span>
                {cfg.feature_reviews && (
                  <span><Stars value={v.rating} size={13} /> {v.rating} · {v.reviews} reviews</span>
                )}
              </div>

              {/* Dots */}
              {venues.length > 1 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {venues.map((_, j) => (
                    <button
                      key={j}
                      onClick={() => setActive(j)}
                      aria-label={`View ${venues[j].name}`}
                      style={{
                        width: j === active ? 20 : 6,
                        height: 6,
                        borderRadius: j === active ? 3 : "50%",
                        background: j === active ? "var(--brand)" : "var(--line)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
