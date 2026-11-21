import { and, desc, eq, sql } from "drizzle-orm";
import {
  customers,
  customerWallets,
  notifications,
  walletTopupMethods,
  walletTopupRequests,
  walletTransactions,
} from "../drizzle/schema";
import { getDb } from "./db";

const DEFAULT_TOPUP_METHODS = [
  { code: "vodafone_cash", name: "فودافون كاش", description: "تحويل يدوي ثم مراجعة فريق المتجر.", instructions: "أضف رقم التحويل وتعليمات التأكيد من لوحة الإدارة قبل تفعيل هذه الوسيلة.", enabled: false, sortOrder: 10 },
  { code: "orange_money", name: "أورنج موني", description: "تحويل يدوي ثم مراجعة فريق المتجر.", instructions: "أضف رقم التحويل وتعليمات التأكيد من لوحة الإدارة قبل تفعيل هذه الوسيلة.", enabled: false, sortOrder: 20 },
  { code: "etisalat_cash", name: "اتصالات كاش", description: "تحويل يدوي ثم مراجعة فريق المتجر.", instructions: "أضف رقم التحويل وتعليمات التأكيد من لوحة الإدارة قبل تفعيل هذه الوسيلة.", enabled: false, sortOrder: 30 },
  { code: "instapay", name: "إنستاباي", description: "تحويل يدوي ثم مراجعة فريق المتجر.", instructions: "أضف عنوان أو بيانات التحويل وتعليمات التأكيد من لوحة الإدارة قبل تفعيل هذه الوسيلة.", enabled: false, sortOrder: 40 },
  { code: "customer_service", name: "خدمة العملاء", description: "طلب شحن تتم مراجعته بواسطة فريق الدعم.", instructions: "أضف رابط أو تعليمات التواصل مع خدمة العملاء من لوحة الإدارة قبل تفعيل هذه الوسيلة.", enabled: false, sortOrder: 50 },
] as const;

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا.");
  return db;
}

async function ensureTopupMethods() {
  const db = await requireDb();
  const existing = await db.select({ id: walletTopupMethods.id }).from(walletTopupMethods).limit(1);
  if (!existing.length) await db.insert(walletTopupMethods).values([...DEFAULT_TOPUP_METHODS]);
  return db;
}

async function ensureCustomerWallet(db: any, customerId: number) {
  await db.insert(customerWallets).values({ customerId, balance: "0.00" }).onDuplicateKeyUpdate({ set: { customerId } });
  const [wallet] = await db.select().from(customerWallets).where(eq(customerWallets.customerId, customerId)).limit(1);
  if (!wallet) throw new Error("تعذر تجهيز محفظتك حاليًا.");
  return wallet;
}

export async function getCustomerWallet(customerId: number) {
  const db = await requireDb();
  const wallet = await ensureCustomerWallet(db, customerId);
  const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.customerId, customerId)).orderBy(desc(walletTransactions.createdAt)).limit(20);
  return { wallet, transactions };
}

export async function listWalletTopupMethods() {
  const db = await ensureTopupMethods();
  return db.select().from(walletTopupMethods).where(eq(walletTopupMethods.enabled, true)).orderBy(walletTopupMethods.sortOrder, walletTopupMethods.name);
}

export async function getCustomerTopupRequests(customerId: number) {
  const db = await ensureTopupMethods();
  const rows = await db
    .select({ request: walletTopupRequests, method: walletTopupMethods })
    .from(walletTopupRequests)
    .innerJoin(walletTopupMethods, eq(walletTopupRequests.methodId, walletTopupMethods.id))
    .where(eq(walletTopupRequests.customerId, customerId))
    .orderBy(desc(walletTopupRequests.createdAt));
  return rows.map(({ request, method }) => ({ ...request, method: { id: method.id, name: method.name, code: method.code } }));
}

export async function createWalletTopupRequest(input: { customerId: number; methodId: number; amount: number; reference?: string; customerNote?: string }) {
  const db = await ensureTopupMethods();
  const [method] = await db.select().from(walletTopupMethods).where(and(eq(walletTopupMethods.id, input.methodId), eq(walletTopupMethods.enabled, true))).limit(1);
  if (!method) throw new Error("طريقة الشحن المختارة غير متاحة حاليًا.");
  const [created] = await db.insert(walletTopupRequests).values({
    customerId: input.customerId,
    methodId: method.id,
    amount: input.amount.toFixed(2),
    reference: input.reference?.trim() || null,
    customerNote: input.customerNote?.trim() || null,
  }).$returningId();
  return { id: created.id, methodName: method.name };
}

export async function listAdminWalletTopups() {
  const db = await ensureTopupMethods();
  const rows = await db
    .select({ request: walletTopupRequests, method: walletTopupMethods, customer: customers })
    .from(walletTopupRequests)
    .innerJoin(walletTopupMethods, eq(walletTopupRequests.methodId, walletTopupMethods.id))
    .innerJoin(customers, eq(walletTopupRequests.customerId, customers.id))
    .orderBy(desc(walletTopupRequests.createdAt));
  return rows.map(({ request, method, customer }) => ({
    ...request,
    method: { id: method.id, name: method.name, code: method.code },
    customer: { id: customer.id, name: customer.name, email: customer.email },
  }));
}

export async function listAdminWalletTopupMethods() {
  const db = await ensureTopupMethods();
  return db.select().from(walletTopupMethods).orderBy(walletTopupMethods.sortOrder, walletTopupMethods.name);
}

export async function saveWalletTopupMethod(input: {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
  instructions: string;
  enabled: boolean;
  sortOrder: number;
}) {
  const db = await ensureTopupMethods();
  const { id, ...values } = input;
  if (id) {
    await db.update(walletTopupMethods).set(values).where(eq(walletTopupMethods.id, id));
    return { id };
  }
  const [created] = await db.insert(walletTopupMethods).values(values).$returningId();
  return { id: created.id };
}

export async function reviewWalletTopup(input: { id: number; adminId: number; status: "approved" | "rejected"; adminNote?: string }) {
  const db = await requireDb();
  return db.transaction(async tx => {
    const [request] = await tx.select().from(walletTopupRequests).where(eq(walletTopupRequests.id, input.id)).limit(1);
    if (!request) throw new Error("طلب الشحن غير موجود.");
    if (request.status !== "pending") throw new Error("تمت مراجعة طلب الشحن بالفعل.");

    const [updateResult] = await tx
      .update(walletTopupRequests)
      .set({ status: input.status, adminNote: input.adminNote?.trim() || null, reviewedBy: input.adminId, reviewedAt: new Date() })
      .where(and(eq(walletTopupRequests.id, request.id), eq(walletTopupRequests.status, "pending")));
    if (!updateResult.affectedRows) throw new Error("تمت مراجعة طلب الشحن بالفعل.");

    if (input.status === "approved") {
      const wallet = await ensureCustomerWallet(tx, request.customerId);
      const nextBalance = Number(wallet.balance) + Number(request.amount);
      await tx.update(customerWallets).set({ balance: nextBalance.toFixed(2) }).where(eq(customerWallets.id, wallet.id));
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        customerId: request.customerId,
        topupRequestId: request.id,
        orderId: null,
        type: "topup",
        amount: Number(request.amount).toFixed(2),
        balanceAfter: nextBalance.toFixed(2),
        description: "شحن محفظة معتمد",
      });
    }

    await tx.insert(notifications).values({
      userId: null,
      customerId: request.customerId,
      type: input.status === "approved" ? "wallet_topup_approved" : "wallet_topup_rejected",
      title: input.status === "approved" ? "تم شحن محفظتك" : "تمت مراجعة طلب شحن المحفظة",
      message: input.status === "approved" ? `تمت إضافة ${request.amount} ج.م إلى رصيد محفظتك.` : "تعذر اعتماد طلب الشحن. راجع الملاحظة أو تواصل مع فريق المتجر.",
      orderId: null,
    });
    return { success: true, customerId: request.customerId };
  });
}

export async function cancelWalletTopupRequest(customerId: number, id: number) {
  const db = await requireDb();
  const [result] = await db.update(walletTopupRequests).set({ status: "cancelled" }).where(and(eq(walletTopupRequests.id, id), eq(walletTopupRequests.customerId, customerId), eq(walletTopupRequests.status, "pending")));
  if (!result.affectedRows) throw new Error("لا يمكن إلغاء هذا الطلب.");
  return { success: true };
}

export async function debitWalletForOrder(tx: any, input: { customerId: number; orderId: number; amount: number; reference: string }) {
  const wallet = await ensureCustomerWallet(tx, input.customerId);
  const currentBalance = Number(wallet.balance);
  if (!Number.isFinite(currentBalance) || currentBalance < input.amount) throw new Error("رصيد المحفظة غير كافٍ لإتمام هذا الطلب.");
  const nextBalance = currentBalance - input.amount;
  const [updated] = await tx
    .update(customerWallets)
    .set({ balance: nextBalance.toFixed(2) })
    .where(and(eq(customerWallets.id, wallet.id), sql`${customerWallets.balance} >= ${input.amount.toFixed(2)}`));
  if (!updated.affectedRows) throw new Error("تعذر خصم الرصيد، يرجى المحاولة مرة أخرى.");
  await tx.insert(walletTransactions).values({
    walletId: wallet.id,
    customerId: input.customerId,
    topupRequestId: null,
    orderId: input.orderId,
    type: "purchase",
    amount: (-input.amount).toFixed(2),
    balanceAfter: nextBalance.toFixed(2),
    description: `دفع الطلب ${input.reference}`,
  });
}
