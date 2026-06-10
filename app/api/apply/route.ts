import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { listingApplicationsTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    listingType, businessName, businessType, contactName,
    phone, email, city, locality, website, message,
    details, amenities,
  } = body;

  if (!businessName || !businessType || !contactName || !phone || !email || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();

  const [app] = await db.insert(listingApplicationsTable).values({
    userId: user?.id ?? null,
    listingType: listingType ?? null,
    businessName,
    businessType,
    contactName,
    phone,
    email,
    city,
    locality: locality || "",
    website: website || null,
    message: message || null,
    details: details ?? null,
    amenities: amenities?.length ? amenities : null,
    status: "pending",
  }).returning({ id: listingApplicationsTable.id });

  sendApplicationEmails({ contactName, email, businessName, businessType, city }).catch(
    (e) => console.error("[apply] email failed:", e)
  );

  return NextResponse.json({ ok: true, id: app.id });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ?? "hello@venuees.in";
const FROM_EMAIL  = "Venuees.in <notifications@venuees.in>";

async function sendApplicationEmails({
  contactName, email, businessName, businessType, city,
}: { contactName: string; email: string; businessName: string; businessType: string; city: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = await import(/* webpackIgnore: true */ "resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: FROM_EMAIL,
    to:   ADMIN_EMAIL,
    subject: `New listing application — ${businessName} (${city})`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#C15A74">New listing application</h2>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="color:#999;padding:6px 12px 6px 0">Business</td><td>${businessName}</td></tr>
        <tr><td style="color:#999;padding:6px 12px 6px 0">Type</td><td>${businessType}</td></tr>
        <tr><td style="color:#999;padding:6px 12px 6px 0">Contact</td><td>${contactName}</td></tr>
        <tr><td style="color:#999;padding:6px 12px 6px 0">Email</td><td>${email}</td></tr>
        <tr><td style="color:#999;padding:6px 12px 6px 0">City</td><td>${city}</td></tr>
      </table>
      <p style="margin-top:24px">
        <a href="https://venuees.in/dashboard/applications" style="background:#C15A74;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px">Review in dashboard →</a>
      </p>
    </div>`,
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to:   email,
    subject: `We've received your listing application — Venuees.in`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#C15A74">Thank you, ${contactName.split(" ")[0]}!</h2>
      <p style="font-size:14px;color:#444;line-height:1.6">
        We've received your application to list <strong>${businessName}</strong> on Venuees.in.
        Our team reviews all applications within 48 hours and will contact you on the email and phone you provided.
      </p>
      <p style="font-size:14px;color:#444;">
        In the meantime, if you have any questions write to us at
        <a href="mailto:hello@venuees.in" style="color:#C15A74">hello@venuees.in</a>.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#999;">Venuees.in · Nagpur · hello@venuees.in</p>
    </div>`,
  });
}
