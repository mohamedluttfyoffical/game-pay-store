import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { admins, adminSessions, type Admin } from "../drizzle/schema";
import { getDb } from "./db";
import type { StoreActor } from "./customerSession";

export const ADMIN_SESSION_COOKIE = "gamepay_admin_session";
const SESSION_DAYS = 7;

export function isAdminAccount(actor: StoreActor | null): actor is Admin {
  return Boolean(actor && "mustChangePassword" in actor);
}

export function adminSessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 };
}

export function hashAdminSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readAdminSessionToken(cookieHeader?: string) {
  return cookieHeader?.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1] ?? null;
}

export async function createAdminSession(admin: Admin, res: { cookie: (name: string, value: string, options: ReturnType<typeof adminSessionCookieOptions>) => unknown }) {
  const db = await getDb();
  if (!db) throw new Error("تعذر إنشاء جلسة المسؤول حاليًا.");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(adminSessions).values({ adminId: admin.id, tokenHash: hashAdminSessionToken(token), expiresAt });
  res.cookie(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
}

export async function getAdminFromSession(cookieHeader?: string): Promise<Admin | null> {
  const token = readAdminSessionToken(cookieHeader);
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({ admin: admins }).from(adminSessions).innerJoin(admins, eq(adminSessions.adminId, admins.id)).where(and(eq(adminSessions.tokenHash, hashAdminSessionToken(decodeURIComponent(token))), gt(adminSessions.expiresAt, new Date()))).limit(1);
  return result?.admin ?? null;
}
