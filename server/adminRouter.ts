import { TRPCError } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { coupons, gameAccounts, notifications, paymentMethods, productImages, products, storeAssets, storeOrders } from "../drizzle/schema";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { adminProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getAdminDashboard } from "./storeDb";
import { listAdminWalletTopupMethods, listAdminWalletTopups, reviewWalletTopup, saveWalletTopupMethod } from "./walletDb";

const productInput = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().min(3).max(140),
  name: z.string().trim().min(3).max(220),
  gameSlug: z.string().trim().min(2).max(80),
  type: z.enum(["topup", "digital", "account"]),
  shortDescription: z.string().trim().min(5).max(420).optional(),
  description: z.string().trim().min(10).max(2000),
  details: z.string().trim().min(10).max(4000),
  useInstructions: z.string().trim().min(5).max(2000),
  deliveryEta: z.string().trim().min(2).max(120),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  discountPercent: z.number().int().min(0).max(100),
  sku: z.string().trim().min(2).max(120).optional(),
  stock: z.number().int().min(0).max(100000),
  status: z.enum(["active", "inactive", "draft", "sold_out"]),
  imageUrl: z.string().max(2000).nullable().optional(),
  imageKey: z.string().max(500).nullable().optional(),
  images: z.array(z.object({ imageUrl: z.string().min(1).max(2000), imageKey: z.string().min(1).max(500), isPrimary: z.boolean().optional() })).max(8).optional(),
  sensitiveDelivery: z.string().max(4000).nullable().optional(),
  seoTitle: z.string().trim().min(2).max(220).nullable().optional(),
  featured: z.boolean(),
  popular: z.boolean(),
});

const uploadImageInput = z.object({
  filename: z.string().min(1).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataUrl: z.string().max(4_200_000),
});

async function uploadImage(input: z.infer<typeof uploadImageInput>, userId: number, folder: "products" | "store-assets" | "branding") {
  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== input.mimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "صيغة الصورة غير صالحة." });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 3 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "الحد الأقصى للصورة هو 3 ميغابايت." });
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return storagePut(`${folder}/${userId}/${Date.now()}-${safeName}`, bytes, input.mimeType);
}

export const adminRouter = router({
  dashboard: adminProcedure.query(() => getAdminDashboard()),
  products: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [records, imageRows] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      db.select().from(productImages).orderBy(productImages.sortOrder),
    ]);
    const imagesByProduct = new Map<number, typeof imageRows>();
    imageRows.forEach(image => imagesByProduct.set(image.productId, [...(imagesByProduct.get(image.productId) ?? []), image]));
    return records.map(product => {
      const savedImages = imagesByProduct.get(product.id) ?? [];
      const images = savedImages.length ? savedImages.map(image => ({ imageUrl: image.imageUrl, imageKey: image.imageKey, isPrimary: image.isPrimary })) : product.imageUrl && product.imageKey ? [{ imageUrl: product.imageUrl, imageKey: product.imageKey, isPrimary: true }] : [];
      return { ...product, images };
    });
  }),
  saveProduct: adminProcedure.input(productInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const { id, images: inputImages, ...payload } = input;
    const uniqueImages = inputImages === undefined ? undefined : Array.from(new Map(inputImages.map(image => [image.imageKey, image])).values()).map((image, sortOrder) => ({ ...image, sortOrder, isPrimary: image.isPrimary === true })).slice(0, 8);
    const primaryImage = uniqueImages?.find(image => image.isPrimary) ?? uniqueImages?.[0] ?? null;
    const values = { ...payload, imageUrl: primaryImage?.imageUrl ?? payload.imageUrl ?? null, imageKey: primaryImage?.imageKey ?? payload.imageKey ?? null, shortDescription: payload.shortDescription || payload.description.slice(0, 420), sku: payload.sku || null, price: payload.price.toFixed(2), compareAtPrice: payload.compareAtPrice === null || payload.compareAtPrice === undefined ? null : payload.compareAtPrice.toFixed(2), costPrice: payload.costPrice === null || payload.costPrice === undefined ? null : payload.costPrice.toFixed(2), seoTitle: payload.seoTitle || null };
    if (id) {
      await db.transaction(async tx => {
        await tx.update(products).set(values).where(eq(products.id, id));
        if (uniqueImages !== undefined) {
          await tx.delete(productImages).where(eq(productImages.productId, id));
          if (uniqueImages.length) await tx.insert(productImages).values(uniqueImages.map(image => ({ productId: id, imageUrl: image.imageUrl, imageKey: image.imageKey, sortOrder: image.sortOrder, isPrimary: image.isPrimary || image.imageKey === primaryImage?.imageKey })));
        }
      });
      return { id, updated: true };
    }
    const [created] = await db.transaction(async tx => {
      const [createdProduct] = await tx.insert(products).values(values).$returningId();
      if (uniqueImages?.length) await tx.insert(productImages).values(uniqueImages.map(image => ({ productId: createdProduct.id, imageUrl: image.imageUrl, imageKey: image.imageKey, sortOrder: image.sortOrder, isPrimary: image.isPrimary || image.imageKey === primaryImage?.imageKey })));
      return [createdProduct];
    });
    return { id: created.id, updated: false };
  }),
  deleteProduct: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    await db.delete(products).where(eq(products.id, input.id));
    return { success: true };
  }),
  uploadProductImage: adminProcedure.input(uploadImageInput).mutation(({ ctx, input }) => uploadImage(input, ctx.user.id, "products")),
  accounts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({ account: gameAccounts, product: products }).from(gameAccounts).innerJoin(products, eq(gameAccounts.productId, products.id)).orderBy(desc(gameAccounts.updatedAt));
  }),
  saveAccount: adminProcedure.input(z.object({ productId: z.number().int().positive(), level: z.string().trim().min(1).max(80), highlights: z.string().trim().min(2).max(1000), accountStatus: z.enum(["available", "sold"]), price: z.number().min(0) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
    if (!product || product.type !== "account") throw new TRPCError({ code: "BAD_REQUEST", message: "اختر منتجًا من نوع حساب ألعاب أولًا." });
    await db.transaction(async tx => {
      await tx.insert(gameAccounts).values({ productId: input.productId, level: input.level, highlights: input.highlights, accountStatus: input.accountStatus }).onDuplicateKeyUpdate({ set: { level: input.level, highlights: input.highlights, accountStatus: input.accountStatus } });
      await tx.update(products).set({ price: input.price.toFixed(2), stock: input.accountStatus === "available" ? 1 : 0, status: input.accountStatus === "available" ? "active" : "sold_out" }).where(eq(products.id, input.productId));
    });
    return { success: true };
  }),
  deleteAccount: adminProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    await db.transaction(async tx => {
      await tx.delete(gameAccounts).where(eq(gameAccounts.productId, input.productId));
      await tx.update(products).set({ stock: 0, status: "draft" }).where(eq(products.id, input.productId));
    });
    return { success: true };
  }),
  assets: adminProcedure.query(async () => {
    const db = await getDb();
    return db ? db.select().from(storeAssets).orderBy(desc(storeAssets.updatedAt)) : [];
  }),
  uploadAssetImage: adminProcedure.input(uploadImageInput).mutation(({ ctx, input }) => uploadImage(input, ctx.user.id, "store-assets")),
  uploadBrandImage: adminProcedure.input(uploadImageInput).mutation(({ ctx, input }) => uploadImage(input, ctx.user.id, "branding")),
  saveAsset: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), category: z.enum(["logo", "banner", "product", "general"]), slot: z.string().trim().min(2).max(80), title: z.string().trim().min(2).max(160), imageUrl: z.string().min(1).max(2000), imageKey: z.string().min(1).max(500), isActive: z.boolean() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const { id, ...values } = input;
    if (id) { await db.update(storeAssets).set(values).where(eq(storeAssets.id, id)); return { id }; }
    const [created] = await db.insert(storeAssets).values(values).$returningId();
    return { id: created.id };
  }),
  orders: adminProcedure.query(async () => {
    const db = await getDb();
    return db ? db.select().from(storeOrders).orderBy(desc(storeOrders.createdAt)) : [];
  }),
  customers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        customerId: storeOrders.customerId,
        customerName: storeOrders.customerName,
        customerEmail: storeOrders.customerEmail,
        customerPhone: storeOrders.customerPhone,
        orderCount: sql<number>`count(${storeOrders.id})`,
        totalSpent: sql<string>`sum(${storeOrders.total})`,
      })
      .from(storeOrders)
      .groupBy(storeOrders.customerId, storeOrders.customerName, storeOrders.customerEmail, storeOrders.customerPhone)
      .orderBy(desc(sql`max(${storeOrders.createdAt})`));
  }),
  updateOrder: adminProcedure.input(z.object({ id: z.number().int().positive(), paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]), fulfillmentStatus: z.enum(["pending", "processing", "delivered", "cancelled"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const { id, ...statusValues } = input;
    const [order] = await db.select().from(storeOrders).where(eq(storeOrders.id, id)).limit(1);
    if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود." });
    await db.update(storeOrders).set(statusValues).where(eq(storeOrders.id, id));
    const paymentChanged = order.paymentStatus !== input.paymentStatus;
    const fulfillmentChanged = order.fulfillmentStatus !== input.fulfillmentStatus;
    if (order.customerId) {
      const messages = [] as Array<{ userId: number | null; customerId: number; type: string; title: string; message: string; orderId: number }>;
      if (paymentChanged) messages.push({ userId: null, customerId: order.customerId, type: "payment_status", title: input.paymentStatus === "paid" ? "تم تأكيد الدفع" : "تم تحديث حالة الدفع", message: `حالة الدفع للطلب ${order.reference}: ${input.paymentStatus}.`, orderId: order.id });
      if (fulfillmentChanged) messages.push({ userId: null, customerId: order.customerId, type: "fulfillment_status", title: input.fulfillmentStatus === "delivered" ? "تم تسليم منتجك الرقمي" : "تم تحديث حالة التسليم", message: `حالة التسليم للطلب ${order.reference}: ${input.fulfillmentStatus}.`, orderId: order.id });
      if (messages.length) await db.insert(notifications).values(messages);
    }
    if (paymentChanged) await notifyOwner({ title: input.paymentStatus === "paid" ? "تم تأكيد الدفع" : "تحديث حالة الدفع", content: `الطلب ${order.reference}: ${input.paymentStatus}.` });
    if (fulfillmentChanged) await notifyOwner({ title: input.fulfillmentStatus === "delivered" ? "تم تسليم الطلب" : "تحديث حالة التسليم", content: `الطلب ${order.reference}: ${input.fulfillmentStatus}.` });
    return { success: true };
  }),
  coupons: adminProcedure.query(async () => {
    const db = await getDb();
    return db ? db.select().from(coupons).orderBy(desc(coupons.createdAt)) : [];
  }),
  saveCoupon: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), code: z.string().trim().min(3).max(48), discountType: z.enum(["percent", "fixed"]), value: z.number().positive(), maxUses: z.number().int().positive().nullable().optional(), isActive: z.boolean() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const { id, ...payload } = input;
    const values = { ...payload, code: payload.code.toUpperCase(), value: payload.value.toFixed(2), maxUses: payload.maxUses ?? null };
    if (id) { await db.update(coupons).set(values).where(eq(coupons.id, id)); return { id }; }
    const [created] = await db.insert(coupons).values(values).$returningId();
    return { id: created.id };
  }),
  paymentMethods: adminProcedure.query(async () => {
    const db = await getDb();
    return db ? db.select().from(paymentMethods).orderBy(desc(paymentMethods.createdAt)) : [];
  }),
  savePaymentMethod: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), code: z.string().trim().min(3).max(80), name: z.string().trim().min(3).max(120), description: z.string().trim().max(255).nullable().optional(), enabled: z.boolean(), isTest: z.boolean() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
    const { id, ...values } = input;
    if (id) { await db.update(paymentMethods).set(values).where(eq(paymentMethods.id, id)); return { id }; }
    const [created] = await db.insert(paymentMethods).values(values).$returningId();
    return { id: created.id };
  }),
  walletTopups: adminProcedure.query(() => listAdminWalletTopups()),
  walletTopupMethods: adminProcedure.query(() => listAdminWalletTopupMethods()),
  saveWalletTopupMethod: adminProcedure
    .input(z.object({
      id: z.number().int().positive().optional(),
      code: z.string().trim().min(3).max(80),
      name: z.string().trim().min(3).max(120),
      description: z.string().trim().max(255).nullable().optional(),
      instructions: z.string().trim().min(6).max(2000),
      enabled: z.boolean(),
      sortOrder: z.number().int().min(0).max(1000),
    }))
    .mutation(({ input }) => saveWalletTopupMethod(input)),
  reviewWalletTopup: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]), adminNote: z.string().trim().max(800).optional() }))
    .mutation(async ({ ctx, input }) => {
      const result = await reviewWalletTopup({ ...input, adminId: ctx.user.id });
      await notifyOwner({ title: input.status === "approved" ? "تم اعتماد شحن المحفظة" : "تم رفض شحن المحفظة", content: `تمت مراجعة طلب شحن المحفظة رقم ${input.id}.` });
      return result;
    }),
});
