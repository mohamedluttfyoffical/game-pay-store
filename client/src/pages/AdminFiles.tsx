import AdminAssets from "@/components/AdminAssets";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminFiles() {
  const [, setLocation] = useLocation();
  const session = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  useEffect(() => { if (!session.isLoading && !session.data) setLocation("/admin/login"); }, [session.data, session.isLoading, setLocation]);
  if (session.isLoading) return <div className="grid min-h-screen place-items-center bg-[#07111f]"><Loader2 className="h-7 w-7 animate-spin text-cyan-300" /></div>;
  if (!session.data) return null;
  return <DashboardLayout skipCustomerAuth><main dir="rtl" className="admin-page min-h-[calc(100vh-2rem)] bg-[#07111f] text-slate-100"><header className="flex flex-col gap-3 border-b border-white/[.08] pb-5 sm:pb-6 md:flex-row md:items-end md:justify-between"><div><span className="eyebrow">Game Pay · إدارة المتجر</span><div className="mt-3 flex items-center gap-2"><FolderOpen className="h-5 w-5 text-cyan-300 sm:h-6 sm:w-6" /><h1 className="text-xl font-black text-white sm:text-2xl">الملفات</h1></div><p className="mt-2 text-sm text-slate-400">ارفع وأدر صور ومواد العرض المستخدمة داخل المتجر.</p></div><button onClick={() => setLocation("/admin")} className="btn-secondary text-xs">العودة للوحة الإدارة</button></header><div className="py-5 sm:py-7"><AdminAssets /></div></main></DashboardLayout>;
}
