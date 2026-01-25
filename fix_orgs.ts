
import { db } from "./server/db";
import { users, organizations } from "@shared/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
    console.log("Fixing user organizations...");

    // 1. Get the Demo Org
    const demoOrg = await db.query.organizations.findFirst({
        where: eq(organizations.slug, "demo")
    });

    if (!demoOrg) {
        console.error("Demo organization not found. Please run seed_production.ts first.");
        process.exit(1);
    }

    console.log(`Found Organization: ${demoOrg.name} (ID: ${demoOrg.id})`);

    // 2. Find users without org
    const orphans = await db.select().from(users).where(isNull(users.organizationId));
    console.log(`Found ${orphans.length} users without an organization.`);

    if (orphans.length === 0) {
        console.log("No users to fix.");
        process.exit(0);
    }

    // 3. Update them
    await db.update(users)
        .set({ organizationId: demoOrg.id })
        .where(isNull(users.organizationId));

    console.log(`Successfully assigned ${orphans.length} users to 'demo' organization.`);
    process.exit(0);
}

main().catch(console.error);
