
import { db } from "./db";
import { users } from "@shared/schema";
import { writeFile } from "fs/promises";
import { desc } from "drizzle-orm";

async function main() {
    console.log("Fetching users...");
    const allUsers = await db.select().from(users).orderBy(desc(users.id));

    let output = "=== User List ===\n\n";
    output += "Code | Username | Role | Password | Email | Name\n";
    output += "------|----------|------|----------|-------|-----\n";

    allUsers.forEach((user) => {
        output += `${user.userCode || '-'} | ${user.username} | ${user.role} | ${user.password} | ${user.email} | ${user.name || "N/A"}\n`;
    });

    const filePath = "users_list.txt";
    await writeFile(filePath, output);
    console.log(`Successfully exported ${allUsers.length} users to ${filePath}`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Error exporting users:", err);
    process.exit(1);
});
