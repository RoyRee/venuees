import * as React from "react";

type P = React.SVGProps<SVGSVGElement>;
const sw = { strokeWidth: 1.6 as number };

export const I = {
  Search: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  Pin: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  Cal: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>,
  Users: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 11a3 3 0 1 0 0-6M22 20c0-2.8-2-5-5-6" /></svg>,
  Heart: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 10c0 5.5-7 10-7 10Z" /></svg>,
  Star: (p: P) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" /></svg>,
  Arrow: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M5 12h14M13 5l7 7-7 7" /></svg>,
  ArrowL: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M19 12H5M11 5l-7 7 7 7" /></svg>,
  Check: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}><path d="m5 12 4 4 10-10" /></svg>,
  Plus: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  Menu: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  Home: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9Z" /></svg>,
  Camera: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  Play: (p: P) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 5v14l12-7L7 5Z" /></svg>,
  Sparkle: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" /></svg>,
  Flame: (p: P) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1 .5-2 1-2.5C10 10 8 12 8 15a4 4 0 1 0 8 0c0-3-2-5-3-7-1-2 0-4-1-6Z" /></svg>,
  Bed: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 14h18M7 11h4" /></svg>,
  Pool: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M2 17c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M2 20c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M8 13V5a2 2 0 0 1 4 0v8M16 13V5a2 2 0 0 1 4 0v8" /></svg>,
  Leaf: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M5 19c10-1 15-6 15-15C11 4 4 9 5 19ZM5 19c2-6 6-9 10-11" /></svg>,
  Phone: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M6 3h3l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v3a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2Z" /></svg>,
  Share: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m9 11 6-4M9 13l6 4" /></svg>,
  X: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="m6 6 12 12M18 6 6 18" /></svg>,
  Car: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M5 16h14l-1.5-6a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5L5 16ZM5 16v3h3v-3M19 16v3h-3v-3" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></svg>,
  Wifi: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M2 9a15 15 0 0 1 20 0M5 13a10 10 0 0 1 14 0M8.5 17a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>,
  AC: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><rect x="3" y="5" width="18" height="8" rx="2" /><path d="M7 17v3M12 17v3M17 17v3" /></svg>,
  Music: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M9 18V5l10-2v13" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></svg>,
  Utensils: (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...sw} {...p}><path d="M7 3v7a2 2 0 1 0 4 0V3M9 10v11M17 3c-2 0-3 2-3 5s1 5 3 5v8" /></svg>,
};

export const Ornament = ({ children = "BROWSE" }: { children?: React.ReactNode }) => (
  <div className="ornament">
    <div className="line" />
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="4" r="1.5" opacity="0.6" />
      <circle cx="12" cy="20" r="1.5" opacity="0.6" />
      <circle cx="4" cy="12" r="1.5" opacity="0.6" />
      <circle cx="20" cy="12" r="1.5" opacity="0.6" />
    </svg>
    <span className="om-word">{children}</span>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="4" r="1.5" opacity="0.6" />
      <circle cx="12" cy="20" r="1.5" opacity="0.6" />
      <circle cx="4" cy="12" r="1.5" opacity="0.6" />
      <circle cx="20" cy="12" r="1.5" opacity="0.6" />
    </svg>
    <div className="line" />
  </div>
);

export const Stars = ({ value = 4.5, size = 14 }: { value?: number; size?: number }) => (
  <span style={{ display: "inline-flex", gap: 2, color: "var(--accent)" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <I.Star key={i} width={size} height={size} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }} />
    ))}
  </span>
);
