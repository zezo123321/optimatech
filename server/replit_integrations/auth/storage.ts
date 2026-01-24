import { users, type User, type InsertUser as UpsertUser } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const userId = parseInt(id);
    if (isNaN(userId)) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const dataToInsert = { ...userData };
    if (!dataToInsert.userCode) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      const { randomBytes } = await import("crypto");
      const randomValues = randomBytes(6);
      for (let i = 0; i < 6; i++) {
        code += chars[randomValues[i] % chars.length];
      }
      dataToInsert.userCode = code;
    }

    const [user] = await db
      .insert(users)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: users.username, // Fallback to username since ID isn't in InsertUser
        set: dataToInsert,
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
