import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authPage = readFileSync(new URL("../client/src/pages/Auth.tsx", import.meta.url), "utf8");
const trpcContext = readFileSync(new URL("./_core/context.ts", import.meta.url), "utf8");

describe("customer login session handoff", () => {
  it("seeds the customer session cache before taking a successful login to the account", () => {
    expect(authPage).toContain("utils.customerAuth.me.setData(undefined, customer)");
    expect(authPage).toContain("await utils.customerAuth.me.invalidate()");
    expect(authPage).toContain('setLocation("/account")');
  });

  it("prioritizes the matching customer or admin session for each tRPC request family", () => {
    expect(trpcContext).toContain('const isAdminRequest = requestUrl.includes("admin.") || requestUrl.includes("adminAuth.")');
    expect(trpcContext).toContain("await getCustomerFromSession(opts.req.headers.cookie)");
    expect(trpcContext).toContain("await getAdminFromSession(opts.req.headers.cookie)");
  });
});
