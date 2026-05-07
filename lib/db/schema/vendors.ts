import { pgTable, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const vendorsTable = pgTable("vendors", {
  id:           integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug:         text("slug").notNull().unique(),
  category:     text("category").notNull(),
  categorySlug: text("category_slug").notNull(),
  name:         text("name").notNull(),
  city:         text("city").notNull(),
  locality:     text("locality").notNull(),
  rating:       numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviews:      integer("reviews").notNull().default(0),
  priceFrom:    integer("price_from").notNull().default(0),
  completed:    integer("completed").notNull().default(0),
  yearsExp:     integer("years_exp").notNull().default(0),
  ph:           text("ph").notNull().default("v2"),
  scene:        text("scene").notNull().default(""),
  tagline:      text("tagline").notNull().default(""),
  description:  text("description"),
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const vendorImagesTable = pgTable("vendor_images", {
  id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
  vendorId:  integer("vendor_id").notNull().references(() => vendorsTable.id, { onDelete: "cascade" }),
  url:       text("url").notNull(),
  alt:       text("alt").notNull().default(""),
  isPrimary: boolean("is_primary").notNull().default(false),
  order:     integer("order").notNull().default(0),
});

export type Vendor      = typeof vendorsTable.$inferSelect;
export type VendorImage = typeof vendorImagesTable.$inferSelect;
export type InsertVendor = typeof vendorsTable.$inferInsert;
