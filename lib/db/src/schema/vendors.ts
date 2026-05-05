import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  categorySlug: text("category_slug").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull().default("Nagpur"),
  locality: text("locality").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviews: integer("reviews").notNull().default(0),
  priceFrom: integer("price_from").notNull().default(0),
  completed: integer("completed").notNull().default(0),
  yearsExp: integer("years_exp").notNull().default(0),
  ph: text("ph").notNull().default("v2"),
  tagline: text("tagline").notNull().default(""),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorImagesTable = pgTable("vendor_images", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  isPrimary: boolean("is_primary").notNull().default(false),
  order: integer("order").notNull().default(0),
});

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectVendorSchema = createSelectSchema(vendorsTable);
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendorsTable.$inferSelect;
export type VendorImage = typeof vendorImagesTable.$inferSelect;
