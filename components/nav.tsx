"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { I } from "./icons";
import { NavUserButton } from "./nav-user-button";
import { getBrowserSupabase } from "@/lib/supabase/client";

const LINKS = [
  { n: "Venues", href: "/venues" },
  { n: "Vendors", href: "/vendors" },
  { n: "Getaways", href: "/weekend-getaways" },
  { n: "Destination", href: "/destination-weddings" },
  { n: "Events", href: "/event-management" },
  { n: "Real Weddings", href: "/real-weddings" },
  { n: "Journal", href: "/blog" },
];

// ── Auth-aware saved redirect ────────────────────────────────────────────────
async function goToSaved(router: ReturnType<typeof useRouter>) {
  const supabase = getBrowserSupabase();
  if (!supabase) { router.push("/login?redirect=/dashboard/saved"); return; }
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    router.push("/dashboard/saved");
  } else {
    router.push("/login?redirect=/dashboard/saved");
  }
}

// ── Search overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) {
      router.push(`/venues?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/venues");
    }
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div className="search-backdrop" onClick={onClose} />
      {/* Overlay panel */}
      <div className="search-overlay">
        <form onSubmit={handleSubmit} className="search-overlay-inner">
          <I.Search width={18} height={18} style={{ color: "var(--ink-soft)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search venues, localities, types…"
            className="search-overlay-input"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear" className="search-clear">
              <I.X width={16} height={16} />
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            Search
          </button>
        </form>
        <div className="search-hints">
          <span onClick={() => { router.push("/venues?q=resort"); onClose(); }}>Resorts</span>
          <span onClick={() => { router.push("/venues?q=lawn"); onClose(); }}>Lawns</span>
          <span onClick={() => { router.push("/venues?q=wardha"); onClose(); }}>Wardha Road</span>
          <span onClick={() => { router.push("/venues?q=civil"); onClose(); }}>Civil Lines</span>
          <span onClick={() => { router.push("/venues?q=hotel"); onClose(); }}>Hotels</span>
        </div>
      </div>
    </>
  );
}

// ── Desktop / top nav ────────────────────────────────────────────────────────
export function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
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
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex", alignItems: "center" }}
          >
            <I.Search width={18} height={18} />
          </button>
          <span className="city"><I.Pin width={13} height={13} /> Nagpur</span>
          <NavUserButton />
          <Link href="/contact" className="btn btn-primary btn-sm">Enquire</Link>
        </div>
      </nav>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

// ── Mobile nav ───────────────────────────────────────────────────────────────
export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <nav className="mobile-nav">
        <Link href="/" className="logo">
          v<em>enuee</em>s
        </Link>
        <div className="mobile-icons">
          <button aria-label="Search" onClick={() => setSearchOpen(true)}><I.Search width={20} height={20} /></button>
          <button aria-label="Saved" onClick={() => goToSaved(router)}><I.Heart width={20} height={20} /></button>
          <button aria-label="Menu" onClick={() => setOpen(true)}><I.Menu width={22} height={22} /></button>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

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
              <li>
                <Link href="/dashboard" onClick={() => setOpen(false)}>My account <I.Arrow width={14} height={14} /></Link>
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

// ── Mobile tabbar ────────────────────────────────────────────────────────────
export function MobileTabbar({ active = "Home" }: { active?: string }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = React.useState(false);

  function TabItem({ k, icon, onClick, href }: { k: string; icon: React.ReactNode; onClick?: () => void; href?: string }) {
    const isActive = active === k;
    const style: React.CSSProperties = {
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2, fontSize: 10,
      color: isActive ? "var(--brand)" : "var(--ink-mute)",
      padding: "6px 2px", background: "none", border: "none", cursor: "pointer",
      textDecoration: "none", flex: 1,
    };
    if (href && !onClick) {
      return <Link href={href} style={style}>{icon}<span>{k}</span></Link>;
    }
    return <button onClick={onClick} style={style}>{icon}<span>{k}</span></button>;
  }

  return (
    <>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <div className="mobile-tabbar">
        <TabItem k="Home"   href="/"        icon={<I.Home />} />
        <TabItem k="Venues" href="/venues"  icon={<I.Pin />} />
        <TabItem k="Search" icon={<I.Search />} onClick={() => setSearchOpen(true)} />
        <TabItem k="Saved"  icon={<I.Heart />}  onClick={() => goToSaved(router)} />
        <TabItem k="Me"     href="/dashboard"   icon={<I.Users />} />
      </div>
    </>
  );
}
