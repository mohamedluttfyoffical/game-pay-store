import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const mark = readFileSync(new URL("../client/src/components/GameMark.tsx", import.meta.url), "utf8");

describe("purple brand theme", () => {
  it("assigns the requested #8846D0 brand color as the shared primary token", () => {
    expect(css).toContain("--primary: oklch(0.5450 0.2036 301.95)");
    expect(css).toContain("--color-cyan-500: oklch(0.5450 0.2036 301.95)");
  });

  it("extends the violet palette to actions, dark surfaces, and the store mark", () => {
    expect(css).toContain("#1a082f");
    expect(css).toContain(".btn-primary:hover");
    expect(css).toContain('[class*="bg-[radial-gradient"][class*="rgba(34,211,238"]');
    expect(css).toContain('[class*="bg-[linear-gradient"][class*="#102c4b"]');
    expect(mark).toContain("rgba(136,70,208,.42)");
  });
});
