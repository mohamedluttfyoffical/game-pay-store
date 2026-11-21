import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = readFileSync(new URL("../capacitor.config.ts", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { scripts: Record<string, string> };

describe("mobile packaging configuration", () => {
  it("targets the published Game Pay storefront through HTTPS", () => {
    expect(config).toContain("CAPACITOR_SERVER_URL");
    expect(config).toContain("https://gamepayshop-3m9w2yls.manus.space");
    expect(config).toContain("cleartext: false");
  });

  it("exposes synchronization and release build scripts for both mobile platforms", () => {
    expect(packageJson.scripts["mobile:sync"]).toBe("cap sync");
    expect(packageJson.scripts["mobile:android:apk"]).toContain("assembleRelease");
    expect(packageJson.scripts["mobile:android:aab"]).toContain("bundleRelease");
    expect(packageJson.scripts["mobile:ios:open"]).toContain("cap open ios");
  });

  it("contains generated Android and iOS projects for native tooling", () => {
    expect(existsSync(new URL("../android", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../ios", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../ios/App/App.xcodeproj", import.meta.url))).toBe(true);
  });
});
