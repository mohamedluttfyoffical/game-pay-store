import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { customers } from "../drizzle/schema";
import { getDb } from "./db";
import { isCustomer } from "./customerSession";
import { storagePut } from "./storage";
import { protectedProcedure, router } from "./_core/trpc";

const avatarInput = z.object({
  filename: z.string().min(1).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataUrl: z.string().max(2_900_000),
});

export const profileRouter = router({
  get: protectedProcedure.query(({ ctx }) => {
    if (!isCustomer(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "حساب العميل مطلوب." });
    const { passwordHash: _hash, passwordSalt: _salt, ...safe } = ctx.user;
    return safe;
  }),
  update: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), avatarUrl: z.string().max(2000).nullable().optional(), avatarKey: z.string().max(500).nullable().optional() })).mutation(async ({ ctx, input }) => {
    if (!isCustomer(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "حساب العميل مطلوب." });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر الوصول إلى بيانات الحساب حاليًا." });
    await db.update(customers).set({ name: input.name, avatarUrl: input.avatarUrl ?? null, avatarKey: input.avatarKey ?? null }).where(eq(customers.id, ctx.user.id));
    return { id: ctx.user.id, name: input.name, email: ctx.user.email, avatarUrl: input.avatarUrl ?? null, avatarKey: input.avatarKey ?? null, role: ctx.user.role };
  }),
  uploadAvatar: protectedProcedure.input(avatarInput).mutation(async ({ ctx, input }) => {
    if (!isCustomer(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "حساب العميل مطلوب." });
    const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1] !== input.mimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "صيغة الصورة غير صالحة." });
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 2 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "الحد الأقصى لصورة الملف الشخصي هو 2 ميغابايت." });
    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    return storagePut(`avatars/${ctx.user.id}/${Date.now()}-${safeName}`, bytes, input.mimeType);
  }),
});
