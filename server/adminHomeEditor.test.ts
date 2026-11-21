import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const editor = readFileSync(new URL("../client/src/pages/AdminHomeEditor.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
const filesPage = readFileSync(new URL("../client/src/pages/AdminFiles.tsx", import.meta.url), "utf8");

describe("standalone homepage editor", () => {
  it("registers the dedicated editor route and sidebar entry", () => {
    expect(app).toContain('path={"/admin/home-editor"}');
    expect(dashboard).toContain('label: "محرر الرئيسية", path: "/admin/home-editor"');
  });

  it("keeps the original main dashboard from rendering the editor content", () => {
    expect(admin).toContain('if (!standalone) setLocation("/admin/home-editor")');
    expect(admin).toContain("if (!standalone) return null;");
    expect(admin).toContain('const items: Panel[] = ["overview", "products", "accounts", "orders", "customers", "coupons", "payments", "wallet"]');
    expect(admin).not.toContain('"overview", "home", "products"');
    expect(editor).toContain("<HomePageEditor standalone />");
  });

  it("keeps admin logout in the sidebar rather than the dashboard tab bar", () => {
    expect(admin).not.toContain("onLogout={() => logout.mutate()}");
    expect(dashboard).toContain("adminLogout.mutate()");
    expect(dashboard).toContain("تسجيل الخروج");
  });

  it("moves display assets to the sidebar-only files page", () => {
    expect(admin).not.toContain('"wallet", "assets"');
    expect(dashboard).toContain('label: "الملفات", path: "/admin/files"');
    expect(filesPage).toContain("<AdminAssets />");
  });
});
