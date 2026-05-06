import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const realWeddingsTable = pgTable("real_weddings", {
  id:        serial("id").primaryKey(),
  slug:      text("slug").notNull().unique(),
  couple:    text("couple").notNull(),
  venue:     text("venue").notNull(),
  date:      text("date").notNull(),
  guests:    integer("guests").notNull().default(0),
  ph:        text("ph").notNull().default("v2"),
  scene:     text("scene").notNull().default(""),
  quote:     text("quote"),
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const realWeddingImagesTable = pgTable("real_wedding_images", {
  id:            serial("id").primaryKey(),
  realWeddingId: integer("real_wedding_id").notNull().references(() => realWeddingsTable.id, { onDelete: "cascade" }),
  url:           text("url").notNull(),
  alt:           text("alt").notNull().default(""),
  isPrimary:     boolean("is_primary").notNull().default(false),
  order:         integer("order").notNull().default(0),
});

export type RealWedding      = typeof realWeddingsTable.$inferSelect;
export type RealWeddingImage = typeof realWeddingImagesTable.$inferSelect;
export type InsertRealWedding = typeof realWeddingsTable.$inferInsert;
