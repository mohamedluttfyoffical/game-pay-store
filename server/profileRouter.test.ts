import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
import { profileRouter } from "./profileRouter";

const customer = { id: 42, name: "لاعب Game Pay", email: "customer@example.com", passwordHash: "a".repeat(128), passwordSalt: "salt", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
function context(user: TrpcContext["user"]): TrpcContext { return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] }; }

describe("profile router for Game Pay customers", () => {
  beforeEach(() => vi.resetAllMocks());
  it("requires a signed-in customer before profile access", async () => {
    const caller = profileRouter.createCaller(context(null));
    await expect(caller.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("updates only the active customer profile", async () => {
    const where = vi.fn().mockResolvedValue(undefined); const set = vi.fn(() => ({ where })); mocks.getDb.mockResolvedValue({ update: vi.fn(() => ({ set })) });
    const result = await profileRouter.createCaller(context(customer)).update({ name: "لاعب محترف", avatarUrl: "/manus-storage/avatar.webp", avatarKey: "avatars/42/avatar.webp" });
    expect(result).toMatchObject({ id: 42, name: "لاعب محترف", email: customer.email });
    expect(new MySqlDialect().sqlToQuery(where.mock.calls[0]?.[0]).params).toEqual([42]);
  });
  it("keeps updates bound to each active customer even if client input attempts a target id", async () => {
    const where = vi.fn().mockResolvedValue(undefined); mocks.getDb.mockResolvedValue({ update: vi.fn(() => ({ set: vi.fn(() => ({ where })) })) });
    const otherCustomer = { ...customer, id: 77, email: "other@example.com" };
    const first = await profileRouter.createCaller(context(customer)).update({ name: "عميل أول", avatarUrl: null, avatarKey: null, customerId: 77 } as any);
    const second = await profileRouter.createCaller(context(otherCustomer)).update({ name: "عميل ثانٍ", avatarUrl: null, avatarKey: null, customerId: 42 } as any);
    expect(first.id).toBe(42); expect(second.id).toBe(77);
    const dialect = new MySqlDialect(); expect(dialect.sqlToQuery(where.mock.calls[0]?.[0]).params).toEqual([42]); expect(dialect.sqlToQuery(where.mock.calls[1]?.[0]).params).toEqual([77]);
  });
  it("rejects invalid avatar payloads before storage upload", async () => {
    const caller = profileRouter.createCaller(context(customer));
    await expect(caller.uploadAvatar({ filename: "not-image.txt", mimeType: "image/png", dataUrl: "not-a-data-url" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
