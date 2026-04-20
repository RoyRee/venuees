"use client";
import * as React from "react";

type ThemeKey = "ivory" | "sage" | "blush";

const THEMES: { k: ThemeKey; label: string; swatch: string[] }[] = [
  { k: "ivory", label: "Fresh Ivory", swatch: ["#FDFCF9", "#C15A74", "#3F6B54"] },
  { k: "sage", label: "Sage Linen", swatch: ["#F2F1EA", "#A64663", "#3D5A3A"] },
  { k: "blush", label: "Blush Marble", swatch: ["#FAF5F3", "#C45A75", "#1A1618"] },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = React.useState<ThemeKey>("ivory");

  React.useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("venuees-theme")) as ThemeKey | null;
    if (stored && ["ivory", "sage", "blush"].includes(stored)) {
      setTheme(stored);
      document.body.setAttribute("data-theme", stored);
    } else {
      document.body.setAttribute("data-theme", "ivory");
    }
  }, []);

  const pick = (k: ThemeKey) => {
    setTheme(k);
    document.body.setAttribute("data-theme", k);
    localStorage.setItem("venuees-theme", k);
  };

  return (
    <div className="theme-float" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.k}
          aria-label={t.label}
          title={t.label}
          className={theme === t.k ? "active" : ""}
          onClick={() => pick(t.k)}
          style={{
            background: `linear-gradient(135deg, ${t.swatch[0]} 0%, ${t.swatch[0]} 40%, ${t.swatch[1]} 40%, ${t.swatch[1]} 75%, ${t.swatch[2]} 75%)`,
          }}
        />
      ))}
    </div>
  );
}
