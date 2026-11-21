import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { catalogRouter } from "./catalogRouter";
import { ordersRouter } from "./ordersRouter";
import { profileRouter } from "./profileRouter";
import { customerAuthRouter } from "./customerAuth";
import { homepageRouter } from "./homepageRouter";
import { adminAuthRouter } from "./adminAuth";
import { walletRouter } from "./walletRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user || "passwordHash" in opts.ctx.user) return null;
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  customerAuth: customerAuthRouter,
  adminAuth: adminAuthRouter,
  catalog: catalogRouter,
  orders: ordersRouter,
  profile: profileRouter,
  wallet: walletRouter,
  homepage: homepageRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
