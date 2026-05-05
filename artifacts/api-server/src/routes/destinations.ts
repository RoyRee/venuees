import { Router } from "express";
import { db } from "@workspace/db";
import { destinationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/destinations", async (_req, res) => {
  try {
    const rows = await db.select().from(destinationsTable).where(eq(destinationsTable.isActive, true));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destinations" });
  }
});

router.get("/destinations/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const dest = await db.select().from(destinationsTable).where(eq(destinationsTable.slug, slug)).limit(1);
    if (!dest.length) {
      res.status(404).json({ message: "Destination not found" });
      return;
    }
    res.json(dest[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destination" });
  }
});

export default router;
