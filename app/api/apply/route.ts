import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { listingApplicationsTable } from "@/lib/db/schema";
import { getUserRole } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    listingType, businessName, businessType, contactName,
    phone, email, city, locality, website, message,
    details, amenities,
    // Admin-submitted fields
    adminSubmit, ownerEmail,
  } = body;

  if (!businessName || !businessType || !contactName || !phone || !email || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();

  // Check if this is an admin submission
  let isAdminSubmission = false;
  if (adminSubmit && user?.email) {
    const role = await getUserRole(user.id, user.email);
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!ownerEmail) {
      return NextResponse.json({ error: "Owner email is required for admin submissions" }, { status: 400 });
    }
    isAdminSubmission = true;
  }

  // For admin submissions: don't set userId (owner will claim it on signup)
  // Store ownerEmail in details so we can match later
  const finalDetails = isAdminSubmission
    ? { ...(details ?? {}), _ownerEmail: ownerEmail, _submittedByAdmin: user?.email }
    : (details ?? null);

  const [app] = await db.insert(listingApplicationsTable).values({
    userId: isAdminSubmission ? null : (user?.id ?? null),
    listingType: listingType ?? null,
    businessName,
    businessType,
    contactName,
    phone,
    email: isAdminSubmission ? ownerEmail : email,
    city,
    locality: locality || "",
    website: website || null,
    message: message || null,
    details: finalDetails,
    amenities: amenities?.length ? amenities : null,
    status: "pending",
  }).returning({ id: listingApplicationsTable.id });

  if (isAdminSubmission) {
    // Send onboarding email to venue owner
    sendOwnerOnboardingEmail({ ownerEmail, contactName, businessName, city }).catch(
      (e) => console.error("[apply] owner onboarding email failed:", e)
    );
  } else {
    // Regular flow: notify admin + send confirmation to applicant
    sendApplicationEmails({ contactName, email, businessName, businessType, city }).catch(
      (e) => console.error("[apply] email failed:", e)
    );
  }

  return NextResponse.json({ ok: true, id: app.id });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ?? "hello@venuees.in";
const FROM_EMAIL  = "Venuees.in <notifications@venuees.in>";

// ── Email sent to the venue owner when admin lists on their behalf ──────────
async function sendOwnerOnboardingEmail({
  ownerEmail, contactName, businessName, city,
}: { ownerEmail: string; contactName: string; businessName: string; city: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = await import(/* webpackIgnore: true */ "resend");
  const resend = new Resend(apiKey);

  const signupUrl = `https://venuees.in/login?redirect=/dashboard`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to:   ownerEmail,
    subject: `Your venue "${businessName}" is now on Venuees.in! 🎉`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-family:serif;font-size:24px;color:#C15A74;margin-bottom:4px">Venuees.in</div>
        <div style="font-size:12px;color:#999;letter-spacing:0.1em">NAGPUR'S VENUE PLATFORM</div>
      </div>
      <h2 style="color:#C15A74;margin-bottom:12px">Hello${contactName ? `, ${contactName.split(" ")[0]}` : ""}!</h2>
      <p style="font-size:15px;color:#333;line-height:1.7">
        Great news — <strong>${businessName}</strong> in <strong>${city}</strong> has been listed on <strong>Venuees.in</strong>!
      </p>
      <p style="font-size:14px;color:#444;line-height:1.6">
        Couples across ${city} can now discover your venue, check availability, and send enquiries directly to you — with zero commission on bookings.
      </p>
      <div style="background:#f8f5f0;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          <strong>Sign up to manage your listing</strong> — update photos, pricing, block dates, and respond to enquiries.
        </p>
        <a href="${signupUrl}" style="display:inline-block;background:#C15A74;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          Create your account →
        </a>
        <p style="font-size:12px;color:#999;margin-top:12px">
          Use this email (<strong>${ownerEmail}</strong>) to sign up so your listing is automatically linked to your account.
        </p>
      </div>
      <p style="font-size:14px;color:#444;">
        Questions? Reply to this email or write to
        <a href="mailto:hello@venuees.in" style="color:#C15A74">hello@venuees.in</a>.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#999;">Venuees.in · Nagpur · hello@venuees.in</p>
    </div>`,
  });
}

// ── Regular application emails (self-submitted) ────────────────────────────
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
