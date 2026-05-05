import { Router } from "express";
import { db } from "@workspace/db";
import { getawaysTable, getawayImagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/getaways", async (_req, res) => {
  try {
    const rows = await db.select().from(getawaysTable).where(eq(getawaysTable.isActive, true));

    const ids = rows.map((r) => r.id);
    let images: { getawayId: number; url: string }[] = [];
    if (ids.length > 0) {
      images = await db
        .select({ getawayId: getawayImagesTable.getawayId, url: getawayImagesTable.url })
        .from(getawayImagesTable)
        .where(eq(getawayImagesTable.isPrimary, true));
    }
    const imageMap = new Map(images.map((i) => [i.getawayId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null, images: [] }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch getaways" });
  }
});

router.get("/getaways/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const getaway = await db.select().from(getawaysTable).where(eq(getawaysTable.slug, slug)).limit(1);
    if (!getaway.length) {
      res.status(404).json({ message: "Getaway not found" });
      return;
    }
    const images = await db.select().from(getawayImagesTable).where(eq(getawayImagesTable.getawayId, getaway[0].id));
    res.json({ ...getaway[0], images });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch getaway" });
  }
});

export default router;
