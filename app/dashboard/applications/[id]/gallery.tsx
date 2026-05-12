"use client";
import { useState } from "react";

interface MediaItem {
  data: string;
  mimeType: string;
  fileName: string | null;
  type: string;
}

export function ApplicationGallery({ media }: { media: MediaItem[] }) {
  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0 && videos.length === 0) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", borderRadius: 12, color: "var(--ink-mute)", fontSize: 14 }}>
        No photos uploaded
      </div>
    );
  }

  const allItems = [...images, ...videos];
  const current = allItems[selected];

  return (
    <div>
      {/* Main display */}
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9", cursor: current?.type === "image" ? "zoom-in" : "default", marginBottom: 10 }}
        onClick={() => current?.type === "image" && setLightbox(true)}>
        {current?.type === "image" ? (
          <img
            src={`data:${current.mimeType};base64,${current.data}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <video
            key={current?.data?.slice(0, 40)}
            controls
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          >
            <source src={`data:${current?.mimeType};base64,${current?.data}`} type={current?.mimeType} />
          </video>
        )}

        {/* Nav arrows */}
        {allItems.length > 1 && selected > 0 && (
          <button onClick={(e) => { e.stopPropagation(); setSelected((s) => s - 1); }}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        )}
        {allItems.length > 1 && selected < allItems.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); setSelected((s) => s + 1); }}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        )}

        {/* Counter badge */}
        <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, padding: "3px 8px", borderRadius: 12 }}>
          {selected + 1} / {allItems.length}
        </div>
        {current?.type === "image" && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "3px 8px", borderRadius: 8 }}>tap to enlarge</div>
        )}
      </div>

      {/* Thumbnails */}
      {allItems.length > 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {allItems.map((m, i) => (
            <button key={i} type="button" onClick={() => setSelected(i)}
              style={{ flexShrink: 0, width: 64, height: 48, borderRadius: 6, overflow: "hidden", border: `2px solid ${i === selected ? "var(--brand)" : "transparent"}`, cursor: "pointer", background: "#000", padding: 0, position: "relative" }}>
              {m.type === "image" ? (
                <img src={`data:${m.mimeType};base64,${m.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && current?.type === "image" && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img
            src={`data:${current.mimeType};base64,${current.data}`}
            alt=""
            style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: 8 }}
          />
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
          {selected > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected((s) => s - 1); }}
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", fontSize: 22 }}>‹</button>
          )}
          {selected < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected((s) => s + 1); }}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", fontSize: 22 }}>›</button>
          )}
        </div>
      )}
    </div>
  );
}
