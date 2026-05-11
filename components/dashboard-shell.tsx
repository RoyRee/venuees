"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { I } from "./icons";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  { href: "/dashboard",           label: "Overview",    icon: (p: React.SVGProps<SVGSVGElement>) => <I.Home {...p} /> },
  { href: "/dashboard/listings",  label: "My listings", icon: (p: React.SVGProps<SVGSVGElement>) => <I.Pin {...p} /> },
  { href: "/dashboard/enquiries", label: "Enquiries",   icon: (p: React.SVGProps<SVGSVGElement>) => <I.Cal {...p} /> },
  { href: "/dashboard/profile",   label: "Profile",     icon: (p: React.SVGProps<SVGSVGElement>) => <I.Users {...p} /> },
];

export function DashboardShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", textDecoration: "none" }}>
          Venuees.in
        </Link>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>Vendor portal</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: "var(--radius-sm)",
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                color: active ? "var(--brand)" : "var(--ink-soft)",
                background: active ? "var(--surface)" : "transparent",
              }}
            >
              <Icon width={16} height={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </div>
        <SignOutButton />
      </div>
    </div>
  );

  return (
    <div className="dash-shell">
      {/* Desktop sidebar */}
      <aside className="dash-sidebar">{sidebar}</aside>

      {/* Mobile sidebar overlay */}
      {open && <div className="dash-overlay" onClick={() => setOpen(false)} />}
      <aside className={`dash-sidebar-mobile${open ? " open" : ""}`}>{sidebar}</aside>

      <div className="dash-main">
        {/* Mobile header */}
        <header className="dash-mobile-header">
          <button onClick={() => setOpen(true)} aria-label="Menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--ink)" }}>
            <I.Menu width={22} height={22} />
          </button>
          <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", textDecoration: "none" }}>
            Venuees.in
          </Link>
          <div style={{ width: 30 }} />
        </header>

        <main className="dash-content">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="dash-bottom-nav">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, fontSize: 10, padding: "8px 4px", textDecoration: "none",
                color: active ? "var(--brand)" : "var(--ink-mute)",
              }}
            >
              <Icon width={20} height={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
