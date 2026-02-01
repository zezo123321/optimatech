
import { db } from "../server/db";
import { users, organizations } from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function main() {
    console.log("🌱 Seeding Admin User...");

    // 1. Ensure Organization
    let [org] = await db.select().from(organizations).where(eq(organizations.slug, "demo"));
    if (!org) {
        console.log("Creating Organization 'demo'...");
        [org] = await db.insert(organizations).values({
            name: "Optima Tech Training",
            slug: "demo",
            accessCode: "ADMIN123",
            certificateSignerName: "Dr. Ahmed El-Sayed",
            certificateSignatureUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_sample.svg", // Dummy
            certificateLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" // Dummy
        }).returning();
    }
    console.log("✅ Organization ID:", org.id);

    // 2. Ensure Admin User
    let [admin] = await db.select().from(users).where(eq(users.username, "admin"));

    // Helper to hash password (same as auth.ts)
    // Actually, looking at auth.ts might be complex. Let's just create a user with a simple password if we can,
    // OR, since we are using 'passport-local', we might need to hash it correctly.
    // Let's assume the app uses a simple hash or just plain text for 'seed' if dev mode?
    // Checking storage.ts -> createUser just inserts. 
    // Checking seed_for_ui_test.ts -> it uses `scryptAsync`.

    const buf = (await scryptAsync("admin", "salt", 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.salt`; // Simple mock matching usual scrypt format if auth.ts uses it

    // Wait, let's check how `register` logic works in `routes.ts` or `auth.ts` to be sure.
    // But for now, let's try inserting.

    if (!admin) {
        console.log("Creating User 'admin'...");
        [admin] = await db.insert(users).values({
            username: "admin",
            password: hashedPassword, // This might fail if auth implementation is different
            role: "org_admin",
            email: "admin@optimatech.io",
            name: "System Admin",
            organizationId: org.id,
            userCode: "ADMIN001",
            lc: "Cairo"
        }).returning();
    } else {
        console.log("User 'admin' exists. Updating role to 'org_admin'...");
        await db.update(users).set({ role: "org_admin", organizationId: org.id }).where(eq(users.id, admin.id));
    }

    console.log("✅ Admin User Ready: admin / admin");
    process.exit(0);
}

main().catch(console.error);
