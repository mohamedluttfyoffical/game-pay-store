import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, router } from "./_core/trpc";
import { isCustomer, type StoreActor } from "./customerSession";
import { storagePut } from "./storage";
import {
  cancelWalletTopupRequest,
  createWalletTopupRequest,
  getCustomerTopupRequests,
  getCustomerWallet,
  listWalletTopupMethods,
} from "./walletDb";

function requireCustomer(user: StoreActor | null): asserts user is Extract<StoreActor, { role: "customer" }> {
  if (!isCustomer(user)) throw new Error("حساب العميل مطلوب.");
}

export const walletRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    requireCustomer(ctx.user);
    return getCustomerWallet(ctx.user.id);
  }),
  methods: protectedProcedure.query(async ({ ctx }) => {
    requireCustomer(ctx.user);
    return listWalletTopupMethods();
  }),
  topups: protectedProcedure.query(async ({ ctx }) => {
    requireCustomer(ctx.user);
    return getCustomerTopupRequests(ctx.user.id);
  }),
  uploadReceipt: protectedProcedure
    .input(z.object({
      filename: z.string().min(1).max(160),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      dataUrl: z.string().max(4_000_000),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCustomer(ctx.user);
      const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[1] !== input.mimeType) throw new Error("صيغة الصورة غير صالحة.");
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length > 3 * 1024 * 1024) throw new Error("الحد الأقصى لصورة إيصال التحويل هو 3 ميغابايت.");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`receipts/${ctx.user.id}/${Date.now()}-${safeName}`, bytes, input.mimeType);
    }),
  requestTopup: protectedProcedure
    .input(z.object({
      methodId: z.number().int().positive(),
      amount: z.number().positive().max(100_000),
      reference: z.string().trim().max(160).optional(),
      customerNote: z.string().trim().max(1200).optional(),
      receiptUrl: z.string().trim().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCustomer(ctx.user);
      const noteParts: string[] = [];
      if (input.receiptUrl) {
        noteParts.push(`[صورة التحويل]: ${input.receiptUrl}`);
      }
      if (input.customerNote) {
        noteParts.push(input.customerNote);
      }
      const combinedNote = noteParts.join("\n") || undefined;
      const created = await createWalletTopupRequest({
        customerId: ctx.user.id,
        methodId: input.methodId,
        amount: input.amount,
        reference: input.reference,
        customerNote: combinedNote,
      });
      await notifyOwner({ title: "طلب شحن محفظة جديد", content: `طلب شحن بقيمة ${input.amount.toFixed(2)} ج.م عبر ${created.methodName}.` });
      return created;
    }),
  cancelTopup: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    requireCustomer(ctx.user);
    return cancelWalletTopupRequest(ctx.user.id, input.id);
  }),
});
