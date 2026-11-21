import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ createStoreOrder: vi.fn(), notifyOwner: vi.fn(), markAllCustomerNotificationsRead: vi.fn() }));
vi.mock("./storeDb", () => ({ createStoreOrder: mocks.createStoreOrder, getCustomerNotifications: vi.fn(), getCustomerOrderByReference: vi.fn(), getCustomerOrders: vi.fn(), markCustomerNotificationRead: vi.fn(), markAllCustomerNotificationsRead: mocks.markAllCustomerNotificationsRead }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));
import { ordersRouter } from "./ordersRouter";

const customer = { id: 9, name: "عميل تجريبي", email: "customer@example.com", passwordHash: "a".repeat(128), passwordSalt: "salt", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
function createContext(): TrpcContext { return { user: customer, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] }; }

describe("orders.create", () => {
  it("creates a valid Game Pay customer order and notifies the store owner", async () => {
    mocks.createStoreOrder.mockResolvedValueOnce({ id: 71, reference: "GP-260822-AB123", paid: true }); mocks.notifyOwner.mockResolvedValueOnce(true);
    const result = await ordersRouter.createCaller(createContext()).create({ items: [{ productId: 1, quantity: 1 }], customerName: "عميل تجريبي", customerEmail: "customer@example.com", customerPhone: "0500000000", accountData: "UID-12345", paymentMethod: "demo_gateway" });
    expect(result).toEqual({ id: 71, reference: "GP-260822-AB123", paid: true });
    expect(mocks.createStoreOrder).toHaveBeenCalledWith(expect.objectContaining({ customer, paymentMethod: "demo_gateway" }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "طلب جديد في Game Pay" }));
  });

  it("marks all notifications read only for the current customer", async () => {
    mocks.markAllCustomerNotificationsRead.mockResolvedValueOnce(undefined);
    await expect(ordersRouter.createCaller(createContext()).markAllNotificationsRead()).resolves.toBeUndefined();
    expect(mocks.markAllCustomerNotificationsRead).toHaveBeenCalledWith(9);
  });
});
