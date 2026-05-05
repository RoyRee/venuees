import * as React from "react";

type Props = {
  src?: string;
  alt?: string;
  variant?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Photo({ src, alt = "", variant = "v2", label, className = "", style, children }: Props) {
  const classes = `ph ${variant} ${src ? "has-img" : ""} ${className}`.trim();
  return (
    <div className={classes} style={style}>
      {src && <img src={src} alt={alt} loading="lazy" decoding="async" />}
      {label && <span className="ph-label">{label}</span>}
      {children}
    </div>
  );
}
