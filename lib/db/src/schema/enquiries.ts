import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const enquiriesTable = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  kind: text("kind").notNull(),
  venueSlug: text("venue_slug"),
  vendorSlug: text("vendor_slug"),
  getawaySlug: text("getaway_slug"),
  category: text("category"),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  eventDate: text("event_date"),
  guestCount: text("guest_count"),
  message: text("message"),
  sourceUrl: text("source_url"),
  status: text("status").notNull().default("new"),
});

export const newsletterTable = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  email: text("email").notNull().unique(),
  source: text("source"),
});

export const listingApplicationsTable = pgTable("listing_applications", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  category: text("category"),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  locality: text("locality").notNull(),
  website: text("website"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
});

export const insertEnquirySchema = createInsertSchema(enquiriesTable).omit({ id: true, createdAt: true });
export const insertNewsletterSchema = createInsertSchema(newsletterTable).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listingApplicationsTable).omit({ id: true, createdAt: true });
export const selectEnquirySchema = createSelectSchema(enquiriesTable);

export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enquiry = typeof enquiriesTable.$inferSelect;
export type NewsletterSignup = typeof newsletterTable.$inferSelect;
export type ListingApplication = typeof listingApplicationsTable.$inferSelect;
