import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  type Customer,
  coupons,
  gameAccounts,
  games,
  notifications,
  orderItems,
  paymentMethods,
  productImages,
  products,
  storeAssets,
  storeOrders,
} from "../drizzle/schema";
import { demoGames, demoProducts } from "../shared/demoCatalog";
import { getDb } from "./db";
import { debitWalletForOrder } from "./walletDb";

export const publicProduct = (product: typeof products.$inferSelect, imageRows: Array<typeof productImages.$inferSelect> = []) => {
  const { sensitiveDelivery: _secret, imageKey: _imageKey, ...safe } = product;
  const images = imageRows.length ? imageRows.map(image => ({ imageUrl: image.imageUrl, isPrimary: image.isPrimary })) : product.imageUrl ? [{ imageUrl: product.imageUrl, isPrimary: true }] : [];
  const primaryImage = images.find(image => image.isPrimary) ?? images[0] ?? null;
  return { ...safe, imageUrl: primaryImage?.imageUrl ?? safe.imageUrl, images };
};

export function restrictDeliveryDetails<T extends { deliverySnapshot: string | null }>(items: T[], paymentStatus: string) {
  return items.map(item => ({ ...item, deliverySnapshot: paymentStatus === "paid" ? item.deliverySnapshot : null }));
}

export async function ensureStoreSeeded() {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length) return db;

  await db.insert(games).values([...demoGames]);
  await db.insert(products).values(
    demoProducts.map(product => ({
      ...product,
      imageUrl: null,
      imageKey: null,
      sensitiveDelivery: "سيتم تسليم تفاصيل المنتج الرقمي بعد تأكيد حالة الدفع.",
    })),
  );
  await db.insert(paymentMethods).values({
    code: "demo_gateway",
    name: "الدفع التجريبي",
    description: "بوابة تجريبية لاستعراض دورة الطلب فقط.",
    enabled: true,
    isTest: true,
  });
  return db;
}

export async function getPublicCatalog(filters?: {
  q?: string;
  game?: string;
  type?: "topup" | "digital" | "account";
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "discount";
  min?: number;
  max?: number;
  discountOnly?: boolean;
}) {
  const db = await ensureStoreSeeded();
  if (!db) return [];
  const [records, accountRows] = await Promise.all([
    db.select().from(products).where(eq(products.status, "active")),
    db.select().from(gameAccounts),
  ]);
  const imageRows = records.length ? await db.select().from(productImages).where(inArray(productImages.productId, records.map(product => product.id))).orderBy(productImages.sortOrder) : [];
  const accountByProduct = new Map(accountRows.map(account => [account.productId, account]));
  const imagesByProduct = new Map<number, typeof imageRows>();
  imageRows.forEach(image => imagesByProduct.set(image.productId, [...(imagesByProduct.get(image.productId) ?? []), image]));
  const allOrderItems = await db.select({ productId: orderItems.productId, quantity: orderItems.quantity }).from(orderItems);
  const salesByProduct = allOrderItems.reduce((totals, item) => {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
    return totals;
  }, new Map<number, number>());
  const normalizedQuery = filters?.q?.trim().toLowerCase();
  const filtered = records.filter(product => {
    const price = Number(product.price);
    return (
      (!normalizedQuery || `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery)) &&
      (!filters?.game || product.gameSlug === filters.game) &&
      (!filters?.type || product.type === filters.type) &&
      (filters?.min === undefined || price >= filters.min) &&
      (filters?.max === undefined || price <= filters.max) &&
      (!filters?.discountOnly || product.discountPercent > 0)
    );
  });
  const sort = filters?.sort ?? "newest";
  filtered.sort((a, b) => {
    if (sort === "popular") return (salesByProduct.get(b.id) ?? 0) - (salesByProduct.get(a.id) ?? 0) || Number(b.popular) - Number(a.popular);
    if (sort === "price_asc") return Number(a.price) - Number(b.price);
    if (sort === "price_desc") return Number(b.price) - Number(a.price);
    if (sort === "discount") return b.discountPercent - a.discountPercent;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return filtered.map(product => {
    const account = accountByProduct.get(product.id);
    return {
      ...publicProduct(product, imagesByProduct.get(product.id) ?? []),
      accountProfile: account ? { level: account.level, highlights: account.highlights, accountStatus: account.accountStatus } : null,
    };
  });
}

export async function getCatalogGames() {
  const db = await ensureStoreSeeded();
  if (!db) return demoGames;
  return db.select().from(games).where(eq(games.isActive, true));
}

export async function getPublicProductBySlug(slug: string) {
  const db = await ensureStoreSeeded();
  if (!db) return null;
  const [product] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.status, "active"))).limit(1);
  if (!product) return null;
  const [[account], imageRows] = await Promise.all([
    db.select().from(gameAccounts).where(eq(gameAccounts.productId, product.id)).limit(1),
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder),
  ]);
  return { ...publicProduct(product, imageRows), accountProfile: account ? { level: account.level, highlights: account.highlights, accountStatus: account.accountStatus } : null };
}

export async function getPublicStoreAssets() {
  const db = await getDb();
  if (!db) return [];
  const assets = await db.select().from(storeAssets).where(eq(storeAssets.isActive, true)).orderBy(desc(storeAssets.updatedAt));
  return assets.map(({ imageKey: _key, ...asset }) => asset);
}

export async function listPaymentMethods() {
  const db = await ensureStoreSeeded();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true));
}

function buildReference() {
  return `GP-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${nanoid(5).toUpperCase()}`;
}

export async function createStoreOrder(input: {
  customer: Customer;
  items: Array<{ productId: number; quantity: number }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accountData?: string;
  paymentMethod: string;
  couponCode?: string;
}) {
  const db = await ensureStoreSeeded();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا.");
  const productIds = Array.from(new Set(input.items.map(item => item.productId)));
  const selected = await db.select().from(products).where(inArray(products.id, productIds));
  if (selected.length !== productIds.length) throw new Error("تعذر العثور على أحد المنتجات المطلوبة.");
  const selectedById = new Map(selected.map(product => [product.id, product]));
  for (const item of input.items) {
    const product = selectedById.get(item.productId);
    if (!product || product.status !== "active" || product.stock < item.quantity) {
      throw new Error("أحد المنتجات غير متاح بالكمية المطلوبة.");
    }
  }
  if (selected.some(product => product.type === "topup" || product.type === "account") && !input.accountData?.trim()) {
    throw new Error("أدخل Player ID أو بيانات التنفيذ المطلوبة لإتمام هذا الطلب.");
  }

  const subtotal = input.items.reduce((sum, item) => sum + Number(selectedById.get(item.productId)!.price) * item.quantity, 0);
  let discount = 0;
  let validCoupon: typeof coupons.$inferSelect | undefined;
  if (input.couponCode) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, input.couponCode.trim().toUpperCase())).limit(1);
    const now = new Date();
    if (coupon && coupon.isActive && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.endsAt || coupon.endsAt >= now) && (!coupon.maxUses || coupon.useCount < coupon.maxUses)) {
      validCoupon = coupon;
      discount = coupon.discountType === "percent" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
    }
  }
  discount = Math.min(discount, subtotal);
  const isWalletPayment = input.paymentMethod === "wallet";
  const [method] = isWalletPayment ? [] : await db.select().from(paymentMethods).where(and(eq(paymentMethods.code, input.paymentMethod), eq(paymentMethods.enabled, true))).limit(1);
  if (!isWalletPayment && !method) throw new Error("طريقة الدفع المختارة غير متاحة.");
  const isPaid = isWalletPayment || Boolean(method?.isTest);
  const reference = buildReference();
  const result = await db.transaction(async tx => {
    const [order] = await tx
      .insert(storeOrders)
      .values({
        reference,
        userId: null,
        customerId: input.customer.id,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        accountData: input.accountData || null,
        paymentMethod: isWalletPayment ? "wallet" : method!.code,
        paymentStatus: isPaid ? "paid" : "pending",
        fulfillmentStatus: isPaid ? "processing" : "pending",
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        total: (subtotal - discount).toFixed(2),
        couponCode: validCoupon?.code ?? null,
      })
      .$returningId();
    if (isWalletPayment) await debitWalletForOrder(tx, { customerId: input.customer.id, orderId: order.id, amount: subtotal - discount, reference });
    await tx.insert(orderItems).values(
      input.items.map(item => {
        const product = selectedById.get(item.productId)!;
        return {
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          gameSlug: product.gameSlug,
          productType: product.type,
          quantity: item.quantity,
          unitPrice: product.price,
          deliverySnapshot: product.sensitiveDelivery,
        };
      }),
    );
    for (const item of input.items) {
      const product = selectedById.get(item.productId)!;
      await tx.update(products).set({ stock: product.stock - item.quantity }).where(eq(products.id, product.id));
    }
    if (validCoupon) {
      await tx.update(coupons).set({ useCount: validCoupon.useCount + 1 }).where(eq(coupons.id, validCoupon.id));
    }
    await tx.insert(notifications).values({
      userId: null,
      customerId: input.customer.id,
      type: isPaid ? "payment_confirmed" : "order_created",
      title: isPaid ? "تم تأكيد الدفع التجريبي" : "تم إنشاء طلبك",
      message: `تم إنشاء الطلب ${reference}${isPaid ? " وتأكيد الدفع التجريبي." : "."}`,
      orderId: order.id,
    });
    return { id: order.id, reference, paid: isPaid };
  });
  return result;
}

export async function getCustomerOrders(customerId: number) {
  const db = await ensureStoreSeeded();
  if (!db) return [];
  const orderRows = await db.select().from(storeOrders).where(eq(storeOrders.customerId, customerId)).orderBy(desc(storeOrders.createdAt));
  return Promise.all(orderRows.map(async order => ({
    ...order,
    items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
  })));
}

export async function getCustomerOrderByReference(customerId: number, reference: string) {
  const db = await ensureStoreSeeded();
  if (!db) return null;
  const [order] = await db.select().from(storeOrders).where(and(eq(storeOrders.customerId, customerId), eq(storeOrders.reference, reference))).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return {
    ...order,
    items: restrictDeliveryDetails(items, order.paymentStatus),
  };
}

export async function getCustomerNotifications(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ notification: notifications, orderReference: storeOrders.reference })
    .from(notifications)
    .leftJoin(storeOrders, and(eq(notifications.orderId, storeOrders.id), eq(storeOrders.customerId, customerId)))
    .where(eq(notifications.customerId, customerId))
    .orderBy(desc(notifications.createdAt));
  return rows.map(({ notification, orderReference }) => ({ ...notification, orderReference: orderReference ?? null }));
}

export async function markCustomerNotificationRead(customerId: number, id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.customerId, customerId)));
}

export async function markAllCustomerNotificationsRead(customerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.customerId, customerId), isNull(notifications.readAt)));
}

export async function getAdminDashboard() {
  const db = await ensureStoreSeeded();
  if (!db) return { productCount: 0, orderCount: 0, customerCount: 0, totalSales: 0, recentOrders: [] as Array<typeof storeOrders.$inferSelect> };
  const [productRows, orderRows, customerRows] = await Promise.all([
    db.select().from(products),
    db.select().from(storeOrders).orderBy(desc(storeOrders.createdAt)),
    db.selectDistinct({ customerId: storeOrders.customerId }).from(storeOrders).where(sql`${storeOrders.customerId} is not null`),
  ]);
  return {
    productCount: productRows.length,
    orderCount: orderRows.length,
    customerCount: customerRows.length,
    totalSales: orderRows.filter(order => order.paymentStatus === "paid").reduce((sum, order) => sum + Number(order.total), 0),
    recentOrders: orderRows.slice(0, 6),
  };
}
