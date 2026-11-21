import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readProjectFile = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("notifications UI wiring", () => {
  it("registers a full notifications route", () => {
    const app = readProjectFile("client/src/App.tsx");
    expect(app).toContain('path={"/notifications"} component={Notifications}');
  });

  it("keeps the bell preview limited to the four newest items and links to the archive", () => {
    const shell = readProjectFile("client/src/components/StoreShell.tsx");
    expect(shell).toContain("notifications.data.slice(0, 4)");
    expect(shell).toContain("عرض كل الإشعارات");
    expect(shell).toContain('navigate("/notifications")');
    expect(shell).toContain("item.orderReference");
  });

  it("renders both read and unread notifications from the customer archive", () => {
    const page = readProjectFile("client/src/pages/Notifications.tsx");
    expect(page).toContain("markNotificationRead");
    expect(page).toContain("openNotification");
    expect(page).toContain("غير مقروءة");
    expect(page).toContain("markAllNotificationsRead");
    expect(page).toContain("قراءة الكل");
    expect(page).toContain("/order-success/${item.orderReference}");
  });
});
