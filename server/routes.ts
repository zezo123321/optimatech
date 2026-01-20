import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth
  await setupAuth(app);

  // Middleware to sync Replit Auth user with our app's user table
  app.use(async (req: any, res, next) => {
    if (req.isAuthenticated() && req.user) {
      // Check if user exists in our DB, if not create/sync
      const replitId = req.user.claims.sub;
      let user = await storage.getUserByReplitId(replitId);
      
      if (!user) {
        // Create default user linked to Replit Auth
        const email = req.user.claims.email;
        const name = req.user.claims.name || `${req.user.claims.first_name} ${req.user.claims.last_name}`;
        
        // First user is super_admin, others students by default
        const allUsers = await db.select().from(users);
        const role = allUsers.length === 0 ? "super_admin" : "student";
        
        // Seed default org if needed
        let orgId = null;
        if (allUsers.length === 0) {
          const org = await storage.createOrganization({
            name: "Demo Organization",
            slug: "demo",
            logoUrl: "https://placehold.co/100x100"
          });
          orgId = org.id;
        } else {
          // Assign to demo org
          const demoOrg = await storage.getOrganizationBySlug("demo");
          if (demoOrg) orgId = demoOrg.id;
        }

        const [newUser] = await db.insert(users).values({
          replitId,
          email,
          name,
          role,
          organizationId: orgId
        }).returning();
        
        user = newUser;
      }
      
      // Attach our DB user to request
      req.dbUser = user;
    }
    next();
  });

  // Auth Middleware for routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // === USERS ===
  app.get(api.users.me.path, requireAuth, (req: any, res) => {
    res.json(req.dbUser);
  });

  app.patch(api.users.update.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(req.dbUser.id, input);
      res.json(user);
    } catch (error) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  // === ORGANIZATIONS ===
  app.get(api.organizations.get.path, async (req, res) => {
    const org = await storage.getOrganizationBySlug(req.params.slug);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json(org);
  });

  app.get(api.organizations.analytics.path, requireAuth, async (req, res) => {
    // Only allow org admins or super admins
    // (Simulated check)
    const analytics = await storage.getOrgAnalytics(Number(req.params.id));
    res.json(analytics);
  });

  // === COURSES ===
  app.get(api.courses.list.path, async (req, res) => {
    const orgId = req.query.organizationId ? Number(req.query.organizationId) : undefined;
    const courses = await storage.getCourses(orgId);
    res.json(courses);
  });

  app.get(api.courses.get.path, async (req, res) => {
    const course = await storage.getCourse(Number(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  });

  app.post(api.courses.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.courses.create.input.parse(req.body);
      // Force org/instructor from auth context
      const course = await storage.createCourse({
        ...input,
        organizationId: req.dbUser.organizationId!,
        instructorId: req.dbUser.id
      });
      res.status(201).json(course);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch(api.courses.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.courses.update.input.parse(req.body);
      const course = await storage.updateCourse(Number(req.params.id), input);
      res.json(course);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === MODULES & LESSONS ===
  app.post(api.modules.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.modules.create.input.parse(req.body);
      const module = await storage.createModule({
        ...input,
        courseId: Number(req.params.courseId)
      });
      res.status(201).json(module);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.lessons.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.lessons.create.input.parse(req.body);
      const lesson = await storage.createLesson({
        ...input,
        moduleId: Number(req.params.moduleId)
      });
      res.status(201).json(lesson);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === ENROLLMENTS ===
  app.post(api.enrollments.create.path, requireAuth, async (req: any, res) => {
    const enrollment = await storage.createEnrollment(req.body.userId, Number(req.params.courseId));
    res.status(201).json(enrollment);
  });

  app.get(api.enrollments.my.path, requireAuth, async (req: any, res) => {
    const enrollments = await storage.getUserEnrollments(req.dbUser.id);
    res.json(enrollments);
  });

  // === ASSIGNMENTS & SUBMISSIONS ===
  app.post(api.assignments.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.assignments.create.input.parse(req.body);
      const assignment = await storage.createAssignment({
        ...input,
        courseId: Number(req.params.courseId)
      });
      res.status(201).json(assignment);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.submissions.list.path, requireAuth, async (req, res) => {
    const submissions = await storage.getSubmissions(Number(req.params.assignmentId));
    res.json(submissions);
  });

  app.post(api.submissions.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      const submission = await storage.createSubmission({
        ...input,
        assignmentId: Number(req.params.assignmentId),
        studentId: req.dbUser.id
      });
      res.status(201).json(submission);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.submissions.grade.path, requireAuth, async (req, res) => {
    try {
      const input = api.submissions.grade.input.parse(req.body);
      const submission = await storage.gradeSubmission(Number(req.params.id), input);
      res.json(submission);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Seed Data function (safe to run multiple times, checks existence)
  await seedData();

  return httpServer;
}

async function seedData() {
  // Only seed if no organizations exist
  const existingOrg = await storage.getOrganizationBySlug("demo");
  if (!existingOrg) {
    console.log("Seeding data...");
    
    // Create Org
    const org = await storage.createOrganization({
      name: "Tadreeb Training Center",
      slug: "demo",
      logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop"
    });

    // Note: Users are created on first login via Replit Auth hook above
    // We cannot easily mock a Replit Auth user here without bypassing the auth middleware.
    // Instead, we will rely on the first logged-in user becoming Super Admin.
    
    // Create a demo course (we need an instructor ID, but since users are dynamic,
    // we might need to skip course creation until a user exists, or create a dummy user
    // that isn't linked to Replit Auth just for data display)
    
    // Create a system instructor for demo content
    const [instructor] = await db.insert(users).values({
      email: "instructor@tadreeb.link",
      name: "Demo Instructor",
      role: "instructor",
      organizationId: org.id,
      replitId: "system_demo_instructor"
    }).returning();

    const course = await storage.createCourse({
      organizationId: org.id,
      instructorId: instructor.id,
      title: "Introduction to Project Management",
      description: "Learn the basics of project management, agile methodologies, and team leadership.",
      thumbnailUrl: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800&q=80",
      published: true
    });

    const mod1 = await storage.createModule({
      courseId: course.id,
      title: "Module 1: Foundations",
      order: 1
    });

    await storage.createLesson({
      moduleId: mod1.id,
      title: "What is a Project?",
      type: "video",
      contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      order: 1
    });

    await storage.createLesson({
      moduleId: mod1.id,
      title: "Project Life Cycle PDF",
      type: "pdf",
      contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      order: 2
    });

    await storage.createAssignment({
      courseId: course.id,
      title: "Project Charter Draft",
      description: "Create a draft project charter for a hypothetical mobile app project.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      maxScore: 100
    });
    
    console.log("Seeding complete!");
  }
}
