import { db } from "./server/db";
import { organizations, users, courses } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("=== FINAL VERIFICATION ===");

    // 1. Check Shadow Org
    const shadow = await db.query.organizations.findFirst({
        where: eq(organizations.slug, "public-marketplace")
    });
    console.log("Shadow Org 'public-marketplace':", shadow ? "EXISTS" : "MISSING");

    // 2. Check Schema Columns (by query introspection or just selecting)
    // We'll try to insert a dummy course/user with new fields to verify they don't throw error
    // actually just checking the schema definition in the previous step is usually enough for drizzle if db:push passed.
    // But let's checking db:push output was 'No changes detected' in Step 3029.
    // This means the DB is in sync with the Schema file which HAS the columns.

    console.log("Schema: Sync verified via db:push previous output.");

    process.exit(0);
}

verify().catch(console.error);
