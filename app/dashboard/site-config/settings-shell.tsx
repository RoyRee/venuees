"use client";
import { useState } from "react";
import type { SiteConfig, SiteContent } from "@/lib/site-config";
import { ConfigForm } from "./config-form";
import { ContentForm } from "./content-form";

type Meta = { sections: readonly { key: string; label: string; description: string }[]; features: readonly { key: string; label: string; description: string }[] };

type Props = {
  initialConfig: SiteConfig;
  initialContent: SiteContent;
  meta: Meta;
};

export function SettingsShell({ initialConfig, initialContent, meta }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function handleSaveAll() {
    setSaving(true);
    setStatus("idle");
    try {
      // Build combined payload: toggles + content fields together
      const payload = {
        // boolean toggles
        ...config,
        // content fields (serialised as the API expects)
        hero_images:                JSON.stringify(
          Array.isArray(content.hero_images) ? content.hero_images : []
        ),
        hero_carousel_interval:     content.hero_carousel_interval ?? 5000,
        hero_stats:                 JSON.stringify(content.hero_stats ?? []),
        flagship_carousel_interval: content.flagship_carousel_interval ?? 6000,
      };

      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Feature-flag toggles — no own save button */}
      <ConfigForm
        initialConfig={config}
        meta={meta}
        onConfigChange={setConfig}
      />

      {/* Homepage content — no own save button */}
      <ContentForm
        initialContent={content}
        onContentChange={setContent}
      />

      {/* ── Single unified save button ── */}
      <div style={{
        position: "sticky",
        bottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginTop: 32,
        padding: "16px 20px",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        zIndex: 10,
      }}>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="btn btn-primary btn-lg"
          style={{ minWidth: 180 }}
        >
          {saving ? "Saving all settings…" : "💾  Save all settings"}
        </button>

        {status === "saved" && (
          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>
            ✓ All settings saved — changes are live
          </span>
        )}
        {status === "error" && (
          <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
            ✗ Failed to save — please try again
          </span>
        )}
      </div>
    </div>
  );
}
