import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const username = process.argv[2];
    if (!username) {
        console.error("Usage: npx tsx server/make_admin.ts <username>");
        process.exit(1);
    }

    try {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (!user) {
            console.error(`User '${username}' not found`);
            process.exit(1);
        }

        await db.update(users).set({ role: "org_admin" }).where(eq(users.id, user.id));
        console.log(`User '${username}' has been promoted to admin.`);
    } catch (error) {
        console.error("Error promoting user:", error);
    } finally {
        process.exit(0);
    }
}

main();
