import { Router } from "express";
import { db } from "@workspace/db";
import { vendorsTable, vendorImagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/vendors", async (req, res) => {
  try {
    const { category, city } = req.query as Record<string, string>;

    let rows = await db.select().from(vendorsTable).where(eq(vendorsTable.isActive, true));

    if (category) rows = rows.filter((r) => r.categorySlug === category);
    if (city) rows = rows.filter((r) => r.city.toLowerCase() === city.toLowerCase());

    const vendorIds = rows.map((r) => r.id);
    let images: { vendorId: number; url: string }[] = [];
    if (vendorIds.length > 0) {
      images = await db
        .select({ vendorId: vendorImagesTable.vendorId, url: vendorImagesTable.url })
        .from(vendorImagesTable)
        .where(eq(vendorImagesTable.isPrimary, true));
    }
    const imageMap = new Map(images.map((i) => [i.vendorId, i.url]));

    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null, images: [] }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

router.get("/vendors/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const vendor = await db.select().from(vendorsTable).where(eq(vendorsTable.slug, slug)).limit(1);
    if (!vendor.length) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }
    const images = await db.select().from(vendorImagesTable).where(eq(vendorImagesTable.vendorId, vendor[0].id));
    res.json({ ...vendor[0], images });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendor" });
  }
});

export default router;
