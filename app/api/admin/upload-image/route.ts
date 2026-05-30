import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const BUCKET = "site-assets";
const SUPABASE_URL = "https://ioweiikyputsdtgpjwdv.supabase.co";
const S3_ENDPOINT = "https://ioweiikyputsdtgpjwdv.storage.supabase.co/storage/v1/s3";
const REGION = "ap-southeast-1";

function getS3Client() {
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    forcePathStyle: true,
    region: REGION,
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s3 = getS3Client();
  if (!s3) return NextResponse.json({ error: "Storage credentials not configured" }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: path,
      Body: buffer,
      ContentType: file.type,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url: publicUrl });
}
