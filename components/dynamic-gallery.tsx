"use client";

import { useState, useCallback, useEffect } from "react";
import { I } from "@/components/icons";
import { Photo } from "@/components/photo";
import { Lightbox, type GalleryImage } from "@/components/venue-gallery";

type DynamicGalleryProps = {
  images: GalleryImage[];
  gridStyle?: React.CSSProperties;
  className?: string;
  totalPhotos?: number;
};

export function DynamicGallery({ images, gridStyle, className = "vd-gallery", totalPhotos }: DynamicGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length)), [images.length]);
  const goTo = useCallback((i: number) => setLightboxIdx(i), []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = totalPhotos || images.length;

  return (
    <>
      <div className={`${className} grid-${Math.min(images.length, 5)}`} style={gridStyle}>
        {images.slice(0, 5).map((img, i) => (
          <div key={i} onClick={() => open(i)} style={{ cursor: "pointer", height: "100%" }}>
            <Photo src={img.src} alt={img.alt} variant={img.variant || "v2"} label={img.label} style={{ height: "100%" }}>
              {i === 0 && (
                <button className="vd-gallery-all" onClick={(e) => { e.stopPropagation(); open(0); }}>
                  <I.Camera width={14} height={14} /> {total > 5 ? `All ${total} photos` : "View all photos"}
                </button>
              )}
            </Photo>
          </div>
        ))}
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
