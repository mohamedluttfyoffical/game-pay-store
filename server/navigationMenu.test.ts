import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONFIG } from "../shared/homepage";

const shell = readFileSync(new URL("../client/src/components/StoreShell.tsx", import.meta.url), "utf8");
const editor = readFileSync(new URL("../client/src/pages/AdminNavigation.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");

describe("configurable main navigation", () => {
  it("ships with visible ordered navigation and a submenu", () => {
    expect(DEFAULT_HOMEPAGE_CONFIG.navigation.map(item => item.id)).toEqual(["home", "store", "topups", "accounts", "offers"]);
    expect(DEFAULT_HOMEPAGE_CONFIG.navigation.find(item => item.id === "topups")?.children).toHaveLength(2);
  });

  it("closes the mobile menu outside, on scroll, and after five seconds of inactivity", () => {
    expect(shell).toContain('window.setTimeout(closeMenu, 5000)');
    expect(shell).toContain('window.addEventListener("scroll", closeOnScroll');
    expect(shell).toContain('document.addEventListener("pointerdown", closeOutside)');
  });

  it("renders published navigation data and exposes item and child management controls", () => {
    expect(shell).toContain("homepage.data?.navigation");
    expect(shell).toContain("item.children.filter");
    expect(editor).toContain("إضافة بند رئيسي");
    expect(editor).toContain("إضافة عنصر فرعي");
    expect(editor).toContain("حفظ ونشر القائمة");
    expect(dashboard).toContain('label: "محرر القائمة", path: "/admin/navigation"');
  });
});
