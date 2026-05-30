import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getAdminSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

const BUCKET = "site-assets";

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

  // Ensure bucket exists (idempotent — ignore "already exists" error)
  await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  }).catch(() => {});

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { data, error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl });
}
