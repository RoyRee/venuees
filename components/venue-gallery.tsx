"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { I } from "@/components/icons";

// ── Types ─────────────────────────────────────────────────────────────────────

type GalleryImage = {
  src: string;
  alt: string;
  label: string;
  variant?: string;
};

type Props = {
  images: GalleryImage[];
  venueName: string;
  /** CSS class token for the first cell's ph gradient (fallback) */
  heroVariant?: string;
};

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) delta > 0 ? onNext() : onPrev();
    touchStartX.current = null;
  }

  const img = images[index];

  return createPortal(
    <div
      className="lb-overlay"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Counter */}
      <div className="lb-counter">{index + 1} / {images.length}</div>

      {/* Close */}
      <button className="lb-close" onClick={onClose} aria-label="Close">
        <I.X width={20} height={20} />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="lb-nav lb-prev"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous photo"
        >
          <I.ChevronLeft width={24} height={24} />
        </button>
      )}

      {/* Main image */}
      <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="lb-img"
          draggable={false}
        />
        {img.label && <div className="lb-label">{img.label}</div>}
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="lb-nav lb-next"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next photo"
        >
          <I.ChevronRight width={24} height={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((im, i) => (
            <button
              key={i}
              className={`lb-thumb${i === index ? " active" : ""}`}
              onClick={() => onGoTo(i)}
              aria-label={`Photo ${i + 1}`}
            >
              {im.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={im.src} alt="" draggable={false} />
              ) : (
                <div className={`ph ${im.variant || "v2"}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

// ── VenueGallery ──────────────────────────────────────────────────────────────

export function VenueGallery({ images, venueName, heroVariant = "v2" }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]);
  const next = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]);

  // Also navigate thumbnails in the lightbox
  const goTo = useCallback((i: number) => setLightboxIdx(i), []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const LABELS = ["ballroom · evening", "baraat entry", "mandap · detail", "bridal suite · vanity"];
  const VARIANTS = ["v2", "dusk", "garden", "rose"];

  return (
    <>
      <div className="vd-gallery">
        {/* Hero cell */}
        <button
          className={`vd-gallery-cell ph ${heroVariant}${images[0]?.src ? " has-img" : ""}`}
          onClick={() => open(0)}
          aria-label={`Open photo gallery — ${images[0]?.label || venueName}`}
        >
          {images[0]?.src && (
            <img src={images[0].src} alt={images[0].alt} loading="eager" decoding="async" />
          )}
          {images[0]?.label && <span className="ph-label">{images[0].label}</span>}
          <span className="vd-gallery-all">
            <I.Camera width={14} height={14} />
            {images.length > 5 ? `All ${images.length} photos` : "View all photos"}
          </span>
        </button>

        {/* Thumbnail cells 1–4 */}
        {[1, 2, 3, 4].map((n) => {
          const im = images[n];
          const variant = VARIANTS[n - 1];
          const label = im?.label || LABELS[n - 1];
          return (
            <button
              key={n}
              className={`vd-gallery-cell ph ${variant}${im?.src ? " has-img" : ""}`}
              onClick={() => open(n)}
              aria-label={`Open photo ${n + 1}`}
            >
              {im?.src && (
                <img src={im.src} alt={im?.alt || label} loading="lazy" decoding="async" />
              )}
              <span className="ph-label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Lightbox — portal to body, only when mounted client-side */}
      {mounted && lightboxIdx !== null && (
        <Lightbox
          images={images}
          index={lightboxIdx}
          onClose={close}
          onPrev={prev}
          onNext={next}
          onGoTo={goTo}
        />
      )}
    </>
  );
}
