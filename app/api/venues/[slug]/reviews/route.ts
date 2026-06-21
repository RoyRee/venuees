import { NextRequest, NextResponse } from "next/server";
import { db, venuesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to write a review." }, { status: 401 });
    }

    const { slug } = await params;

    const { rating, text } = await request.json();
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 });
    }

    // Fetch the venue by slug
    const [venue] = await db.select().from(venuesTable).where(eq(venuesTable.slug, slug));
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const currentMeta = (venue.meta ?? {}) as Record<string, any>;
    const currentReviews = Array.isArray(currentMeta.reviewItems) ? currentMeta.reviewItems : [];

    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    const newReview = {
      name: name.trim(),
      text: text.trim(),
      rating: numRating,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    const updatedReviews = [newReview, ...currentReviews];

    // Compute new ratings and review counts
    const totalRating = updatedReviews.reduce((sum, r: any) => sum + (r.rating ?? 5), 0);
    const newAverageRating = (totalRating / updatedReviews.length).toFixed(1);
    const newReviewsCount = updatedReviews.length;

    // Update venue
    await db.update(venuesTable).set({
      rating: newAverageRating,
      reviews: newReviewsCount,
      meta: {
        ...currentMeta,
        reviewItems: updatedReviews,
      },
    }).where(eq(venuesTable.id, venue.id));

    return NextResponse.json({
      ok: true,
      rating: newAverageRating,
      reviews: newReviewsCount,
      newReview,
    });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
