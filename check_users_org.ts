
import "dotenv/config";
import { db } from "./server/db";
import { users, organizations } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allUsers = await db.query.users.findMany({
        with: {
            organization: true
        }
    });

    console.log("User | Role | Org ID | Org Name");
    console.log("---|---|---|---");
    allUsers.forEach(u => {
        console.log(`${u.username} | ${u.role} | ${u.organizationId ?? "NULL"} | ${u.organization?.name ?? "N/A"}`);
    });

    process.exit(0);
}

main().catch(console.error);
