import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Proxies a Google Places photo so the API key never reaches the browser.
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(ref)}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
