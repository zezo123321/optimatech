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
  users, organizations, courses, modules, lessons, enrollments, assignments, submissions
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
          assignments: typeof assignments.$inferSelect[] 
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/courses',
      input: insertCourseSchema,
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
