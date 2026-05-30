"use client";
import { useState, useEffect, useRef } from "react";

type Props = { images: string[]; interval: number };

export function HeroCarousel({ images: rawImages, interval }: Props) {
  const images = Array.isArray(rawImages) && rawImages.length > 0 ? rawImages : [];
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {images.map((src, i) => (
        <div key={i} className={`hero-carousel-slide${i === active ? " active" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
      <div className="hero-overlay" />
      {images.length > 1 && (
        <div className="hero-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`hero-carousel-dot${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
