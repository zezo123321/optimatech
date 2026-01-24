
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateUserCode() {
    // Generate a random 6-character alphanumeric code
    // Using hex might give a-f and 0-9.
    // User asked for "numbers and letters".
    // Let's use a custom set to avoid ambiguity if needed, or just standard base36/hex.
    // Simple: Random 3 bytes -> hex is 6 chars. 
    // But let's make it uppercase for readability like "A7X92B".
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const randomValues = randomBytes(6);
    for (let i = 0; i < 6; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}

async function main() {
    console.log("Checking for users without userCode...");
    const usersToUpdate = await db.select().from(users).where(isNull(users.userCode));

    console.log(`Found ${usersToUpdate.length} users to update.`);

    for (const user of usersToUpdate) {
        let unique = false;
        let code = "";
        while (!unique) {
            code = generateUserCode();
            // Check uniqueness collision (improbable but good practice)
            const exists = await db.query.users.findFirst({
                where: eq(users.userCode, code)
            });
            if (!exists) unique = true;
        }

        await db.update(users).set({ userCode: code }).where(eq(users.id, user.id));
        console.log(`Assigned code ${code} to user ${user.username} (ID: ${user.id})`);
    }

    console.log("Backfill complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Error backfilling user codes:", err);
    process.exit(1);
});
