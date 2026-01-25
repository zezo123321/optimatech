
import fs from "fs";
import { db } from "./server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting script...");
    console.log("Reading users_list.txt...");
    const fileContent = fs.readFileSync("users_list.txt", "utf-8");
    const lines = fileContent.split("\n");

    console.log(`Found ${lines.length} lines. Processing...`);

    // Try a simple DB query first
    console.log("Testing DB connection...");
    try {
        const test = await db.query.users.findFirst();
        console.log("DB connection successful. First user id:", test?.id || "None");
    } catch (e) {
        console.error("DB Connection FATAL:", e);
        process.exit(1);
    }

    for (const line of lines) {
        if (!line.trim() || line.startsWith("===") || line.startsWith("Code") || line.startsWith("---")) {
            continue;
        }

        const [userCode, username, role, password, email, name] = line.split("|").map(s => s.trim());

        if (!userCode || !username) {
            continue;
        }

        // Handle null/string-null
        const validEmail = (email === "null" || !email) ? null : email;
        const finalRole = (role === 'org_admin' || role === 'instructor' || role === 'ta' || role === 'student') ? role : 'student';

        try {
            const existing = await db.query.users.findFirst({
                where: eq(users.username, username)
            });

            if (existing) {
                console.log(`[SKIP] ${username} already exists.`);
                continue;
            }

            await db.insert(users).values({
                username,
                password,
                role: finalRole as any,
                name,
                email: validEmail,
                userCode,
                xp: 0
            });
            console.log(`[OK] Created user: ${username}`);
        } catch (e) {
            console.error(`[ERR] Failed to create user ${username}:`, e);
        }
    }

    console.log("Import complete.");
    process.exit(0);
}

main().catch(e => {
    console.error("Unhandled error:", e);
    process.exit(1);
});
