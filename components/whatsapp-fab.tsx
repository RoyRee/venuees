"use client";

import { useState } from "react";

interface Props {
  phone: string;
  venueSlug?: string;
  prefillText?: string;
}

export function WhatsAppFAB({ phone, venueSlug, prefillText }: Props) {
  const [open, setOpen] = useState(false);
  const [userPhone, setUserPhone] = useState("");

  function logAndOpen(capturedPhone?: string) {
    navigator.sendBeacon?.(
      "/api/leads/whatsapp",
      new Blob(
        [JSON.stringify({ venueSlug, page: window.location.pathname, phone: capturedPhone ?? null })],
        { type: "application/json" }
      )
    );
    const text = prefillText ?? "Hi! I found your listing on Venuees.in and would like to know more.";
    window.open(
      `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
    setUserPhone("");
  }

  return (
    <>
      {/* Bottom-sheet */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 901, background: "rgba(0,0,0,0.35)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "16px 16px 0 0",
              padding: "24px 20px 32px", zIndex: 902,
              boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WhatsAppIcon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>Chat on WhatsApp</div>
                <div style={{ fontSize: 13, color: "#888" }}>We'll reply within minutes</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                Your WhatsApp number <span style={{ fontWeight: 400, color: "#bbb" }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: "100%", padding: "10px 14px", fontSize: 15, border: "1px solid #e0e0e0", borderRadius: 10, boxSizing: "border-box", outline: "none" }}
                autoFocus
              />
            </div>

            <button
              onClick={() => logAndOpen(userPhone.trim() || undefined)}
              style={{ width: "100%", padding: "13px 0", background: "#25D366", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <WhatsAppIcon size={18} /> Open WhatsApp
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ width: "100%", marginTop: 10, padding: "10px 0", background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed", bottom: 88, right: 20,
          width: 52, height: 52, borderRadius: "50%",
          background: "#25D366", color: "#fff", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)", zIndex: 900,
        }}
      >
        <WhatsAppIcon size={26} />
      </button>
    </>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
