"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { I } from "./icons";

const LINKS = [
  { n: "Venues", href: "/venues" },
  { n: "Vendors", href: "/vendors" },
  { n: "Getaways", href: "/weekend-getaways" },
  { n: "Destination", href: "/destination-weddings" },
  { n: "Events", href: "/event-management" },
  { n: "Real Weddings", href: "/real-weddings" },
  { n: "Journal", href: "/blog" },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="site-nav">
      <Link href="/" className="logo">
        <span className="mark">V</span>
        <span>
          <span>v<em>enuee</em>s</span>
          <small>weddings · Nagpur</small>
        </span>
      </Link>
      <ul>
        {LINKS.map((x) => {
          const active = pathname === x.href || (x.href !== "/" && pathname.startsWith(x.href));
          return (
            <li key={x.n}>
              <Link href={x.href} className={active ? "active" : ""}>{x.n}</Link>
            </li>
          );
        })}
      </ul>
      <div className="nav-right">
        <span className="city"><I.Pin width={13} height={13} /> Nagpur</span>
        <a style={{ color: "var(--ink-soft)", cursor: "pointer" }}>Login</a>
        <Link href="/contact" className="btn btn-primary btn-sm">Enquire</Link>
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <nav className="mobile-nav">
        <Link href="/" className="logo">
          v<em>enuee</em>s
        </Link>
        <div className="mobile-icons">
          <button aria-label="Search"><I.Search width={20} height={20} /></button>
          <button aria-label="Saved"><I.Heart width={20} height={20} /></button>
          <button aria-label="Menu" onClick={() => setOpen(true)}><I.Menu width={22} height={22} /></button>
        </div>
      </nav>
      {open && (
        <div className="mob-drawer">
          <div className="mob-drawer-top">
            <Link href="/" className="logo" onClick={() => setOpen(false)} style={{ fontFamily: "var(--font-serif)", fontSize: 24 }}>
              v<em>enuee</em>s
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close"><I.X width={26} height={26} /></button>
          </div>
          <nav>
            <ul>
              {LINKS.map((l) => (
                <li key={l.n}>
                  <Link href={l.href} onClick={() => setOpen(false)}>
                    {l.n} <I.Arrow width={14} height={14} />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/about" onClick={() => setOpen(false)}>About us <I.Arrow width={14} height={14} /></Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setOpen(false)}>Contact <I.Arrow width={14} height={14} /></Link>
              </li>
            </ul>
          </nav>
          <div style={{ marginTop: "auto", paddingTop: 30 }}>
            <Link href="/contact" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Enquire now</Link>
            <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 14, textAlign: "center" }}>
              +91 712 555 0180 · Nagpur
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileTabbar({ active = "Home" }: { active?: string }) {
  const items = [
    { k: "Home", href: "/", icon: <I.Home /> },
    { k: "Venues", href: "/venues", icon: <I.Pin /> },
    { k: "Search", href: "/venues", icon: <I.Search /> },
    { k: "Saved", href: "/", icon: <I.Heart /> },
    { k: "Me", href: "/", icon: <I.Users /> },
  ];
  return (
    <div className="mobile-tabbar">
      {items.map((it) => (
        <Link key={it.k} href={it.href} className={active === it.k ? "active" : ""} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, color: active === it.k ? "var(--brand)" : "var(--ink-mute)", padding: "6px 2px" }}>
          {it.icon}
          <span>{it.k}</span>
        </Link>
      ))}
    </div>
  );
}
