import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const enquiriesTable = pgTable("enquiries", {
  id:          integer("id").primaryKey().generatedByDefaultAsIdentity(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  kind:        text("kind").notNull(),
  venueSlug:   text("venue_slug"),
  vendorSlug:  text("vendor_slug"),
  getawaySlug: text("getaway_slug"),
  category:    text("category"),
  name:        text("name"),
  phone:       text("phone"),
  email:       text("email"),
  eventDate:   text("event_date"),
  guestCount:  text("guest_count"),
  message:     text("message"),
  sourceUrl:   text("source_url"),
  userAgent:   text("user_agent"),
  status:      text("status").notNull().default("new"),
});

export const newsletterTable = pgTable("newsletter_signups", {
  id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  email:     text("email").notNull().unique(),
  source:    text("source"),
});

export const listingApplicationsTable = pgTable("listing_applications", {
  id:           integer("id").primaryKey().generatedByDefaultAsIdentity(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  category:     text("category"),
  contactName:  text("contact_name").notNull(),
  phone:        text("phone").notNull(),
  email:        text("email").notNull(),
  city:         text("city").notNull(),
  locality:     text("locality").notNull().default(""),
  website:      text("website"),
  message:      text("message"),
  status:       text("status").notNull().default("pending"),
});

export type Enquiry            = typeof enquiriesTable.$inferSelect;
export type InsertEnquiry      = typeof enquiriesTable.$inferInsert;
export type NewsletterSignup   = typeof newsletterTable.$inferSelect;
export type ListingApplication = typeof listingApplicationsTable.$inferSelect;
