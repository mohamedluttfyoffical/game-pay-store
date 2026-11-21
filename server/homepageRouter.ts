import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { homepageConfigs } from "../drizzle/schema";
import { DEFAULT_HOMEPAGE_CONFIG, HOME_SECTION_KEYS, type HomepageConfig } from "../shared/homepage";
import { getDb } from "./db";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const configKey = "home";
const safeHref = z.string().min(1).max(300).refine(value => value.startsWith("/"), "يجب أن يبدأ الرابط بشرطة مائلة.");
const contentItemSchema = z.object({ title: z.string().min(2).max(120), description: z.string().min(2).max(400) });
const sectionSchema = z.object({ key: z.enum(HOME_SECTION_KEYS), visible: z.boolean(), eyebrow: z.string().max(100), title: z.string().min(2).max(160), description: z.string().max(400), ctaLabel: z.string().max(80), ctaHref: safeHref, items: z.array(contentItemSchema).max(6) });
const navigationId = z.string().regex(/^[a-zA-Z0-9_-]+$/, "معرف عنصر القائمة غير صالح.").min(2).max(50);
const navigationChildSchema = z.object({ id: navigationId, label: z.string().min(1).max(60), path: safeHref, visible: z.boolean() });
const navigationItemSchema = navigationChildSchema.extend({ children: z.array(navigationChildSchema).max(6) });
const brandSchema = z.object({ logoUrl: z.string().max(2000).nullable(), logoKey: z.string().max(500).nullable(), faviconUrl: z.string().max(2000).nullable(), faviconKey: z.string().max(500).nullable() }).superRefine((brand, ctx) => {
  if (Boolean(brand.logoUrl) !== Boolean(brand.logoKey)) ctx.addIssue({ code: "custom", message: "يجب حفظ رابط ومفتاح الشعار معًا." });
  if (Boolean(brand.faviconUrl) !== Boolean(brand.faviconKey)) ctx.addIssue({ code: "custom", message: "يجب حفظ رابط ومفتاح favicon معًا." });
});
const homepageSchema = z.object({
  brand: brandSchema,
  navigation: z.array(navigationItemSchema).min(1).max(8).superRefine((items, ctx) => {
    if (new Set(items.map(item => item.id)).size !== items.length) ctx.addIssue({ code: "custom", message: "لا يمكن تكرار معرفات بنود القائمة." });
    items.forEach((item, index) => { if (new Set(item.children.map(child => child.id)).size !== item.children.length) ctx.addIssue({ code: "custom", path: [index, "children"], message: "لا يمكن تكرار معرفات العناصر الفرعية." }); });
  }),
  hero: z.object({ eyebrow: z.string().max(100), title: z.string().min(2).max(160), accent: z.string().max(160), description: z.string().min(2).max(600), primaryLabel: z.string().min(1).max(80), primaryHref: safeHref, secondaryLabel: z.string().min(1).max(80), secondaryHref: safeHref, trustItems: z.tuple([z.string().min(1).max(100), z.string().min(1).max(100), z.string().min(1).max(100)]) }),
  sections: z.array(sectionSchema).length(HOME_SECTION_KEYS.length).superRefine((sections, ctx) => { if (new Set(sections.map(section => section.key)).size !== HOME_SECTION_KEYS.length) ctx.addIssue({ code: "custom", message: "يجب أن يظهر كل قسم مرة واحدة فقط." }); }),
});

function parseConfig(payload?: string | null): HomepageConfig {
  if (!payload) return DEFAULT_HOMEPAGE_CONFIG;
  const raw = JSON.parse(payload) as Partial<HomepageConfig>;
  const currentSections = Array.isArray(raw.sections) ? raw.sections : [];
  const merged = {
    brand: { ...DEFAULT_HOMEPAGE_CONFIG.brand, ...raw.brand },
    navigation: Array.isArray(raw.navigation) ? raw.navigation : DEFAULT_HOMEPAGE_CONFIG.navigation,
    hero: { ...DEFAULT_HOMEPAGE_CONFIG.hero, ...raw.hero, trustItems: Array.isArray(raw.hero?.trustItems) && raw.hero.trustItems.length === 3 ? raw.hero.trustItems : DEFAULT_HOMEPAGE_CONFIG.hero.trustItems },
    sections: HOME_SECTION_KEYS.map(key => {
      const base = DEFAULT_HOMEPAGE_CONFIG.sections.find(section => section.key === key)!;
      const existing = currentSections.find(section => section?.key === key);
      return { ...base, ...existing, items: Array.isArray(existing?.items) ? existing.items : base.items };
    }),
  };
  const parsed = homepageSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOMEPAGE_CONFIG;
}

async function getConfig() {
  const db = await getDb();
  if (!db) return DEFAULT_HOMEPAGE_CONFIG;
  const [row] = await db.select().from(homepageConfigs).where(eq(homepageConfigs.configKey, configKey)).limit(1);
  try { return parseConfig(row?.payload); }
  catch { return DEFAULT_HOMEPAGE_CONFIG; }
}

async function saveConfig(config: HomepageConfig, updatedBy: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر حفظ إعدادات الصفحة الرئيسية حاليًا." });
  const payload = JSON.stringify(config);
  const [existing] = await db.select({ id: homepageConfigs.id }).from(homepageConfigs).where(eq(homepageConfigs.configKey, configKey)).limit(1);
  if (existing) await db.update(homepageConfigs).set({ payload, updatedBy }).where(eq(homepageConfigs.id, existing.id));
  else await db.insert(homepageConfigs).values({ configKey, payload, updatedBy });
  return config;
}

export const homepageRouter = router({
  get: publicProcedure.query(() => getConfig()),
  adminGet: adminProcedure.query(() => getConfig()),
  save: adminProcedure.input(homepageSchema).mutation(({ ctx, input }) => saveConfig(input, ctx.user.id)),
  reset: adminProcedure.mutation(({ ctx }) => saveConfig(DEFAULT_HOMEPAGE_CONFIG, ctx.user.id)),
});
