import * as React from "react";

// <Photo> — wraps the existing .ph placeholder pattern.
//
// If `src` is provided, it renders the real image on top of the striped
// gradient (gradient shows while the image loads). Without `src`, behaves
// exactly like the original .ph block.
type Props = {
  src?: string;
  alt?: string;
  variant?: string; // e.g. "garden" | "v2" | "dusk" — the fallback stripe theme
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Photo({ src, alt = "", variant = "v2", label, className = "", style, children }: Props) {
  const classes = `ph ${variant} ${src ? "has-img" : ""} ${className}`.trim();
  return (
    <div className={classes} style={style}>
      {src && (
        // Using <img> instead of next/image because:
        //  - These are mostly backgrounds inside positioned containers (object-fit handles sizing)
        //  - Many land on off-screen cards where next/image's LCP heuristics aren't meaningful
        //  - Keeps the component a drop-in replacement for the existing .ph block
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      )}
      {label && <span className="ph-label">{label}</span>}
      {children}
    </div>
  );
}
