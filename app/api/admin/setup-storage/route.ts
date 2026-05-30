import { NextResponse } from "next/server";
import { getServerSupabase, getAdminSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

const BUCKET = "site-assets";

export async function POST() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });

  const results: Record<string, unknown> = {};

  // 1. Create bucket (no-op if exists)
  const create = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  });
  results.create = create.error ? create.error.message : "ok";

  // 2. Force-update to public (fixes pre-existing private bucket)
  const update = await admin.storage.updateBucket(BUCKET, { public: true });
  results.update = update.error ? update.error.message : "ok";

  // 3. Verify bucket is now public
  const { data: bucket, error: getErr } = await admin.storage.getBucket(BUCKET);
  results.bucket_public = bucket?.public ?? false;
  results.get_error = getErr?.message ?? null;

  return NextResponse.json({ ok: !getErr, results });
}
