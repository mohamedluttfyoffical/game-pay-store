import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const productForm = readFileSync(new URL("../client/src/pages/AdminProductCreate.tsx", import.meta.url), "utf8");
const filesPage = readFileSync(new URL("../client/src/pages/AdminFiles.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("admin responsive layout", () => {
  it("uses an RTL-aware mobile sidebar and compact responsive content spacing", () => {
    expect(layout).toContain('side="right"');
    expect(layout).toContain("setOpenMobile(false)");
    expect(layout).toContain("p-3 sm:p-5 lg:p-6");
    expect(layout).toContain("max-w-[calc(100vw-5.5rem)]");
  });

  it("keeps administration controls readable without forcing narrow layouts", () => {
    expect(admin).toContain("admin-panel-tabs");
    expect(admin).toContain("admin-order-row");
    expect(admin).toContain("sm:grid-cols-2 sm:p-5");
    expect(productForm).toContain("grid gap-3 sm:grid-cols-3");
    expect(filesPage).toContain("admin-page");
  });

  it("defines small-screen rules for horizontal tab access and full-width action groups", () => {
    expect(styles).toContain("@media (max-width: 639px)");
    expect(styles).toContain(".admin-panel-tabs { overflow-x: auto");
    expect(styles).toContain(".admin-action-group, .admin-row-actions { width: 100%; }");
    expect(styles).toContain(".admin-list-header > .btn-primary { width: 100%; }");
  });

  it("offers a persistent compact mode for the larger administration lists", () => {
    expect(admin).toContain('const ADMIN_DENSITY_KEY = "gamepay-admin-density"');
    expect(admin).toContain('localStorage.getItem(ADMIN_DENSITY_KEY) === "compact"');
    expect(admin).toContain('localStorage.setItem(ADMIN_DENSITY_KEY, compactMode ? "compact" : "comfortable")');
    expect(admin).toContain("admin-density-compact");
    expect(admin).toContain("عرض مكثف");
    expect(styles).toContain(".admin-density-compact .admin-list-row");
    expect(styles).toContain(".admin-density-compact .admin-order-row");
  });
});
