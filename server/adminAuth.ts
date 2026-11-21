import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import { admins, adminSessions, type Admin } from "../drizzle/schema";
import { createAdminSession, ADMIN_SESSION_COOKIE, adminSessionCookieOptions, hashAdminSessionToken, isAdminAccount, readAdminSessionToken } from "./adminSession";
import { getDb } from "./db";
import { adminSessionProcedure, publicProcedure, router } from "./_core/trpc";

const scrypt = promisify(scryptCallback);
const INITIAL_EMAIL = "admin@gamepay";
const INITIAL_PASSWORD = "admin";
const passwordSchema = z.string().min(8, "استخدم كلمة مرور من 8 أحرف على الأقل.").max(128).regex(/[0-9]/, "أضف رقمًا واحدًا على الأقل إلى كلمة المرور.");

function publicAdmin(admin: Admin) { const { passwordHash: _hash, passwordSalt: _salt, ...safe } = admin; return safe; }
async function hashPassword(password: string) { const passwordSalt = randomBytes(16).toString("hex"); const value = await scrypt(password, passwordSalt, 64) as Buffer; return { passwordSalt, passwordHash: value.toString("hex") }; }
async function verifyPassword(password: string, admin: Admin) { const candidate = await scrypt(password, admin.passwordSalt, 64) as Buffer; const stored = Buffer.from(admin.passwordHash, "hex"); return stored.length === candidate.length && timingSafeEqual(stored, candidate); }

async function ensureInitialAdmin() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  const [existing] = await db.select().from(admins).where(eq(admins.email, INITIAL_EMAIL)).limit(1);
  if (existing) return existing;
  const credentials = await hashPassword(INITIAL_PASSWORD);
  const [record] = await db.insert(admins).values({ name: "Game Pay Admin", email: INITIAL_EMAIL, ...credentials, mustChangePassword: true }).$returningId();
  const [created] = await db.select().from(admins).where(eq(admins.id, record.id)).limit(1);
  if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إعداد حساب المسؤول الأولي." });
  return created;
}

export const adminAuthRouter = router({
  me: publicProcedure.query(({ ctx }) => isAdminAccount(ctx.user) ? publicAdmin(ctx.user) : null),
  login: publicProcedure.input(z.object({ email: z.string().trim().toLowerCase().min(3).max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    await ensureInitialAdmin();
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [admin] = await db.select().from(admins).where(eq(admins.email, input.email)).limit(1);
    if (!admin || !(await verifyPassword(input.password, admin))) throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحين." });
    await db.update(admins).set({ lastSignedIn: new Date() }).where(eq(admins.id, admin.id));
    await createAdminSession(admin, ctx.res);
    return publicAdmin(admin);
  }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = readAdminSessionToken(ctx.req.headers.cookie); const db = await getDb();
    if (token && db) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashAdminSessionToken(decodeURIComponent(token))));
    ctx.res.clearCookie(ADMIN_SESSION_COOKIE, { ...adminSessionCookieOptions(), maxAge: 0 });
    return { success: true } as const;
  }),
  changePassword: adminSessionProcedure.input(z.object({ currentPassword: z.string().min(1).max(128).optional(), newPassword: passwordSchema })).mutation(async ({ ctx, input }) => {
    if (!isAdminAccount(ctx.user)) throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [admin] = await db.select().from(admins).where(eq(admins.id, ctx.user.id)).limit(1);
    if (!admin) throw new TRPCError({ code: "UNAUTHORIZED" });
    if (!admin.mustChangePassword && (!input.currentPassword || !(await verifyPassword(input.currentPassword, admin)))) throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة." });
    const credentials = await hashPassword(input.newPassword);
    await db.update(admins).set({ ...credentials, mustChangePassword: false }).where(eq(admins.id, admin.id));
    await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
    await createAdminSession({ ...admin, ...credentials, mustChangePassword: false }, ctx.res);
    return { success: true } as const;
  }),
});
