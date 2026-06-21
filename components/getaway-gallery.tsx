"use client";

import { useState, useCallback, useEffect } from "react";
import { Photo } from "@/components/photo";
import { Lightbox, type GalleryImage } from "@/components/venue-gallery";

type GetawayGalleryProps = {
  images: GalleryImage[];
};

export function GetawayGallery({ images }: GetawayGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length)), [images.length]);
  const goTo = useCallback((i: number) => setLightboxIdx(i), []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = Math.min(images.length, 3);

  return (
    <>
      <div className={`gd-hero-grid grid-${count}`}>
        {count === 3 ? (
          <>
            <div onClick={() => open(0)} style={{ cursor: "pointer" }}>
              <Photo src={images[0].src} variant={images[0].variant || "v2"} label={images[0].label} style={{ height: "100%" }} />
            </div>
            <div>
              <div onClick={() => open(1)} style={{ cursor: "pointer", height: "100%" }}>
                <Photo src={images[1].src} variant={images[1].variant || "v5"} label={images[1].label} style={{ height: "100%" }} />
              </div>
              <div onClick={() => open(2)} style={{ cursor: "pointer", height: "100%" }}>
                <Photo src={images[2].src} variant={images[2].variant || "ocean"} label={images[2].label} style={{ height: "100%" }} />
              </div>
            </div>
          </>
        ) : (
          images.slice(0, count).map((img, i) => (
            <div key={i} onClick={() => open(i)} style={{ cursor: "pointer", height: "100%" }}>
              <Photo src={img.src} variant={img.variant || "v2"} label={img.label} style={{ height: "100%" }} />
            </div>
          ))
        )}
      </div>

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
