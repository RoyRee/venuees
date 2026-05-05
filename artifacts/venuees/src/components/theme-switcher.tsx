import { useState, useEffect } from "react";

type Theme = "ivory" | "sage" | "blush";

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: "ivory", color: "#FDFCF9", label: "Fresh Ivory" },
  { id: "sage", color: "#E6E7DB", label: "Sage Linen" },
  { id: "blush", color: "#F2E8E4", label: "Blush Marble" },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("ivory");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="theme-float">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={theme === t.id ? "active" : ""}
          style={{ background: t.color }}
          onClick={() => setTheme(t.id)}
          aria-label={t.label}
          title={t.label}
        />
      ))}
    </div>
  );
}
