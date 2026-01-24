
import { db } from "./db";
import { users, organizations } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { DatabaseStorage } from "./storage";

async function main() {
    console.log("Verifying storage fetch (all users)...");

    // Fetch all users to debug
    const allUsers = await db.select().from(users).limit(5);
    console.log(`Found ${allUsers.length} users (sample).`);

    if (allUsers.length > 0) {
        console.log("Sample user:", JSON.stringify(allUsers[0], null, 2));
    } else {
        console.log("No users found.");
    }
    process.exit(0);
}

main().catch(console.error);
