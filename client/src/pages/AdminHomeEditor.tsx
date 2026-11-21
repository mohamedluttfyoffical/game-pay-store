import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { HomePageEditor } from "./Admin";

export default function AdminHomeEditor() {
  const [, setLocation] = useLocation();
  const session = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  useEffect(() => { if (!session.isLoading && !session.data) setLocation("/admin/login"); }, [session.data, session.isLoading, setLocation]);
  if (session.isLoading) return <div className="grid min-h-screen place-items-center bg-[#07111f]"><Loader2 className="h-7 w-7 animate-spin text-cyan-300" /></div>;
  if (!session.data) return null;
  return <DashboardLayout skipCustomerAuth><main dir="rtl" className="admin-page min-h-[calc(100vh-2rem)] bg-[#07111f] p-0 text-slate-100 sm:p-1"><HomePageEditor standalone /></main></DashboardLayout>;
}
