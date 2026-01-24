
import { db } from "./server/db";
import { organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verify() {
    try {
        const org = await db.query.organizations.findFirst({
            where: eq(organizations.slug, "public-marketplace"),
        });
        console.log("Found Org:", org?.name);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
