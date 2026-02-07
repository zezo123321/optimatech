
import "dotenv/config";
import { db } from "../server/db";
import { users, organizations, courses } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting Cross-Tenant Isolation Verification...");
    const baseUrl = "http://localhost:5000";

    // 1. Setup Data
    console.log("Seeding Test Data...");

    // Create Organizations
    const [orgA] = await db.insert(organizations).values({
        name: "Tenant A",
        slug: "tenant-a",
        accessCode: "TENANTA"
    }).onConflictDoNothing().returning();

    const [orgB] = await db.insert(organizations).values({
        name: "Tenant B",
        slug: "tenant-b",
        accessCode: "TENANTB"
    }).onConflictDoNothing().returning();

    const finalOrgA = orgA || await db.query.organizations.findFirst({ where: eq(organizations.slug, "tenant-a") });
    const finalOrgB = orgB || await db.query.organizations.findFirst({ where: eq(organizations.slug, "tenant-b") });

    if (!finalOrgA || !finalOrgB) throw new Error("Failed to create/find orgs");

    // Create Users
    const [userA] = await db.insert(users).values({
        username: "user_a",
        password: "password123", // simplified
        role: "student",
        organizationId: finalOrgA.id,
        name: "User A"
    }).onConflictDoNothing().returning();

    const [userB] = await db.insert(users).values({
        username: "user_b",
        password: "password123",
        role: "student",
        organizationId: finalOrgB.id,
        name: "User B"
    }).onConflictDoNothing().returning();

    const finalUserA = userA || await db.query.users.findFirst({ where: eq(users.username, "user_a") });
    const finalUserB = userB || await db.query.users.findFirst({ where: eq(users.username, "user_b") });

    // Create Courses
    const [courseA] = await db.insert(courses).values({
        title: "Course A (Tenant A)",
        organizationId: finalOrgA.id,
        published: true,
        isPublic: false // STRICTLY PRIVATE
    }).returning();

    const [courseB] = await db.insert(courses).values({
        title: "Course B (Tenant B)",
        organizationId: finalOrgB.id,
        published: true,
        isPublic: false
    }).returning();

    console.log(`Setup Complete. OrgA=${finalOrgA.id}, OrgB=${finalOrgB.id}, CourseA=${courseA.id}, CourseB=${courseB.id}`);

    // 2. Perform Checks
    // We need to authenticate. Since we don't want to deal with cookie jars in this simple script easily,
    // we might check the STORAGE logic directly which `routes.ts` uses.
    // OR we can use the `storage.getCourses` method which implements the filtering.

    const { storage } = await import("../server/storage");

    console.log("\n--- Check 1: Storage Filtering ---");

    // As User A (Org A)
    const coursesForUserA = await storage.getCourses({ organizationId: finalOrgA.id });
    const hasCourseA = coursesForUserA.some(c => c.id === courseA.id);
    const hasCourseB = coursesForUserA.some(c => c.id === courseB.id);

    console.log(`User A (Org A) sees Course A? ${hasCourseA}`);
    console.log(`User A (Org A) sees Course B? ${hasCourseB}`);

    if (hasCourseA && !hasCourseB) {
        console.log("PASS: User A sees only their org's courses.");
    } else {
        console.error("FAIL: User A sees wrong courses.");
    }

    // As User B (Org B)
    const coursesForUserB = await storage.getCourses({ organizationId: finalOrgB.id });
    const hasCourseA_B = coursesForUserB.some(c => c.id === courseA.id);
    const hasCourseB_B = coursesForUserB.some(c => c.id === courseB.id);

    console.log(`User B (Org B) sees Course A? ${hasCourseA_B}`);
    console.log(`User B (Org B) sees Course B? ${hasCourseB_B}`);

    if (!hasCourseA_B && hasCourseB_B) {
        console.log("PASS: User B sees only their org's courses.");
    } else {
        console.error("FAIL: User B sees wrong courses.");
    }

    // 3. Cleanup (Optional, but good for repeatability)
    // await db.delete(courses).where(eq(courses.id, courseA.id));
    // await db.delete(courses).where(eq(courses.id, courseB.id));
    // console.log("Cleanup complete.");

    console.log("\nDone.");
    process.exit(0);
}

main().catch(console.error);
