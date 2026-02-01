
import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const username = "student_indep";
    const user = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (!user) { console.log("User not found"); process.exit(1); }

    if (user.organizationId) {
        await db.update(users).set({ organizationId: null }).where(eq(users.id, user.id));
        console.log(`Updated ${username} to Independent (Org: NULL)`);
    } else {
        await db.update(users).set({ organizationId: 1 }).where(eq(users.id, user.id));
        console.log(`Updated ${username} to Organization User (Org: 1)`);
    }
    process.exit(0);
}

main().catch(console.error);
