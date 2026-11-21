import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, router } from "./_core/trpc";
import { isCustomer, type StoreActor } from "./customerSession";
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
  requestTopup: protectedProcedure
    .input(z.object({
      methodId: z.number().int().positive(),
      amount: z.number().positive().max(100_000),
      reference: z.string().trim().max(160).optional(),
      customerNote: z.string().trim().max(800).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCustomer(ctx.user);
      const created = await createWalletTopupRequest({ customerId: ctx.user.id, ...input });
      await notifyOwner({ title: "طلب شحن محفظة جديد", content: `طلب شحن بقيمة ${input.amount.toFixed(2)} ج.م عبر ${created.methodName}.` });
      return created;
    }),
  cancelTopup: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    requireCustomer(ctx.user);
    return cancelWalletTopupRequest(ctx.user.id, input.id);
  }),
});
