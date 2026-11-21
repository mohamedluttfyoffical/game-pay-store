import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { DEFAULT_HOMEPAGE_CONFIG } from "../shared/homepage";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
import { homepageRouter } from "./homepageRouter";

const admin = { id: 1, name: "Game Pay Admin", email: "admin@gamepay", passwordHash: "a".repeat(128), passwordSalt: "salt", mustChangePassword: false, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const customer = { id: 2, name: "عميل", email: "customer@example.com", passwordHash: "b".repeat(128), passwordSalt: "salt", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const context = (user: TrpcContext["user"]): TrpcContext => ({ user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] });

describe("homepage router", () => {
  beforeEach(() => vi.resetAllMocks());
  it("returns the safe default configuration when no saved configuration exists", async () => {
    mocks.getDb.mockResolvedValue(null);
    await expect(homepageRouter.createCaller(context(null)).get()).resolves.toEqual(DEFAULT_HOMEPAGE_CONFIG);
  });
  it("allows only admins to save the homepage content and section layout", async () => {
    await expect(homepageRouter.createCaller(context(customer)).save(DEFAULT_HOMEPAGE_CONFIG)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("persists a validated admin homepage configuration", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    mocks.getDb.mockResolvedValue({ select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) })), insert: vi.fn(() => ({ values })) });
    const config = { ...DEFAULT_HOMEPAGE_CONFIG, hero: { ...DEFAULT_HOMEPAGE_CONFIG.hero, title: "عنوان جديد" } };
    await expect(homepageRouter.createCaller(context(admin)).save(config)).resolves.toEqual(config);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ configKey: "home", updatedBy: 1 }));
    expect(JSON.parse(values.mock.calls[0]?.[0].payload).hero.title).toBe("عنوان جديد");
  });
  it("accepts ordered visible navigation items with visible submenus", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    mocks.getDb.mockResolvedValue({ select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) })), insert: vi.fn(() => ({ values })) });
    const config = { ...DEFAULT_HOMEPAGE_CONFIG, navigation: [{ id: "catalog", label: "الكتالوج", path: "/store", visible: true, children: [{ id: "catalog-topup", label: "شحن", path: "/store?type=topup", visible: true }] }] };
    await expect(homepageRouter.createCaller(context(admin)).save(config)).resolves.toEqual(config);
    expect(JSON.parse(values.mock.calls[0]?.[0].payload).navigation[0].children[0].path).toBe("/store?type=topup");
  });
  it("persists validated brand image references with the homepage configuration", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    mocks.getDb.mockResolvedValue({ select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) })), insert: vi.fn(() => ({ values })) });
    const config = { ...DEFAULT_HOMEPAGE_CONFIG, brand: { logoUrl: "/manus-storage/branding/logo.png", logoKey: "branding/logo.png", faviconUrl: "/manus-storage/branding/favicon.png", faviconKey: "branding/favicon.png" } };
    await expect(homepageRouter.createCaller(context(admin)).save(config)).resolves.toEqual(config);
    expect(JSON.parse(values.mock.calls[0]?.[0].payload).brand.faviconKey).toBe("branding/favicon.png");
  });
});
