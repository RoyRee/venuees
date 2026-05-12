import { db } from "@/lib/db";
import { profilesTable, listingApplicationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "admin" | "vendor" | "customer";

export async function getUserRole(userId: string, email: string): Promise<UserRole> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (adminEmails.includes(email.toLowerCase())) return "admin";

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (profile?.role === "vendor") return "vendor";

  // Also treat anyone with an approved application as vendor
  const [approved] = await db
    .select({ id: listingApplicationsTable.id })
    .from(listingApplicationsTable)
    .where(eq(listingApplicationsTable.userId, userId))
    .limit(1);
  if (approved) return "vendor";

  return "customer";
}

export async function ensureProfile(userId: string) {
  const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (!existing) {
    await db.insert(profilesTable).values({ userId, role: "customer" }).onConflictDoNothing();
  }
}
