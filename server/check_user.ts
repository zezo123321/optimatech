import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
    const user = await db.query.users.findFirst({
        where: eq(users.username, "student_ali")
    });
    console.log("Found User:", user);
    process.exit(0);
}

checkUser().catch(console.error);
