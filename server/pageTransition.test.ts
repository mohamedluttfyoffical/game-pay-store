import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const transition = readFileSync(new URL("../client/src/components/PageTransition.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("page transitions", () => {
  it("wraps application routes in the shared transition component", () => {
    expect(app).toContain("<PageTransition>");
    expect(app).toContain("<Router />");
  });

  it("uses a short entrance transition and honors reduced-motion preferences", () => {
    expect(transition).toContain("useReducedMotion");
    expect(transition).toContain("duration: reduceMotion ? 0 : 0.24");
    expect(transition).toContain('window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" })');
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
