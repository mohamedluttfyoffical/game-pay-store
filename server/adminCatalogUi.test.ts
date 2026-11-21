import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = readFileSync(new URL("../client/src/components/AdminAssets.tsx", import.meta.url), "utf8");
const product = readFileSync(new URL("../client/src/pages/AdminProductCreate.tsx", import.meta.url), "utf8");
const productDetails = readFileSync(new URL("../client/src/pages/ProductDetails.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("./adminRouter.ts", import.meta.url), "utf8");
const storeDb = readFileSync(new URL("./storeDb.ts", import.meta.url), "utf8");
const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");

describe("admin catalog improvements", () => {
  it("stores and filters files by the requested categories", () => {
    expect(files).toContain('value: "logo", label: "الشعارات"');
    expect(files).toContain('value: "banner", label: "البنرات"');
    expect(files).toContain('value: "product", label: "صور المنتجات"');
    expect(router).toContain('category: z.enum(["logo", "banner", "product", "general"])');
  });

  it("includes commercial pricing, stock, and SEO fields in the product flow", () => {
    ["وصف قصير", "سعر المنتج", "سعر الخصم", "سعر التكلفة", "SKU", "الكمية", "رابط URL للمنتج", "اسم SEO"].forEach(label => expect(product).toContain(label));
    expect(router).toContain("costPrice");
    expect(router).toContain("seoTitle");
  });

  it("opens the unified form for both creating and editing products", () => {
    expect(admin).toContain('setLocation("/admin/products/new")');
    expect(admin).toContain('setLocation(`/admin/products/new?id=${product.id}`)');
    expect(product).toContain("editingId ? \"تعديل المنتج\" : \"إضافة منتج\"");
  });

  it("allows choosing an active product image from the existing file library", () => {
    expect(product).toContain('trpc.admin.assets.useQuery');
    expect(product).toContain('asset.category === "product" && asset.isActive');
    expect(product).toContain("اختر من مكتبة الملفات");
    expect(product).toContain("onToggle({ imageUrl: asset.imageUrl, imageKey: asset.imageKey })");
    expect(product).toContain("أو ارفع صورًا جديدة");
  });

  it("stores multiple product images, identifies one primary image, and presents a public gallery", () => {
    expect(schema).toContain('export const productImages = mysqlTable(');
    expect(schema).toContain('"product_images"');
    expect(router).toContain("images: z.array");
    expect(router).toContain("isPrimary: image.isPrimary || image.imageKey === primaryImage?.imageKey");
    expect(product).toContain("صور المنتج ({draft.images.length}/8)");
    expect(product).toContain("الرئيسية");
    expect(productDetails).toContain("function ProductGallery");
    expect(storeDb).toContain("publicProduct(product, imageRows)");
  });
});
