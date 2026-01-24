
import { db } from "./db";
import { users, organizations } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    const username = "super_admin";
    const password = "super_admin";

    console.log(`Creating/Updating Super Admin user: ${username}...`);

    // Ensure we have an organization to attach to, though super_admin implies cross-org.
    // We attach to 'demo' org for safety in UI components that might expect currentOrg.
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, "demo")
    });

    if (!org) {
        console.error("Error: 'demo' organization not found. Please run seed script first.");
        process.exit(1);
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    const hashedPassword = await hashPassword(password);

    if (existingUser) {
        await db.update(users).set({
            role: "super_admin",
            password: hashedPassword, // Reset password to ensure access
            name: "Super Administrator",
            organizationId: org.id // Bind to demo org for basic dashboard access
        }).where(eq(users.id, existingUser.id));
        console.log(`Updated existing user '${username}' to super_admin.`);
    } else {
        await db.insert(users).values({
            username,
            password: hashedPassword,
            role: "super_admin",
            name: "Super Administrator",
            email: "super_admin@optimatech.com",
            organizationId: org.id,
            xp: 0
        });
        console.log(`Created new user '${username}' as super_admin.`);
    }

    console.log(`\nCredentials:\nUsername: ${username}\nPassword: ${password}`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Error creating super admin:", err);
    process.exit(1);
});
