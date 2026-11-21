import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authPage = readFileSync(new URL("../client/src/pages/Auth.tsx", import.meta.url), "utf8");
const trpcContext = readFileSync(new URL("./_core/context.ts", import.meta.url), "utf8");
const bloggerTemplate = readFileSync(new URL("../blogger/game-pay-blogger-template.xml", import.meta.url), "utf8");

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

  it("ensures login page has removed subtitle, supports email or phone, and includes remember me checkbox across both versions", () => {
    // Main project
    expect(authPage).not.toContain("أدخل بيانات حسابك الخاصة بـ Game Pay للمتابعة.");
    expect(authPage).toContain("البريد الإلكتروني أو رقم الهاتف");
    expect(authPage).toContain("تذكرني");

    // Blogger template
    expect(bloggerTemplate).not.toContain("أدخل بيانات حسابك الخاصة بـ Game Pay للمتابعة.");
    expect(bloggerTemplate).toContain("البريد الإلكتروني أو رقم الهاتف");
    expect(bloggerTemplate).toContain("تذكرني");
  });
});
