import { useAuth } from "./use-auth";
import { User, Course } from "@shared/schema";

type Action = "delete" | "edit" | "manage_team" | "view_analytics" | "grade";
type Resource = "course" | "user" | "organization";

export function usePermissions() {
    const { user } = useAuth();

    const can = (action: Action, resource: Resource, context?: { course?: any, targetUser?: any }) => {
        if (!user) return false;

        // Super Admin has god mode
        if (user.role === "super_admin") return true;

        // Org Admin has full access within org (context checks implicit via backend, but UI assumes yes)
        if (user.role === "org_admin") return true;

        switch (resource) {
            case "course":
                if (!context?.course) return false;
                const isOwner = context.course.instructorId === user.id;
                // Optimization: In real app, we'd check 'course_staff' list if context provided
                // For now, prompt assumes basic role checks or if we passed the course object with 'staff' relation

                // MVP logic based on role strings
                if (action === "delete") {
                    return isOwner; // Only owner can delete
                }
                if (action === "edit") {
                    return isOwner || user.role === "instructor";
                    // NOTE: 'co-instructor' is a role in 'course_staff', not necessarily user.role
                    // But here we rely on the component passing the *effective* role if user is staff
                    // For simplicity in MVP, we might rely on the user.role if it's "instructor" generally.
                    // Let's refine: The User schema has a global 'role'. 
                    // A user might be a 'student' globally but a 'ta' in a specific course?
                    // The current schema has strictly one global role per user for MVP simplification in Phase 6.
                    // Phase 6 introduced 'course_staff' table which has the specific role for that course.
                    // UI needs to know the user's role IN CONTEXT of this course.
                }
                if (action === "manage_team") {
                    return isOwner;
                }
                break;
        }

        return false;
    };

    // Helper to check specific course relation role
    // Usage: canDoOnCourse('delete', myCourseRole)
    const canOnCourse = (action: Action, courseRole: string | undefined) => {
        if (user?.role === "super_admin" || user?.role === "org_admin") return true;
        if (!courseRole) return false; // Not staff

        if (action === "delete") return courseRole === "instructor"; // Owner
        if (action === "manage_team") return courseRole === "instructor"; // Owner
        if (action === "edit") return ["instructor", "co-instructor"].includes(courseRole);
        if (action === "grade") return ["instructor", "co-instructor", "ta"].includes(courseRole);

        return false;
    };

    return { can, canOnCourse };
}
