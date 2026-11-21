import { z } from "zod";
import { getCatalogGames, getPublicCatalog, getPublicProductBySlug, getPublicStoreAssets, listPaymentMethods } from "./storeDb";
import { publicProcedure, router } from "./_core/trpc";

export const catalogRouter = router({
  games: publicProcedure.query(() => getCatalogGames()),
  list: publicProcedure
    .input(z.object({
      q: z.string().max(120).optional(),
      game: z.string().max(80).optional(),
      type: z.enum(["topup", "digital", "account"]).optional(),
      sort: z.enum(["newest", "popular", "price_asc", "price_desc", "discount"]).optional(),
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      discountOnly: z.boolean().optional(),
    }).nullish())
    .query(({ input }) => getPublicCatalog(input ?? undefined)),
  bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(140) })).query(({ input }) => getPublicProductBySlug(input.slug)),
  assets: publicProcedure.query(() => getPublicStoreAssets()),
  paymentMethods: publicProcedure.query(() => listPaymentMethods()),
});
