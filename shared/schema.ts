import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === ENUMS ===
export const userRoleEnum = pgEnum("user_role", ["super_admin", "org_admin", "instructor", "student"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "pdf", "text"]);

// === USERS & ORGS ===
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").unique(), // For Replit Auth
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRoleEnum("role").default("student").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === COURSES ===
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  instructorId: integer("instructor_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  type: lessonTypeEnum("type").notNull(),
  contentUrl: text("content_url"), // For video/PDF
  textContent: text("text_content"), // For text lessons
  order: integer("order").notNull(),
});

// === LEARNING ===
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // Percentage
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  maxScore: integer("max_score").default(100),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  contentUrl: text("content_url"),
  textContent: text("text_content"),
  grade: integer("grade"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// === RELATIONS ===
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  courses: many(courses),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  enrollments: many(enrollments),
  submissions: many(submissions),
  taughtCourses: many(courses, { relationName: "instructor" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [courses.organizationId],
    references: [organizations.id],
  }),
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  modules: many(modules),
  assignments: many(assignments),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
}));

// === INSERTS ===
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true, completedAt: true, progress: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true, grade: true, feedback: true });
export const gradeSubmissionSchema = createInsertSchema(submissions).pick({ grade: true, feedback: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type GradeSubmission = z.infer<typeof gradeSubmissionSchema>;

// === API DTOs ===
export type AnalyticsResponse = {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  attendanceRate: number;
  averageScore: number;
};

export type CourseWithModules = Course & {
  modules: (Module & { lessons: Lesson[] })[];
  assignments: Assignment[];
};
