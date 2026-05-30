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
  const v = venues[active];
  const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
  const gallery = venueGallery(v.slug);
  const imgSrc = gallery[1] ?? venueHero(v.slug);

  return (
    <div
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div className="sig-inner">
        <Link
          href={`/venues/${v.citySlug}/${localitySlug}/${v.slug}`}
          className="sig-media ph dusk has-img"
          style={{ display: "block" }}
          aria-label={`View ${v.name} details`}
        >
          <img src={imgSrc} alt={v.name} loading="lazy" decoding="async" />
          <span className="ph-label">{v.name.toLowerCase()} · {v.locality.toLowerCase()}</span>
          <span className="sig-media-hover">View property →</span>
        </Link>
        <div>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.05, margin: "0 0 20px" }}>
            {v.name} <span className="italic-serif" style={{ color: "var(--brand)" }}>— where every wedding is ours.</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: 22 }}>
            {v.description}
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24, fontSize: 13, color: "var(--ink-soft)" }}>
            <span><I.Users width={14} height={14} /> {v.capacity.min.toLocaleString("en-IN")} – {v.capacity.max.toLocaleString("en-IN")} guests</span>
            {v.rooms && <span><I.Bed width={14} height={14} /> {v.rooms} rooms on-site</span>}
            <span><I.Car width={14} height={14} /> {v.parking} cars · valet</span>
            {cfg.feature_reviews && <span><Stars value={v.rating} size={13} /> {v.rating} · {v.reviews} reviews</span>}
          </div>
          {venues.length > 1 && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {venues.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View ${venues[i].name}`}
                  style={{
                    width: i === active ? 20 : 6,
                    height: 6,
                    borderRadius: i === active ? 3 : "50%",
                    background: i === active ? "var(--brand)" : "var(--line)",
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
      </div>
    </div>
  );
}
