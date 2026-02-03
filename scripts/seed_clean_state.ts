
import { db } from "../server/db";
import { users, organizations, courses, modules, lessons, enrollments, submissions, assignments, lessonCompletions, certificates, quizAttempts, quizQuestions, courseStaff, instructorRequests } from "@shared/schema";
import { hashPassword } from "../server/auth";

async function seedCleanState() {
    console.log("🔥 PURGING DATABASE...");

    // 1. Clean all data (Order matters for Foreign Keys!)
    await db.delete(instructorRequests);
    await db.delete(quizAttempts);
    await db.delete(quizQuestions);
    await db.delete(lessonCompletions);
    await db.delete(certificates);
    await db.delete(submissions);
    await db.delete(enrollments);
    await db.delete(courseStaff);
    await db.delete(lessons);
    await db.delete(modules);
    await db.delete(assignments);
    await db.delete(courses);
    await db.delete(users);
    await db.delete(organizations);

    console.log("✅ Database cleared.");

    // 2. Create Organizations
    console.log("🌱 Seeding Organizations...");
    const [orgA] = await db.insert(organizations).values({
        name: "Optima Tech (HQ)",
        slug: "optima",
        accessCode: "OPTIMA",
        certificateSignerName: "Dr. Ahmed",
        certificateSignerTitle: "CEO"
    }).returning();

    const [orgB] = await db.insert(organizations).values({
        name: "Partner NGO",
        slug: "ngo-partner",
        accessCode: "NGO123",
        certificateSignerName: "Sarah Smith",
        certificateSignerTitle: "Director"
    }).returning();

    // 3. Create Users
    console.log("🌱 Seeding Users...");
    const password = await hashPassword("123456");

    // Super Admin
    await db.insert(users).values({
        username: "super_admin",
        password,
        role: "super_admin",
        name: "System Administrator",
        organizationId: orgA.id,
        headline: "Chief Admin"
    });

    // Function to seed an Org Structure
    async function seedOrgStructure(orgId: number, suffix: string) {
        // Org Admin
        await db.insert(users).values({
            username: `admin_${suffix}`,
            password,
            role: "org_admin",
            name: `Admin ${suffix.toUpperCase()}`,
            organizationId: orgId,
            headline: "Training Manager"
        });

        // 2 Instructors
        const instructors = [];
        for (let i = 1; i <= 2; i++) {
            const [inst] = await db.insert(users).values({
                username: `inst_${suffix}_${i}`,
                password,
                role: "instructor",
                name: `Instructor ${suffix.toUpperCase()} ${i}`,
                organizationId: orgId,
                headline: "Senior Trainer"
            }).returning();
            instructors.push(inst);
        }

        // 2 Students
        const students = [];
        for (let i = 1; i <= 2; i++) {
            const [s] = await db.insert(users).values({
                username: `student_${suffix}_${i}`,
                password,
                role: "student",
                name: `Student ${suffix.toUpperCase()} ${i}`,
                organizationId: orgId
            }).returning();
            students.push(s);
        }

        // 2 Courses
        for (let i = 1; i <= 2; i++) {
            const [course] = await db.insert(courses).values({
                title: `Course ${suffix.toUpperCase()} ${i}`,
                description: "A sample verified course.",
                organizationId: orgId,
                instructorId: instructors[0].id, // Linked to the first instructor of the org
                published: true,
                isPublic: false
            }).returning();

            // Enroll students
            for (const student of students) {
                await db.insert(enrollments).values({
                    userId: student.id,
                    courseId: course.id,
                    enrolledAt: new Date()
                });
            }

            // Create Content (Modules & Lessons)
            const [mod] = await db.insert(modules).values({
                courseId: course.id,
                title: "Introduction",
                order: 1
            }).returning();

            await db.insert(lessons).values({
                moduleId: mod.id,
                title: "Welcome to the Course",
                textContent: "This is the first lesson content.",
                type: "text",
                order: 1,
            });

            await db.insert(lessons).values({
                moduleId: mod.id,
                title: "Core Concepts",
                contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                type: "video",
                order: 2,
            });
        }
    }

    await seedOrgStructure(orgA.id, "a");
    await seedOrgStructure(orgB.id, "b");

    console.log("✅ Seed Complete!");
    console.log("Credentials (Password: 123456):");
    console.log("- Super Admin: super_admin");
    console.log("- Org A Admin: admin_a");
    console.log("- Org B Admin: admin_b");
    console.log("- Instructors: inst_a_1, inst_a_2...");
    console.log("- Students: student_a_1, student_a_2...");

    process.exit(0);
}

seedCleanState().catch((e) => {
    console.error(e);
    process.exit(1);
});
