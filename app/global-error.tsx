"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: "40px 24px", maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
          {error?.message ?? "Unknown error"}
        </p>
        {error?.digest && (
          <p style={{ fontSize: 12, color: "#999" }}>Digest: {error.digest}</p>
        )}
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "8px 20px", fontSize: 14 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
