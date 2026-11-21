import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), createAdminSession: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./adminSession", async importOriginal => {
  const actual = await importOriginal<typeof import("./adminSession")>();
  return { ...actual, createAdminSession: mocks.createAdminSession };
});
import { adminAuthRouter } from "./adminAuth";

const context = (user: TrpcContext["user"] = null): TrpcContext => ({ user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"] });

describe("adminAuth router", () => {
  beforeEach(() => vi.resetAllMocks());
  it("creates and signs in the requested initial administrator without storing the raw password", async () => {
    const inserted: Array<Record<string, unknown>> = [];
    let reads = 0;
    const select = vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => { reads += 1; if (reads === 1) return []; const stored = inserted[0]; return [{ id: 1, name: "Game Pay Admin", email: "admin@gamepay", passwordHash: stored.passwordHash, passwordSalt: stored.passwordSalt, mustChangePassword: true, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }]; } }) }) }));
    const db = { select, insert: vi.fn(() => ({ values: (value: Record<string, unknown>) => { inserted.push(value); return { $returningId: async () => [{ id: 1 }] }; } })), update: vi.fn(() => ({ set: () => ({ where: async () => undefined }) })) };
    mocks.getDb.mockResolvedValue(db);
    const result = await adminAuthRouter.createCaller(context()).login({ email: "admin@gamepay", password: "admin" });
    expect(result).toMatchObject({ id: 1, email: "admin@gamepay", mustChangePassword: true });
    expect(inserted[0]).toMatchObject({ email: "admin@gamepay", mustChangePassword: true });
    expect(inserted[0]?.passwordHash).not.toBe("admin");
    expect(mocks.createAdminSession).toHaveBeenCalledTimes(1);
  });
  it("returns only safe administrator fields for an active admin session", async () => {
    const admin = { id: 1, name: "Game Pay Admin", email: "admin@gamepay", passwordHash: "a".repeat(128), passwordSalt: "salt", mustChangePassword: false, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const result = await adminAuthRouter.createCaller(context(admin)).me();
    expect(result).toMatchObject({ id: 1, email: "admin@gamepay" });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("passwordSalt");
  });
  it("does not reveal whether another administrator address exists when credentials fail", async () => {
    let reads = 0;
    const initialAdmin = { id: 1, name: "Game Pay Admin", email: "admin@gamepay", passwordHash: "a".repeat(128), passwordSalt: "salt", mustChangePassword: true, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const db = { select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => { reads += 1; return reads === 2 ? [initialAdmin] : []; } }) }) })), insert: vi.fn(() => ({ values: () => ({ $returningId: async () => [{ id: 1 }] }) })) };
    mocks.getDb.mockResolvedValue(db);
    await expect(adminAuthRouter.createCaller(context()).login({ email: "other@gamepay", password: "wrongpass1" })).rejects.toMatchObject({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحين." });
  });
  it("allows an initial admin to replace the initial password before opening administration", async () => {
    const admin = { id: 1, name: "Game Pay Admin", email: "admin@gamepay", passwordHash: "a".repeat(128), passwordSalt: "salt", mustChangePassword: true, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const set = vi.fn(() => ({ where: async () => undefined }));
    const db = { select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [admin] }) }) })), update: vi.fn(() => ({ set })), delete: vi.fn(() => ({ where: async () => undefined })) };
    mocks.getDb.mockResolvedValue(db);
    await expect(adminAuthRouter.createCaller(context(admin)).changePassword({ newPassword: "AdminPass2026" })).resolves.toEqual({ success: true });
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ mustChangePassword: false }));
    expect(mocks.createAdminSession).toHaveBeenCalledTimes(1);
  });
});
