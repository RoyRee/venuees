"use client";
import { useState } from "react";
import type { SiteConfig, CONFIG_META } from "@/lib/site-config";

type MetaItem = { key: string; label: string; description: string };
type Meta = { sections: readonly MetaItem[]; features: readonly MetaItem[] };

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        flexShrink: 0,
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: checked ? "var(--brand)" : "var(--line)",
        position: "relative",
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function ConfigGroup({ title, items, config, onChange }: {
  title: string;
  items: readonly MetaItem[];
  config: SiteConfig;
  onChange: (key: string, val: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 4 }}>{title}</h2>
      <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={item.key} style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
            background: !(config as Record<string, boolean>)[item.key] ? "color-mix(in srgb, #ff4444 4%, transparent)" : undefined,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{item.description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: (config as Record<string, boolean>)[item.key] ? "var(--brand)" : "var(--ink-mute)", fontWeight: 500, minWidth: 40, textAlign: "right" }}>
                {(config as Record<string, boolean>)[item.key] ? "On" : "Off"}
              </span>
              <Toggle
                checked={(config as Record<string, boolean>)[item.key]}
                onChange={(v) => onChange(item.key, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConfigForm({ initialConfig, meta }: { initialConfig: SiteConfig; meta: Meta }) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function handleChange(key: string, val: boolean) {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const disabledCount = Object.values(config).filter((v) => !v).length;

  return (
    <div>
      {disabledCount > 0 && (
        <div style={{
          padding: "12px 16px",
          background: "color-mix(in srgb, #f59e0b 12%, transparent)",
          border: "1px solid color-mix(in srgb, #f59e0b 30%, transparent)",
          borderRadius: "var(--radius-sm)",
          fontSize: 13,
          color: "var(--ink)",
          marginBottom: 28,
        }}>
          <strong>{disabledCount} item{disabledCount !== 1 ? "s" : ""} currently disabled</strong> — visitors will see a "coming soon" message for disabled sections and hidden UI for disabled features.
        </div>
      )}

      <ConfigGroup title="Sections" items={meta.sections} config={config} onChange={handleChange} />
      <ConfigGroup title="Features" items={meta.features} config={config} onChange={handleChange} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-lg"
          style={{ minWidth: 140 }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>✓ Changes saved</span>
        )}
        {status === "error" && (
          <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>Failed to save — try again</span>
        )}
      </div>
    </div>
  );
}
