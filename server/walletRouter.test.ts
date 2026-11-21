import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  notifyOwner: vi.fn(),
  getCustomerWallet: vi.fn(),
  listWalletTopupMethods: vi.fn(),
  getCustomerTopupRequests: vi.fn(),
  createWalletTopupRequest: vi.fn(),
  cancelWalletTopupRequest: vi.fn(),
}));

vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));
vi.mock("./walletDb", () => ({
  getCustomerWallet: mocks.getCustomerWallet,
  listWalletTopupMethods: mocks.listWalletTopupMethods,
  getCustomerTopupRequests: mocks.getCustomerTopupRequests,
  createWalletTopupRequest: mocks.createWalletTopupRequest,
  cancelWalletTopupRequest: mocks.cancelWalletTopupRequest,
}));

import { walletRouter } from "./walletRouter";

const customer = { id: 19, name: "عميل", email: "customer@example.com", passwordHash: "a".repeat(128), passwordSalt: "salt", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const context = (user = customer): TrpcContext => ({ user: user as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("wallet router", () => {
  beforeEach(() => vi.resetAllMocks());

  it("requires a Game Pay customer for wallet data", async () => {
    await expect(walletRouter.createCaller(context(null as never)).summary()).rejects.toThrow("Please login");
    expect(mocks.getCustomerWallet).not.toHaveBeenCalled();
  });

  it("creates a top-up request for the current customer and notifies the owner", async () => {
    mocks.createWalletTopupRequest.mockResolvedValue({ id: 44, methodName: "فودافون كاش" });
    const result = await walletRouter.createCaller(context()).requestTopup({ methodId: 3, amount: 125, reference: "TX-9", customerNote: "تم التحويل" });
    expect(result).toEqual({ id: 44, methodName: "فودافون كاش" });
    expect(mocks.createWalletTopupRequest).toHaveBeenCalledWith(expect.objectContaining({ customerId: 19, methodId: 3, amount: 125 }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "طلب شحن محفظة جديد" }));
  });

  it("keeps cancellation bound to the current customer", async () => {
    mocks.cancelWalletTopupRequest.mockResolvedValue({ success: true });
    await expect(walletRouter.createCaller(context()).cancelTopup({ id: 8 })).resolves.toEqual({ success: true });
    expect(mocks.cancelWalletTopupRequest).toHaveBeenCalledWith(19, 8);
  });
});
