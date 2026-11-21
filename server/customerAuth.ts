import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import { customers, customerSessions, type Customer } from "../drizzle/schema";
import { getDb } from "./db";
import { createCustomerSession, CUSTOMER_SESSION_COOKIE, hashCustomerSessionToken, isCustomer, readCustomerSessionToken, sessionCookieOptions } from "./customerSession";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const scrypt = promisify(scryptCallback);

function publicCustomer(customer: Customer) {
  const { passwordHash: _hash, passwordSalt: _salt, ...safe } = customer;
  return safe;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return { passwordSalt: salt, passwordHash: derived.toString("hex") };
}

async function verifyPassword(password: string, customer: Customer) {
  const candidate = await scrypt(password, customer.passwordSalt, 64) as Buffer;
  const stored = Buffer.from(customer.passwordHash, "hex");
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

const passwordSchema = z.string().min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.").max(128).regex(/[0-9]/, "أضف رقمًا واحدًا على الأقل إلى كلمة المرور.");

export const customerAuthRouter = router({
  me: publicProcedure.query(({ ctx }) => isCustomer(ctx.user) ? publicCustomer(ctx.user) : null),
  register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().toLowerCase().email().max(320), password: passwordSchema })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, input.email)).limit(1);
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "يوجد حساب مسجّل بالفعل بهذا البريد الإلكتروني." });
    const password = await hashPassword(input.password);
    const [record] = await db.insert(customers).values({ name: input.name, email: input.email, ...password }).$returningId();
    const [customer] = await db.select().from(customers).where(eq(customers.id, record.id)).limit(1);
    if (!customer) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الحساب." });
    await createCustomerSession(customer, ctx.res);
    return publicCustomer(customer);
  }),
  login: publicProcedure.input(z.object({ email: z.string().trim().toLowerCase().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [customer] = await db.select().from(customers).where(eq(customers.email, input.email)).limit(1);
    if (!customer || !(await verifyPassword(input.password, customer))) throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحين." });
    await db.update(customers).set({ lastSignedIn: new Date() }).where(eq(customers.id, customer.id));
    await createCustomerSession(customer, ctx.res);
    return publicCustomer(customer);
  }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = readCustomerSessionToken(ctx.req.headers.cookie);
    const db = await getDb();
    if (token && db) await db.delete(customerSessions).where(eq(customerSessions.tokenHash, hashCustomerSessionToken(decodeURIComponent(token))));
    ctx.res.clearCookie(CUSTOMER_SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: 0 });
    return { success: true } as const;
  }),
  changePassword: protectedProcedure.input(z.object({ currentPassword: z.string().min(1).max(128), newPassword: passwordSchema })).mutation(async ({ ctx, input }) => {
    if (!isCustomer(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "هذه العملية متاحة لحسابات العملاء فقط." });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [customer] = await db.select().from(customers).where(eq(customers.id, ctx.user.id)).limit(1);
    if (!customer || !(await verifyPassword(input.currentPassword, customer))) throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة." });
    const password = await hashPassword(input.newPassword);
    await db.update(customers).set(password).where(eq(customers.id, customer.id));
    await db.delete(customerSessions).where(eq(customerSessions.customerId, customer.id));
    await createCustomerSession({ ...customer, ...password }, ctx.res);
    return { success: true } as const;
  }),
});
