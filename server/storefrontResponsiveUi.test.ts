import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync(new URL("../client/src/components/StoreShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const catalog = readFileSync(new URL("../client/src/pages/Catalog.tsx", import.meta.url), "utf8");
const product = readFileSync(new URL("../client/src/pages/ProductDetails.tsx", import.meta.url), "utf8");
const card = readFileSync(new URL("../client/src/components/ProductCard.tsx", import.meta.url), "utf8");
const cart = readFileSync(new URL("../client/src/pages/Cart.tsx", import.meta.url), "utf8");
const orders = readFileSync(new URL("../client/src/pages/Orders.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("storefront responsive layout", () => {
  it("uses a touch-friendly shell and responsive footer across public pages", () => {
    expect(shell).toContain("store-shell");
    expect(shell).toContain("h-[68px]");
    expect(shell).toContain("h-10 w-10 sm:h-9 sm:w-9");
    expect(shell).toContain("md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]");
    expect(shell).toContain("sm:grid-cols-[1fr_auto_1fr]");
    expect(shell).toContain("justify-self-center whitespace-nowrap");
    expect(shell).toContain("ThumbsUp");
    expect(shell).toContain("Send");
    expect(shell).toContain("MessageCircle");
    expect(shell).toContain("Music2");
  });

  it("keeps homepage, catalog, and product details readable on narrow screens", () => {
    expect(home).toContain("min-h-[530px]");
    expect(home).toContain("grid gap-3 sm:mt-8 sm:flex sm:flex-wrap");
    expect(home).toContain('const ANDROID_APK_URL = "/manus-storage/gamepay-android-debug_f4fe2d12.apk"');
    expect(home).toContain('download="Game-Pay-Android-Debug.apk"');
    expect(home).toContain("تنزيل تطبيق Android");
    expect(catalog).toContain("const [filtersOpen, setFiltersOpen] = useState(false)");
    expect(catalog).toContain('filtersOpen ? "إخفاء الفلاتر" : "إظهار الفلاتر"');
    expect(catalog).toContain('lg:block ${filtersOpen ? "block" : "hidden"}');
    expect(product).toContain("min-h-[260px]");
    expect(product).toContain("grid gap-3 sm:mt-7 sm:flex sm:flex-wrap");
  });

  it("stacks product actions and preserves comfortable cart and order controls on phones", () => {
    expect(card).toContain("grid gap-2 border-t");
    expect(card).toContain("sm:grid-cols-2");
    expect(cart).toContain("flex flex-wrap items-center justify-between gap-3");
    expect(cart).toContain("grid h-10 w-10 place-items-center");
    expect(orders).toContain("p-4 last:border-b-0 sm:gap-4 sm:p-5");
    expect(styles).toContain(".store-shell .page-hero .container");
    expect(styles).toContain(".store-shell .empty-state");
    expect(styles).toContain(".store-shell > main > section.container > div[class*=\"rounded-[28px]\"]");
    expect(styles).toContain(".store-shell > main > section.container form > aside");
  });
});
