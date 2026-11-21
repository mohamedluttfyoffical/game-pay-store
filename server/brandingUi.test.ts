import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const mark = readFileSync(new URL("../client/src/components/GameMark.tsx", import.meta.url), "utf8");
const favicon = readFileSync(new URL("../client/src/components/BrandFavicon.tsx", import.meta.url), "utf8");
const editor = readFileSync(new URL("../client/src/pages/AdminBranding.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");

describe("store branding", () => {
  it("registers the branding editor and the favicon runtime updater", () => {
    expect(app).toContain('path={"/admin/branding"}');
    expect(app).toContain("<BrandFavicon />");
    expect(favicon).toContain('link.href = faviconUrl || "/favicon.ico"');
  });

  it("renders the published logo with a safe fallback and exposes branding controls", () => {
    expect(mark).toContain("homepage.data?.brand.logoUrl");
    expect(mark).toContain("<Gamepad2");
    expect(editor).toContain("رفع ${title}");
    expect(editor).toContain("Favicon المتصفح");
    expect(dashboard).toContain('label: "هوية المتجر", path: "/admin/branding"');
  });
});
