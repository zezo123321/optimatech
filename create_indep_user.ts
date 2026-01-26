
import "dotenv/config";
import { db } from "./server/db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function createIndependentUser() {
    const username = "student_indep";

    // Check if exists
    const existing = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (existing) {
        console.log("User already exists, updating org to NULL...");
        await db.update(users).set({ organizationId: null }).where(eq(users.id, existing.id));
        console.log("Updated.");
        process.exit(0);
    }

    const password = await hashPassword("student_indep");

    await db.insert(users).values({
        username,
        password,
        role: "student",
        name: "Independent Student",
        email: "indep@gmail.com",
        organizationId: null, // Critical for test
        xp: 0
    });

    console.log("Created independent student user.");
    process.exit(0);
}

createIndependentUser().catch(console.error);
