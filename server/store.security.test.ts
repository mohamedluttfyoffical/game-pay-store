import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { publicProduct, restrictDeliveryDetails } from "./storeDb";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const regularUser = {
  id: 22,
  openId: "regular-user",
  name: "Regular User",
  email: "regular@example.com",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("store security boundaries", () => {
  it("does not expose delivery secrets or storage keys in public product responses", () => {
    const product = publicProduct({
      id: 1,
      slug: "secure-product",
      name: "منتج تجريبي",
      gameSlug: "efootball",
      type: "digital",
      description: "وصف تجريبي كافٍ للاختبار",
      details: "تفاصيل تجريبية كافية للاختبار",
      useInstructions: "استخدم المنتج وفق التعليمات",
      deliveryEta: "فوري",
      price: "10.00",
      compareAtPrice: null,
      discountPercent: 0,
      stock: 1,
      status: "active",
      imageUrl: "/manus-storage/public.png",
      imageKey: "private/image-key.png",
      sensitiveDelivery: "SECRET-DELIVERY-CODE",
      featured: false,
      popular: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(product).not.toHaveProperty("sensitiveDelivery");
    expect(product).not.toHaveProperty("imageKey");
    expect(JSON.stringify(product)).not.toContain("SECRET-DELIVERY-CODE");
  });

  it("reveals a delivery snapshot only after payment is confirmed", () => {
    const items = [{ deliverySnapshot: "SECRET-DELIVERY-CODE", productName: "منتج تجريبي" }];
    expect(restrictDeliveryDetails(items, "pending")[0]?.deliverySnapshot).toBeNull();
    expect(restrictDeliveryDetails(items, "paid")[0]?.deliverySnapshot).toBe("SECRET-DELIVERY-CODE");
  });

  it("requires authentication before an order can be created", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.orders.create({
      items: [{ productId: 1, quantity: 1 }],
      customerName: "عميل تجريبي",
      customerEmail: "customer@example.com",
      customerPhone: "0500000000",
      paymentMethod: "demo_gateway",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an ordinary customer from administration procedures", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));

    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
