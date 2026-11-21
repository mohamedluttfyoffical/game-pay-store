import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, router } from "./_core/trpc";
import { isCustomer } from "./customerSession";
import { createStoreOrder, getCustomerNotifications, getCustomerOrderByReference, getCustomerOrders, markAllCustomerNotificationsRead, markCustomerNotificationRead } from "./storeDb";

export const ordersRouter = router({
  create: protectedProcedure
    .input(z.object({
      items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(10) })).min(1).max(8),
      customerName: z.string().trim().min(2).max(160),
      customerEmail: z.string().email().max(320),
      customerPhone: z.string().trim().min(6).max(48),
      accountData: z.string().trim().max(500).optional(),
      paymentMethod: z.string().min(1).max(80),
      couponCode: z.string().trim().max(48).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isCustomer(ctx.user)) throw new Error("يجب تسجيل الدخول بحساب Game Pay لإتمام الطلب.");
      const order = await createStoreOrder({ ...input, customer: ctx.user });
      await notifyOwner({
        title: "طلب جديد في Game Pay",
        content: `تم إنشاء الطلب ${order.reference}${order.paid ? " وتأكيد الدفع التجريبي." : "."}`,
      });
      return order;
    }),
  mine: protectedProcedure.query(({ ctx }) => { if (!isCustomer(ctx.user)) throw new Error("حساب العميل مطلوب."); return getCustomerOrders(ctx.user.id); }),
  byReference: protectedProcedure.input(z.object({ reference: z.string().min(4).max(48) })).query(({ ctx, input }) => { if (!isCustomer(ctx.user)) throw new Error("حساب العميل مطلوب."); return getCustomerOrderByReference(ctx.user.id, input.reference); }),
  notifications: protectedProcedure.query(({ ctx }) => { if (!isCustomer(ctx.user)) throw new Error("حساب العميل مطلوب."); return getCustomerNotifications(ctx.user.id); }),
  markNotificationRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => { if (!isCustomer(ctx.user)) throw new Error("حساب العميل مطلوب."); return markCustomerNotificationRead(ctx.user.id, input.id); }),
  markAllNotificationsRead: protectedProcedure.mutation(({ ctx }) => { if (!isCustomer(ctx.user)) throw new Error("حساب العميل مطلوب."); return markAllCustomerNotificationsRead(ctx.user.id); }),
});
