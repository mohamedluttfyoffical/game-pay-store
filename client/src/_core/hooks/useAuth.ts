import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = { redirectOnUnauthenticated?: boolean; redirectPath?: string };

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const utils = trpc.useUtils();
  const meQuery = trpc.customerAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.customerAuth.logout.useMutation({ onSuccess: () => utils.customerAuth.me.setData(undefined, null) });
  const logout = useCallback(async () => {
    try { await logoutMutation.mutateAsync(); }
    catch (error) { if (!(error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED")) throw error; }
    finally { utils.customerAuth.me.setData(undefined, null); await utils.customerAuth.me.invalidate(); }
  }, [logoutMutation, utils]);
  const state = useMemo(() => ({ user: meQuery.data ?? null, loading: meQuery.isLoading || logoutMutation.isPending, error: meQuery.error ?? logoutMutation.error ?? null, isAuthenticated: Boolean(meQuery.data) }), [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending]);
  useEffect(() => { if (redirectOnUnauthenticated && !meQuery.isLoading && !logoutMutation.isPending && !state.user && window.location.pathname !== redirectPath) window.location.href = redirectPath; }, [redirectOnUnauthenticated, redirectPath, meQuery.isLoading, logoutMutation.isPending, state.user]);
  return { ...state, refresh: () => meQuery.refetch(), logout };
}
