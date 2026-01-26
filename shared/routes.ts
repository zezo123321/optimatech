import { z } from 'zod';
import {
  insertUserSchema,
  insertOrganizationSchema,
  insertCourseSchema,
  insertModuleSchema,
  insertLessonSchema,
  insertAssignmentSchema,
  insertSubmissionSchema,
  gradeSubmissionSchema,
  insertCommentSchema,
  insertInstructorRequestSchema,
  users, organizations, courses, modules, lessons, enrollments, assignments, submissions, comments, instructorRequests
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === AUTH & USERS ===
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/user/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/user/me',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === ORGANIZATIONS ===
  organizations: {
    get: {
      method: 'GET' as const,
      path: '/api/organizations/:slug',
      responses: {
        200: z.custom<typeof organizations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analytics: {
      method: 'GET' as const,
      path: '/api/organizations/:id/analytics',
      responses: {
        200: z.object({
          totalStudents: z.number(),
          activeCourses: z.number(),
          completionRate: z.number(),
          attendanceRate: z.number(),
          averageScore: z.number(),
        }),
        403: errorSchemas.unauthorized,
      },
    },
  },

  // === COURSES ===
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses',
      input: z.object({
        organizationId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/courses/:id',
      responses: {
        200: z.custom<typeof courses.$inferSelect & {
          modules: (typeof modules.$inferSelect & { lessons: typeof lessons.$inferSelect[] })[],
          assignments: typeof assignments.$inferSelect[],
          completedLessonIds: number[]
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/courses',
      input: insertCourseSchema.extend({
        organizationId: z.number().optional(),
        instructorId: z.number().optional(),
      }),
      responses: {
        201: z.custom<typeof courses.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/courses/:id',
      input: insertCourseSchema.partial(),
      responses: {
        200: z.custom<typeof courses.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },

  // === MODULES & LESSONS ===
  modules: {
    create: {
      method: 'POST' as const,
      path: '/api/courses/:courseId/modules',
      input: insertModuleSchema.omit({ courseId: true }),
      responses: {
        201: z.custom<typeof modules.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  lessons: {
    create: {
      method: 'POST' as const,
      path: '/api/modules/:moduleId/lessons',
      input: insertLessonSchema.omit({ moduleId: true }),
      responses: {
        201: z.custom<typeof lessons.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },

  // === LESSON COMPLETIONS ===
  lessonCompletions: {
    update: {
      method: 'POST' as const,
      path: '/api/courses/:courseId/lessons/:lessonId/complete',
      input: z.object({ completed: z.boolean() }),
      responses: {
        200: z.object({ success: z.boolean(), xpGained: z.number().optional() }),
        403: errorSchemas.unauthorized,
      },
    },
  },

  // === ASSIGNMENTS & SUBMISSIONS ===
  assignments: {
    create: {
      method: 'POST' as const,
      path: '/api/courses/:courseId/assignments',
      input: insertAssignmentSchema.omit({ courseId: true }),
      responses: {
        201: z.custom<typeof assignments.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/assignments/:assignmentId/submissions',
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect & { student: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/assignments/:assignmentId/submit',
      input: insertSubmissionSchema.omit({ assignmentId: true, studentId: true }),
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    grade: {
      method: 'PATCH' as const,
      path: '/api/submissions/:id/grade',
      input: gradeSubmissionSchema,
      responses: {
        200: z.custom<typeof submissions.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },





  // === COMMENTS ===
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/lessons/:lessonId/comments',
      responses: {
        200: z.array(z.custom<typeof comments.$inferSelect & { user: typeof users.$inferSelect; replies: (typeof comments.$inferSelect & { user: typeof users.$inferSelect })[] }>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/lessons/:lessonId/comments',
      input: insertCommentSchema.pick({ content: true, parentId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/comments/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        403: errorSchemas.unauthorized,
      },
    },
  },

  // === ADMIN ===
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalCourses: z.number(),
          totalEnrollments: z.number(),
        }),
        403: errorSchemas.unauthorized,
      },
    },

    users: {
      create: {
        method: "POST" as const,
        path: "/api/admin/users",
        input: z.object({
          username: z.string().min(3),
          password: z.string().min(6),
          name: z.string().min(2),
          email: z.string().email(),
          role: z.enum(["org_admin", "instructor", "ta", "student"]),
          organizationId: z.number().optional()
        }),
        responses: {
          201: z.custom<typeof users.$inferSelect>(),
          403: errorSchemas.unauthorized,
          400: errorSchemas.validation
        }
      },
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
          403: errorSchemas.unauthorized,
        },
      },
      updateRole: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id/role',
        input: z.object({ role: z.enum(["student", "instructor", "ta", "super_admin", "org_admin"]) }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          403: errorSchemas.unauthorized,
        },
      },
    },
    reports: {
      progress: {
        method: 'GET' as const,
        path: '/api/admin/reports/progress',
        responses: {
          200: z.array(z.object({
            user: z.custom<typeof users.$inferSelect>(),
            course: z.custom<typeof courses.$inferSelect>(),
            progress: z.number(),
            completed: z.boolean(),
            enrolledAt: z.string().nullable(),
          })),
          403: errorSchemas.unauthorized,
        },
      },
    },
  },

  // === INSTRUCTOR REQUESTS ===
  instructorRequests: {
    create: {
      method: "POST" as const,
      path: "/api/instructor-requests",
      input: insertInstructorRequestSchema.pick({ bio: true }).extend({
        linkedinUrl: z.string().optional().or(z.literal(""))
      }),
      responses: {
        201: z.custom<typeof instructorRequests.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/admin/instructor-requests",
      responses: {
        200: z.array(z.custom<typeof instructorRequests.$inferSelect & { user: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized
      }
    },
    approve: {
      method: "POST" as const,
      path: "/api/admin/instructor-requests/:id/approve",
      responses: {
        200: z.custom<typeof instructorRequests.$inferSelect>(),
        403: errorSchemas.unauthorized
      }
    },
    reject: {
      method: "POST" as const,
      path: "/api/admin/instructor-requests/:id/reject",
      responses: {
        200: z.custom<typeof instructorRequests.$inferSelect>(),
        403: errorSchemas.unauthorized
      }
    }
  },

  // === ENROLLMENTS ===
  enrollments: {
    create: {
      method: 'POST' as const,
      path: '/api/courses/:courseId/enroll',
      input: z.object({ userId: z.number() }),
      responses: {
        201: z.custom<typeof enrollments.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    my: {
      method: 'GET' as const,
      path: '/api/my-enrollments',
      responses: {
        200: z.array(z.custom<typeof enrollments.$inferSelect & { course: typeof courses.$inferSelect }>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
