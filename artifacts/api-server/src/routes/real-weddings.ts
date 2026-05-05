import { Router } from "express";
import { db } from "@workspace/db";
import { realWeddingsTable, realWeddingImagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/real-weddings", async (_req, res) => {
  try {
    const rows = await db.select().from(realWeddingsTable).where(eq(realWeddingsTable.isActive, true));
    const ids = rows.map((r) => r.id);
    let images: { weddingId: number; url: string }[] = [];
    if (ids.length > 0) {
      images = await db
        .select({ weddingId: realWeddingImagesTable.weddingId, url: realWeddingImagesTable.url })
        .from(realWeddingImagesTable)
        .where(eq(realWeddingImagesTable.isPrimary, true));
    }
    const imageMap = new Map(images.map((i) => [i.weddingId, i.url]));
    const result = rows.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null, images: [] }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch real weddings", error: String(err) });
  }
});

router.get("/real-weddings/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const wedding = await db.select().from(realWeddingsTable).where(eq(realWeddingsTable.slug, slug)).limit(1);
    if (!wedding.length) {
      res.status(404).json({ message: "Real wedding not found" });
      return;
    }
    const images = await db.select().from(realWeddingImagesTable).where(eq(realWeddingImagesTable.weddingId, wedding[0].id));
    res.json({ ...wedding[0], images });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch real wedding", error: String(err) });
  }
});

export default router;
