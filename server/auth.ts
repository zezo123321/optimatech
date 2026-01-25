import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as DbUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "optional_secret_for_dev",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
        cookie: {
            secure: app.get("env") === "production",
            sameSite: app.get("env") === "production" ? "none" : "lax",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    };


    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        "local", // Explicitly naming it 'local'
        new LocalStrategy(async (username, password, done) => {
            // In our case, 'username' is the 'Code'
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !(await comparePasswords(password, user.password))) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => done(null, (user as DbUser).id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Simple route registration for auth interactions
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.status(200).json(req.user);
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            // "Hybrid" Onboarding Logic
            let orgId: number;
            const accessCode = req.body.accessCode;

            if (accessCode) {
                // B2B Path: Validate Access Code
                const org = await storage.getOrganizationByAccessCode(accessCode);
                if (!org) {
                    return res.status(400).json({ message: "Invalid Access Code" });
                }
                orgId = org.id;
            } else {
                // B2C Path: Independent User (No Organization)
                // We leave orgId undefined/null. Schema allows this (users.organizationId is nullable).
                // orgId remains undefined here.
            }

            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
                role: "student", // B2C users default to student always
                organizationId: orgId! // Will be undefined if B2C, which Drizzle/PG handles as NULL if column implies
            });

            // Auto-login after register
            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    // Fallback for direct navigation or legacy clients
    app.get("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.redirect("/");
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
