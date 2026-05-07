"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(urlError === "auth_failed" ? "Authentication failed. Please try again." : "");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Auth is not configured. Add Supabase env vars.");
      return;
    }

    startTransition(async () => {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        router.push(redirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) { setError(error.message); return; }
        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      }
    });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
      {/* Top bar */}
      <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", textDecoration: "none" }}>
          Venuees.in
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 8 }}>
              {mode === "login" ? "Welcome back." : "Create an account."}
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
              {mode === "login"
                ? "Sign in to manage your listings and enquiries."
                : "List your venue or service on Venuees.in."}
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none",
                  background: mode === m ? "var(--ink)" : "transparent",
                  color: mode === m ? "#fff" : "var(--ink-soft)",
                  transition: "all 0.15s",
                }}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--ink)", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                required
                minLength={6}
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--ink)", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#c00" }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "10px 14px", background: "#f0fff4", border: "1px solid #9f9", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#060" }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 4, opacity: isPending ? 0.7 : 1 }}
            >
              {isPending
                ? (mode === "login" ? "Signing in…" : "Creating account…")
                : (mode === "login" ? "Sign in" : "Create account")}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setError("Enter your email first."); return; }
                  const supabase = getBrowserSupabase();
                  if (!supabase) return;
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                  });
                  if (error) setError(error.message);
                  else setSuccess("Password reset email sent. Check your inbox.");
                }}
                style={{ fontSize: 13, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                Forgot password?
              </button>
            )}
          </form>

          <p style={{ marginTop: 28, fontSize: 13, color: "var(--ink-mute)", textAlign: "center" }}>
            By signing up you agree to our{" "}
            <Link href="/about" style={{ color: "var(--brand)" }}>terms</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
