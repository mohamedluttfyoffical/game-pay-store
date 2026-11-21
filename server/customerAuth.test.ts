import { beforeEach, describe, expect, it, vi } from "vitest";
import { scryptSync } from "node:crypto";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), createCustomerSession: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./customerSession", async importOriginal => {
  const actual = await importOriginal<typeof import("./customerSession")>();
  return { ...actual, createCustomerSession: mocks.createCustomerSession };
});
import { customerAuthRouter } from "./customerAuth";

function context(): TrpcContext { return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"] }; }
const customer = { id: 5, name: "أحمد", email: "ahmed@example.com", passwordHash: "f".repeat(128), passwordSalt: "0123456789abcdef", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("customerAuth router", () => {
  beforeEach(() => vi.resetAllMocks());
  it("hashes a new password and creates a separate customer session", async () => {
    const inserted: unknown[] = [];
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ where: () => ({ limit: async () => [] }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ limit: async () => [customer] }) }) });
    const db = { select, insert: vi.fn(() => ({ values: (value: unknown) => { inserted.push(value); return { $returningId: async () => [{ id: 5 }] }; } })) };
    mocks.getDb.mockResolvedValue(db);
    const result = await customerAuthRouter.createCaller(context()).register({ name: "أحمد", email: "AHMED@EXAMPLE.COM", password: "safe-pass1" });
    expect(result).toMatchObject({ id: 5, email: "ahmed@example.com" });
    expect(inserted[0]).toMatchObject({ email: "ahmed@example.com" });
    expect((inserted[0] as { passwordHash: string }).passwordHash).not.toBe("safe-pass1");
    expect((inserted[0] as { passwordSalt: string }).passwordSalt.length).toBeGreaterThan(10);
    expect(mocks.createCustomerSession).toHaveBeenCalledWith(customer, expect.anything());
  });
  it("rejects duplicate emails before storing a password", async () => {
    const db = { select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [{ id: 5 }] }) }) })), insert: vi.fn() };
    mocks.getDb.mockResolvedValue(db);
    await expect(customerAuthRouter.createCaller(context()).register({ name: "أحمد", email: "ahmed@example.com", password: "safe-pass1" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(db.insert).not.toHaveBeenCalled();
  });
  it("uses the same generic error when login credentials are invalid", async () => {
    const db = { select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) })) };
    mocks.getDb.mockResolvedValue(db);
    await expect(customerAuthRouter.createCaller(context()).login({ email: "unknown@example.com", password: "anything1" })).rejects.toMatchObject({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحين." });
  });
  it("creates a customer session and returns the public customer after successful login", async () => {
    const securedCustomer = { ...customer, passwordSalt: "0123456789abcdef", passwordHash: scryptSync("safe-pass1", "0123456789abcdef", 64).toString("hex") };
    const where = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where }));
    const db = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [securedCustomer] }) }) })),
      update: vi.fn(() => ({ set: updateSet })),
    };
    mocks.getDb.mockResolvedValue(db);
    const result = await customerAuthRouter.createCaller(context()).login({ email: "ahmed@example.com", password: "safe-pass1" });
    expect(result).toMatchObject({ id: securedCustomer.id, email: securedCustomer.email, role: "customer" });
    expect(result).not.toHaveProperty("passwordHash");
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ lastSignedIn: expect.any(Date) }));
    expect(mocks.createCustomerSession).toHaveBeenCalledWith(securedCustomer, expect.anything());
  });
  it("allows login using phone number and forwards rememberMe to createCustomerSession", async () => {
    const customerWithPhone = { ...customer, phone: "01012345678", passwordSalt: "0123456789abcdef", passwordHash: scryptSync("safe-pass1", "0123456789abcdef", 64).toString("hex") };
    const where = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where }));
    const db = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [customerWithPhone] }) }) })),
      update: vi.fn(() => ({ set: updateSet })),
    };
    mocks.getDb.mockResolvedValue(db);
    const result = await customerAuthRouter.createCaller(context()).login({ identifier: "01012345678", password: "safe-pass1", rememberMe: true });
    expect(result).toMatchObject({ id: customerWithPhone.id, email: customerWithPhone.email });
    expect(mocks.createCustomerSession).toHaveBeenCalledWith(customerWithPhone, expect.anything(), true);
  });
  it("requests password reset instructions by email or phone and returns masked confirmation", async () => {
    const customerRecord = { ...customer, email: "mohamed@example.com", phone: "01099999999" };
    const db = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [customerRecord] }) }) }))
    };
    mocks.getDb.mockResolvedValue(db);
    const resultByEmail = await customerAuthRouter.createCaller(context()).requestPasswordReset({ identifier: "mohamed@example.com" });
    expect(resultByEmail.success).toBe(true);
    expect(resultByEmail.message).toContain("mo***@example.com");

    const resultByPhone = await customerAuthRouter.createCaller(context()).requestPasswordReset({ identifier: "01099999999" });
    expect(resultByPhone.success).toBe(true);
    expect(resultByPhone.message).toContain("mo***@example.com");
  });
  it("verifies the current password, replaces its hash, and rotates customer sessions", async () => {
    const securedCustomer = { ...customer, passwordSalt: "0123456789abcdef", passwordHash: scryptSync("current-pass1", "0123456789abcdef", 64).toString("hex") };
    const where = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where }));
    const db = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [securedCustomer] }) }) })),
      update: vi.fn(() => ({ set: updateSet })),
      delete: vi.fn(() => ({ where })),
    };
    mocks.getDb.mockResolvedValue(db);
    const result = await customerAuthRouter.createCaller({ ...context(), user: securedCustomer }).changePassword({ currentPassword: "current-pass1", newPassword: "updated-pass2" });
    expect(result).toEqual({ success: true });
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: expect.any(String), passwordSalt: expect.any(String) }));
    expect((updateSet.mock.calls[0]?.[0] as { passwordHash: string }).passwordHash).not.toBe(securedCustomer.passwordHash);
    expect(mocks.createCustomerSession).toHaveBeenCalledTimes(1);
  });
  it("deletes the customer session and clears the Game Pay cookie on logout", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    const db = { delete: vi.fn(() => ({ where })) };
    mocks.getDb.mockResolvedValue(db);
    const ctx = context();
    (ctx.req as { headers: Record<string, string> }).headers.cookie = "gamepay_session=session-token";
    const result = await customerAuthRouter.createCaller(ctx).logout();
    expect(result).toEqual({ success: true });
    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(where).toHaveBeenCalledTimes(1);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith("gamepay_session", expect.objectContaining({ httpOnly: true, path: "/", maxAge: 0 }));
  });
});
