import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { customers, customerSessions, type Admin, type Customer, type User } from "../drizzle/schema";
import { getDb } from "./db";

export const CUSTOMER_SESSION_COOKIE = "gamepay_session";
const SESSION_DAYS = 14;

export type StoreActor = Customer | User | Admin;

export function isCustomer(actor: StoreActor | null): actor is Customer {
  return Boolean(actor && "passwordHash" in actor && !("mustChangePassword" in actor));
}

export function sessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 };
}

export function hashCustomerSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readCustomerSessionToken(cookieHeader?: string) {
  return cookieHeader?.match(new RegExp(`(?:^|;\\s*)${CUSTOMER_SESSION_COOKIE}=([^;]+)`))?.[1] ?? null;
}

export async function createCustomerSession(customer: Customer, res: { cookie: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => unknown }) {
  const db = await getDb();
  if (!db) throw new Error("تعذر إنشاء الجلسة حاليًا.");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(customerSessions).values({ customerId: customer.id, tokenHash: hashCustomerSessionToken(token), expiresAt });
  res.cookie(CUSTOMER_SESSION_COOKIE, token, sessionCookieOptions());
}

export async function getCustomerFromSession(cookieHeader?: string): Promise<Customer | null> {
  const token = readCustomerSessionToken(cookieHeader);
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({ customer: customers }).from(customerSessions).innerJoin(customers, eq(customerSessions.customerId, customers.id)).where(and(eq(customerSessions.tokenHash, hashCustomerSessionToken(decodeURIComponent(token))), gt(customerSessions.expiresAt, new Date()))).limit(1);
  return result?.customer ?? null;
}
