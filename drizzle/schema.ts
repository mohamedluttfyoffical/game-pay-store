import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  displayName: varchar("displayName", { length: 160 }),
  avatarUrl: text("avatarUrl"),
  avatarKey: text("avatarKey"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 160 }).notNull(),
    passwordSalt: varchar("passwordSalt", { length: 160 }).notNull(),
    avatarUrl: text("avatarUrl"),
    avatarKey: text("avatarKey"),
    role: mysqlEnum("role", ["customer"]).default("customer").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => [uniqueIndex("customers_email_unique").on(table.email)],
);

export const customerSessions = mysqlTable(
  "customer_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("customer_sessions_token_hash_unique").on(table.tokenHash)],
);

export type Customer = typeof customers.$inferSelect;

export const customerWallets = mysqlTable(
  "customer_wallets",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("customer_wallets_customer_unique").on(table.customerId)],
);

export const walletTopupMethods = mysqlTable(
  "wallet_topup_methods",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: varchar("description", { length: 255 }),
    instructions: text("instructions").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("wallet_topup_methods_code_unique").on(table.code)],
);

export const walletTopupRequests = mysqlTable("wallet_topup_requests", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  methodId: int("methodId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 160 }),
  customerNote: text("customerNote"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const walletTransactions = mysqlTable(
  "wallet_transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    walletId: int("walletId").notNull(),
    customerId: int("customerId").notNull(),
    topupRequestId: int("topupRequestId"),
    orderId: int("orderId"),
    type: mysqlEnum("type", ["topup", "purchase", "refund", "adjustment"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("wallet_transactions_topup_request_unique").on(table.topupRequestId),
    uniqueIndex("wallet_transactions_order_unique").on(table.orderId),
  ],
);

export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 160 }).notNull(),
    passwordSalt: varchar("passwordSalt", { length: 160 }).notNull(),
    mustChangePassword: boolean("mustChangePassword").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => [uniqueIndex("admins_email_unique").on(table.email)],
);

export const adminSessions = mysqlTable(
  "admin_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    adminId: int("adminId").notNull(),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("admin_sessions_token_hash_unique").on(table.tokenHash)],
);

export type Admin = typeof admins.$inferSelect;

export const games = mysqlTable(
  "games",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 140 }).notNull(),
    accent: varchar("accent", { length: 32 }).default("cyan").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("games_slug_unique").on(table.slug)],
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull(),
    name: varchar("name", { length: 220 }).notNull(),
    gameSlug: varchar("gameSlug", { length: 80 }).notNull(),
    type: mysqlEnum("type", ["topup", "digital", "account"]).notNull(),
    shortDescription: varchar("shortDescription", { length: 420 }),
    description: text("description").notNull(),
    details: text("details").notNull(),
    useInstructions: text("useInstructions").notNull(),
    deliveryEta: varchar("deliveryEta", { length: 120 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
    discountPercent: int("discountPercent").default(0).notNull(),
    sku: varchar("sku", { length: 120 }),
    stock: int("stock").default(0).notNull(),
    status: mysqlEnum("status", ["active", "inactive", "draft", "sold_out"]).default("draft").notNull(),
    imageUrl: text("imageUrl"),
    imageKey: text("imageKey"),
    sensitiveDelivery: text("sensitiveDelivery"),
    seoTitle: varchar("seoTitle", { length: 220 }),
    featured: boolean("featured").default(false).notNull(),
    popular: boolean("popular").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("products_slug_unique").on(table.slug), uniqueIndex("products_sku_unique").on(table.sku)],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    imageUrl: text("imageUrl").notNull(),
    imageKey: varchar("imageKey", { length: 500 }).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("product_images_product_key_unique").on(table.productId, table.imageKey),
    uniqueIndex("product_images_product_sort_unique").on(table.productId, table.sortOrder),
  ],
);

export const gameAccounts = mysqlTable(
  "game_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    level: varchar("level", { length: 80 }).notNull(),
    highlights: text("highlights").notNull(),
    accountStatus: mysqlEnum("accountStatus", ["available", "sold"]).default("available").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("game_accounts_product_unique").on(table.productId)],
);

export const coupons = mysqlTable(
  "coupons",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 48 }).notNull(),
    discountType: mysqlEnum("discountType", ["percent", "fixed"]).default("percent").notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    maxUses: int("maxUses"),
    useCount: int("useCount").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("coupons_code_unique").on(table.code)],
);

export const paymentMethods = mysqlTable(
  "payment_methods",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: varchar("description", { length: 255 }),
    enabled: boolean("enabled").default(true).notNull(),
    isTest: boolean("isTest").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("payment_methods_code_unique").on(table.code)],
);

export const storeAssets = mysqlTable(
  "store_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    category: varchar("category", { length: 40 }).default("general").notNull(),
    slot: varchar("slot", { length: 80 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    imageUrl: text("imageUrl").notNull(),
    imageKey: text("imageKey").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("store_assets_slot_unique").on(table.slot)],
);

export const homepageConfigs = mysqlTable(
  "homepage_configs",
  {
    id: int("id").autoincrement().primaryKey(),
    configKey: varchar("configKey", { length: 80 }).notNull(),
    payload: text("payload").notNull(),
    updatedBy: int("updatedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("homepage_configs_key_unique").on(table.configKey)],
);

export const storeOrders = mysqlTable(
  "store_orders",
  {
    id: int("id").autoincrement().primaryKey(),
    reference: varchar("reference", { length: 48 }).notNull(),
    userId: int("userId"),
    customerId: int("customerId"),
    customerName: varchar("customerName", { length: 160 }).notNull(),
    customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 48 }).notNull(),
    accountData: text("accountData"),
    paymentMethod: varchar("paymentMethod", { length: 80 }).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
    fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["pending", "processing", "delivered", "cancelled"]).default("pending").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    couponCode: varchar("couponCode", { length: 48 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("store_orders_reference_unique").on(table.reference)],
);

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 220 }).notNull(),
  gameSlug: varchar("gameSlug", { length: 80 }).notNull(),
  productType: mysqlEnum("productType", ["topup", "digital", "account"]).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  deliverySnapshot: text("deliverySnapshot"),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  customerId: int("customerId"),
  type: varchar("type", { length: 48 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  orderId: int("orderId"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type StoreOrder = typeof storeOrders.$inferSelect;
