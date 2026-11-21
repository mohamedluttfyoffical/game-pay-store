import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatPrice } from "../client/src/lib/store";

const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("currency and responsive button presentation", () => {
  it("formats all shared store prices as Egyptian pounds using EGP", () => {
    expect(formatPrice(1250.5)).toContain("1,250.5 EGP");
    expect(formatPrice("75")).toContain("75 EGP");
  });

  it("keeps shared action buttons within their container and allows readable wrapping", () => {
    expect(css).toContain("max-inline-size: 100%");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("min-h-11 max-w-full");
  });
});
