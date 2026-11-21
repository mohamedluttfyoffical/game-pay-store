import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getCustomerFromSession, type StoreActor } from "../customerSession";
import { getAdminFromSession } from "../adminSession";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: StoreActor | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const requestUrl = opts.req.originalUrl ?? opts.req.url ?? "";
  const isAdminRequest = requestUrl.includes("admin.") || requestUrl.includes("adminAuth.");
  let user: StoreActor | null = isAdminRequest
    ? await getAdminFromSession(opts.req.headers.cookie)
    : await getCustomerFromSession(opts.req.headers.cookie);
  if (!user) user = isAdminRequest
    ? await getCustomerFromSession(opts.req.headers.cookie)
    : await getAdminFromSession(opts.req.headers.cookie);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
