import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === ENUMS ===
export const userRoleEnum = pgEnum("user_role", ["super_admin", "org_admin", "instructor", "ta", "student"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "pdf", "text", "quiz"]);
export const evaluationTypeEnum = pgEnum("evaluation_type", ["pre", "post"]);
export const questionTypeEnum = pgEnum("question_type", ["rating", "text", "mcq"]);

// ... (existing code)

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // 'mcq', 'true_false'
  options: jsonb("options").notNull(), // Array of { id, text, isCorrect }
  order: integer("order").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  score: integer("score").notNull(),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  code: text("code").notNull().unique(), // e.g., "CERT-1234-ABCD"
  issuedAt: timestamp("issued_at").defaultNow(),
});

// ... (existing relations)

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [quizQuestions.lessonId],
    references: [lessons.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [quizAttempts.lessonId],
    references: [lessons.id],
  }),
}));

// ... (existing relations continued)

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({ id: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, completedAt: true });

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, issuedAt: true });
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;


export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  accessCode: text("access_code"), // e.g. "TADREEB2026"
  logoUrl: text("logo_url"),
  certificateLogoUrl: text("certificate_logo_url"), // For branding
  certificateSignerName: text("certificate_signer_name"),
  certificateSignerTitle: text("certificate_signer_title"), // Added for pilot
  certificateSignatureUrl: text("certificate_signature_url"),
  certificateTemplateUrl: text("certificate_template_url"), // Background image override
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").unique(), // Optional now
  userCode: text("user_code").unique(),
  email: text("email").unique(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  headline: text("headline"),
  bio: text("bio"),
  role: userRoleEnum("role").default("student").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  xp: integer("xp").default(0).notNull(),
  lc: text("lc"), // Local Committee (Segmentation)
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
  isPublic: boolean("is_public").default(false), // Logic: Visible to B2C users across tenants
  price: integer("price").default(0),
  currency: text("currency").default("EGP"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseStaff = pgTable("course_staff", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'co-instructor', 'ta'
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

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // Self-reference manually handled in logic/queries or add .references(() => comments.id)
  createdAt: timestamp("created_at").defaultNow(),
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
  staff: many(courseStaff),
}));

export const courseStaffRelations = relations(courseStaff, ({ one }) => ({
  course: one(courses, {
    fields: [courseStaff.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [courseStaff.userId],
    references: [users.id],
  }),
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

export const lessonCompletions = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  type: evaluationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evaluationQuestions = pgTable("evaluation_questions", {
  id: serial("id").primaryKey(),
  evaluationId: integer("evaluation_id").notNull().references(() => evaluations.id),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull(),
  options: jsonb("options"), // For MCQ: array of strings
  order: integer("order").notNull(),
});

export const evaluationResponses = pgTable("evaluation_responses", {
  id: serial("id").primaryKey(),
  evaluationId: integer("evaluation_id").notNull().references(() => evaluations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  answers: jsonb("answers").notNull(), // Map of questionId -> answer
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const lessonCompletionsRelations = relations(lessonCompletions, ({ one }) => ({
  user: one(users, {
    fields: [lessonCompletions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonCompletions.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [lessonCompletions.courseId],
    references: [courses.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [comments.lessonId],
    references: [lessons.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, {
    relationName: "replies",
  }),
}));

// ... (existing relations)

export const evaluationsRelations = relations(evaluations, ({ one, many }) => ({
  course: one(courses, {
    fields: [evaluations.courseId],
    references: [courses.id],
  }),
  questions: many(evaluationQuestions),
  responses: many(evaluationResponses),
}));

export const evaluationQuestionsRelations = relations(evaluationQuestions, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [evaluationQuestions.evaluationId],
    references: [evaluations.id],
  }),
}));

export const evaluationResponsesRelations = relations(evaluationResponses, ({ one }) => ({
  evaluation: one(evaluations, {
    fields: [evaluationResponses.evaluationId],
    references: [evaluations.id],
  }),
  user: one(users, {
    fields: [evaluationResponses.userId],
    references: [users.id],
  }),
}));

// === INSERTS ===
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true }).extend({
  isPublic: z.boolean().optional()
});
// ... other inserts ...
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true, completedAt: true, progress: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true, grade: true, feedback: true });
export const gradeSubmissionSchema = createInsertSchema(submissions).pick({ grade: true, feedback: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true, createdAt: true });
export const insertEvaluationQuestionSchema = createInsertSchema(evaluationQuestions).omit({ id: true });
export const insertEvaluationResponseSchema = createInsertSchema(evaluationResponses).omit({ id: true, submittedAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export type Evaluation = typeof evaluations.$inferSelect;
export type EvaluationQuestion = typeof evaluationQuestions.$inferSelect;
export type EvaluationResponse = typeof evaluationResponses.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type GradeSubmission = z.infer<typeof gradeSubmissionSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type InsertEvaluationQuestion = z.infer<typeof insertEvaluationQuestionSchema>;
export type InsertEvaluationResponse = z.infer<typeof insertEvaluationResponseSchema>;



export const insertCourseStaffSchema = createInsertSchema(courseStaff).omit({ id: true, createdAt: true });
export type InsertCourseStaff = z.infer<typeof insertCourseStaffSchema>;
export type CourseStaff = typeof courseStaff.$inferSelect;

// === API DTOs ===
export type AnalyticsResponse = {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  attendanceRate: number;
  averageScore: number;
};


// === REQUESTS ===
export const instructorRequests = pgTable("instructor_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  linkedinUrl: text("linkedin_url"),
  status: text("status").default("pending").notNull(),   // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const instructorRequestsRelations = relations(instructorRequests, ({ one }) => ({
  user: one(users, {
    fields: [instructorRequests.userId],
    references: [users.id],
  }),
}));

export const insertInstructorRequestSchema = createInsertSchema(instructorRequests).omit({ id: true, createdAt: true, status: true });
export type InsertInstructorRequest = z.infer<typeof insertInstructorRequestSchema>;
export type InstructorRequest = typeof instructorRequests.$inferSelect;

export type CourseWithModules = Course & {
  modules: (Module & { lessons: Lesson[] })[];
  assignments: Assignment[];
};
