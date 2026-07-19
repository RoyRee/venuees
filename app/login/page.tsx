"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

// useSearchParams() must be inside a Suspense boundary
function LoginForm() {
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
        // Claim any unclaimed listing applications matching this email
        fetch("/api/apply/claim", { method: "POST" }).catch(() => {});
        router.push(redirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
          },
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

          {/* Social login */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => {
                const supabase = getBrowserSupabase();
                if (!supabase) { setError("Auth is not configured."); return; }
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
                });
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "10px 14px", fontSize: 14, fontWeight: 500, border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
