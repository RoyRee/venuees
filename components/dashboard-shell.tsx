"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { I } from "./icons";
import { SignOutButton } from "./sign-out-button";
import type { UserRole } from "@/lib/auth/role";

type NavItem = { href: string; label: string; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement };

function navForRole(role: UserRole): NavItem[] {
  if (role === "admin") return [
    { href: "/dashboard",              label: "Overview",      icon: (p) => <I.Home {...p} /> },
    { href: "/dashboard/applications", label: "Applications",  icon: (p) => <I.Check {...p} /> },
    { href: "/dashboard/enquiries",    label: "All Enquiries", icon: (p) => <I.Cal {...p} /> },
    { href: "/dashboard/listings",     label: "Listings",      icon: (p) => <I.Pin {...p} /> },
    { href: "/dashboard/site-config",  label: "Site Settings", icon: (p) => <I.SlidersH {...p} /> },
    { href: "/dashboard/cities",       label: "Cities",        icon: (p) => <I.Pin {...p} /> },
    { href: "/dashboard/profile",      label: "Profile",       icon: (p) => <I.Users {...p} /> },
  ];
  if (role === "vendor") return [
    { href: "/dashboard",             label: "Overview",   icon: (p) => <I.Home {...p} /> },
    { href: "/dashboard/listings",    label: "My listing", icon: (p) => <I.Pin {...p} /> },
    { href: "/dashboard/enquiries",   label: "Enquiries",  icon: (p) => <I.Cal {...p} /> },
    { href: "/dashboard/profile",     label: "Profile",    icon: (p) => <I.Users {...p} /> },
  ];
  return [
    { href: "/dashboard",           label: "Overview",  icon: (p) => <I.Home {...p} /> },
    { href: "/dashboard/saved",     label: "Saved",     icon: (p) => <I.Heart {...p} /> },
    { href: "/dashboard/enquiries", label: "Enquiries", icon: (p) => <I.Cal {...p} /> },
    { href: "/dashboard/profile",   label: "Profile",   icon: (p) => <I.Users {...p} /> },
  ];
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  vendor: "Vendor portal",
  customer: "My account",
};

export function DashboardShell({
  children,
  name,
  email,
  role,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
  role: UserRole;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = navForRole(role);

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "0 24px 20px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink)", textDecoration: "none" }}>
          Venuees.in
        </Link>
        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {ROLE_LABEL[role]}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ href, label, icon: Icon }) => {
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
                background: active ? "color-mix(in srgb, var(--brand) 8%, transparent)" : "transparent",
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

  const mobileNav = nav.slice(0, 4);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">{sidebar}</aside>

      {open && <div className="dash-overlay" onClick={() => setOpen(false)} />}
      <aside className={`dash-sidebar-mobile${open ? " open" : ""}`}>{sidebar}</aside>

      <div className="dash-main">
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

      <nav className="dash-bottom-nav">
        {mobileNav.map(({ href, label, icon: Icon }) => {
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
