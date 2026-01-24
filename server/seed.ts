import { db } from "./db";
import { organizations, users, courses } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Running Shadow Org Seed Script...");

    // 1. Check for Public Marketplace Org
    const marketplaceSlug = "public-marketplace";
    const existingOrg = await db.query.organizations.findFirst({
        where: eq(organizations.slug, marketplaceSlug)
    });

    if (!existingOrg) {
        console.log("Shadow Org 'Public Marketplace' missing. Creating...");
        await db.insert(organizations).values({
            name: "Public Marketplace",
            slug: marketplaceSlug,
            logoUrl: "", // Optional
            accessCode: "PUBLIC_MARKETPLACE_SYSTEM" // Internal system code
        });
        console.log("Created Shadow Org.");
    } else {
        console.log("Shadow Org exists.");
    }

    // Optional: Ensure 'public' slug alias exists or main redirect if needed
    // For now, sticking to the requested 'public-marketplace'.

    console.log("Seed complete.");
    process.exit(0);
}

main().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
