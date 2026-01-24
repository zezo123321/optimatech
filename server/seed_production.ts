import { db } from "./db";
import { users, organizations, courses, modules, lessons, enrollments } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function seedProduction() {
    console.log("🌱 Seeding Production Users...");

    // 1. Ensure Organization
    let org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, "demo")
    });

    if (!org) {
        console.log("Creating Admin Organization...");
        [org] = await db.insert(organizations).values({
            name: "Smart Edu Systems",
            slug: "demo", // Keeping demo slug for consistency
            logoUrl: "https://ui-avatars.com/api/?name=SE&background=0D8ABC&color=fff"
        }).returning();
    }

    // Helper to create user if not exists
    const createUser = async (username: string, role: string, name: string) => {
        const existing = await db.query.users.findFirst({
            where: eq(users.username, username)
        });

        if (existing) {
            console.log(`User ${username} already exists. Skipping.`);
            // Optional: Update role if needed
            if (existing.role !== role) {
                await db.update(users).set({ role: role as any }).where(eq(users.id, existing.id));
                console.log(`Updated role for ${username} to ${role}`);
            }
            return;
        }

        const passwordParams = await hashPassword(username); // Password = username
        await db.insert(users).values({
            username,
            password: passwordParams,
            role: role as any,
            name,
            email: `${username}@smart.edu.eg`,
            organizationId: org!.id,
            xp: 0
        });
        console.log(`Created user: ${username} (${role})`);
    };

    // 2. Create Users
    await createUser("admin", "org_admin", "System Administrator");
    await createUser("manager", "org_admin", "Training Manager");
    await createUser("instructor_ahmed", "instructor", "Dr. Ahmed Hassan");
    await createUser("ta_sara", "ta", "Sara Ali");
    await createUser("co_mohamed", "instructor", "Eng. Mohamed");
    await createUser("student_ali", "student", "Ali Student");
    await createUser("student_nada", "student", "Nada Student");

    // 3. Create Course and Enrollment for basic testing
    const instructor = await db.query.users.findFirst({
        where: eq(users.username, "instructor_ahmed")
    });

    const student = await db.query.users.findFirst({
        where: eq(users.username, "student_ali")
    });

    // Check if course exists
    let course = await db.query.courses.findFirst({
        where: eq(courses.title, "Web Development Basics")
    });

    if (!course && instructor) {
        console.log("Creating seed course...");
        [course] = await db.insert(courses).values({
            title: "Web Development Basics",
            description: "Introduction to HTML, CSS, and JavaScript",
            organizationId: org!.id,
            instructorId: instructor.id,
            published: true,
        }).returning();

        // Create a module and lesson for context
        const [mod] = await db.insert(modules).values({
            courseId: course.id,
            title: "Introduction",
            order: 1
        }).returning();

        await db.insert(lessons).values({
            moduleId: mod.id,
            title: "What is the Web?",
            type: "text",
            textContent: "The web is...",
            order: 1
        });
    }

    if (course && student) {
        // Check enrollment
        const existingEnrollment = await db.query.enrollments.findFirst({
            where: (e, { and, eq }) => and(
                eq(e.userId, student.id),
                eq(e.courseId, course!.id)
            )
        });

        if (!existingEnrollment) {
            console.log("Enrolling student in path...");
            await db.insert(enrollments).values({
                userId: student.id,
                courseId: course.id,
                progress: 35, // Some progress
                enrolledAt: new Date(),
            });
        }
    }

    console.log("✅ Seeding Complete!");
    process.exit(0);
}

seedProduction().catch((err) => {
    console.error(err);
    process.exit(1);
});
