import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { customerAuthRouter } from "./customerAuth";

const customer = { id: 18, name: "عميل آمن", email: "secure@example.com", passwordHash: "a".repeat(128), passwordSalt: "salt", avatarUrl: null, avatarKey: null, role: "customer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const context: TrpcContext = { user: customer, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };

describe("customer authentication boundary", () => {
  it("never exposes a customer password hash through the legacy admin session endpoint", async () => {
    await expect(appRouter.createCaller(context).auth.me()).resolves.toBeNull();
  });
  it("returns only public fields through the customer session endpoint", async () => {
    const result = await customerAuthRouter.createCaller(context).me();
    expect(result).toMatchObject({ id: 18, email: "secure@example.com" });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("passwordSalt");
  });
});
