import { Router } from "express";
import { db } from "@workspace/db";
import { enquiriesTable, newsletterTable, listingApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/enquiries", async (req, res) => {
  try {
    const {
      kind, venueSlug, vendorSlug, getawaySlug, category,
      name, phone, email, eventDate, guestCount, message,
    } = req.body as Record<string, string>;

    const VALID_KINDS = ["venue_enquiry", "homepage_lead", "contact", "partner_apply", "getaway_enquiry", "vendor_enquiry"];
    if (!kind || !VALID_KINDS.includes(kind)) {
      res.status(400).json({ message: "Invalid or missing 'kind'" });
      return;
    }

    const [inserted] = await db.insert(enquiriesTable).values({
      kind,
      venueSlug: venueSlug ?? null,
      vendorSlug: vendorSlug ?? null,
      getawaySlug: getawaySlug ?? null,
      category: category ?? null,
      name: name ?? null,
      phone: phone ?? null,
      email: email ?? null,
      eventDate: eventDate ?? null,
      guestCount: guestCount ?? null,
      message: message ?? null,
      sourceUrl: req.headers.referer ?? null,
      status: "new",
    }).returning({ id: enquiriesTable.id });

    res.status(201).json({ ok: true, id: inserted.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit enquiry" });
  }
});

router.post("/newsletter", async (req, res) => {
  try {
    const { email, source } = req.body as { email: string; source?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Valid email required" });
      return;
    }
    const existing = await db.select().from(newsletterTable).where(eq(newsletterTable.email, email)).limit(1);
    if (existing.length) {
      res.status(200).json({ ok: true, message: "Already subscribed" });
      return;
    }
    await db.insert(newsletterTable).values({ email, source: source ?? "footer" });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

router.post("/listings/apply", async (req, res) => {
  try {
    const { businessName, businessType, category, contactName, phone, email, city, locality, website, message } =
      req.body as Record<string, string>;

    if (!businessName || !businessType || !contactName || !phone || !email || !city) {
      res.status(400).json({ message: "Required fields missing" });
      return;
    }

    const VALID_TYPES = ["venue", "vendor", "getaway"];
    if (!VALID_TYPES.includes(businessType)) {
      res.status(400).json({ message: "Invalid business type" });
      return;
    }

    const [inserted] = await db.insert(listingApplicationsTable).values({
      businessName,
      businessType,
      category: category ?? null,
      contactName,
      phone,
      email,
      city,
      locality: locality ?? "",
      website: website ?? null,
      message: message ?? null,
      status: "pending",
    }).returning({ id: listingApplicationsTable.id });

    res.status(201).json({ ok: true, id: inserted.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit application" });
  }
});

export default router;
