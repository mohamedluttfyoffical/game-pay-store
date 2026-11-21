import { useAuth } from "@/_core/hooks/useAuth";
import { StoreShell } from "@/components/StoreShell";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BellRing, CheckCheck, Clock3, Loader2, LogIn, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const typeLabel: Record<string, string> = {
  order_created: "طلب جديد",
  payment_confirmed: "تأكيد الدفع",
  payment_status: "حالة الدفع",
  fulfillment_status: "حالة التنفيذ",
  wallet_topup_approved: "شحن المحفظة",
  wallet_topup_rejected: "مراجعة الشحن",
};

export default function Notifications() {
  const { user, loading } = useAuth(); const [, setLocation] = useLocation(); const utils = trpc.useUtils();
  const notifications = trpc.orders.notifications.useQuery(undefined, { enabled: Boolean(user) });
  const markRead = trpc.orders.markNotificationRead.useMutation({ onSuccess: () => utils.orders.notifications.invalidate(), onError: error => toast.error(error.message) });
  const markAllRead = trpc.orders.markAllNotificationsRead.useMutation({ onSuccess: async () => { await utils.orders.notifications.invalidate(); toast.success("تم تحديد كل الإشعارات كمقروءة"); }, onError: error => toast.error(error.message) });
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#07111f]"><Loader2 className="h-7 w-7 animate-spin text-cyan-300" /></div>;
  if (!user) return <StoreShell><section className="container py-20"><div className="empty-state"><LogIn className="h-9 w-9 text-cyan-300" /><h1>سجّل الدخول لعرض إشعاراتك</h1><p>تظهر هنا كل تحديثات الطلبات والدفع والتنفيذ والمحفظة الخاصة بحسابك.</p><button onClick={() => setLocation("/login")} className="btn-primary mt-5">تسجيل الدخول</button></div></section></StoreShell>;
  const items = notifications.data ?? []; const unread = items.filter(item => !item.readAt).length;
  const targetFor = (item: (typeof items)[number]) => item.orderReference ? `/order-success/${item.orderReference}` : item.type.startsWith("wallet_") ? "/account" : "/notifications";
  const openNotification = (item: (typeof items)[number]) => { if (!item.readAt) markRead.mutate({ id: item.id }); setLocation(targetFor(item)); };
  return <StoreShell><section className="container py-10"><div className="rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.13),transparent_40%),#0d1929] p-6 md:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-slate-950"><BellRing className="h-6 w-6" /></span><div><span className="eyebrow">مركز التنبيهات</span><h1 className="mt-2 text-3xl font-black text-white">كل الإشعارات</h1><p className="mt-2 text-sm text-slate-400">انقر على الإشعار للانتقال إلى الطلب أو الإجراء المرتبط به.</p></div></div><div className="flex items-center gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3"><span className="text-xs text-slate-500">غير مقروءة</span><strong className="mr-2 text-xl text-cyan-200">{unread}</strong></div><button disabled={!unread || markAllRead.isPending} onClick={() => markAllRead.mutate()} className="btn-secondary whitespace-nowrap text-xs disabled:opacity-40"><CheckCheck className="h-4 w-4" />{markAllRead.isPending ? "جارٍ التحديث..." : "قراءة الكل"}</button></div></div></div><section className="mt-7">{notifications.isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-white/[.05]" /> : items.length ? <div className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">{items.map(item => <button key={item.id} type="button" onClick={() => openNotification(item)} className={`flex w-full gap-4 border-b border-white/[.07] p-5 text-right transition hover:bg-white/[.035] last:border-0 ${item.readAt ? "bg-transparent" : "bg-cyan-300/[.035]"}`}><span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.readAt ? "bg-white/[.06] text-slate-400" : "bg-cyan-300 text-slate-950"}`}>{item.readAt ? <MailOpen className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><span><span className="text-[11px] font-bold text-cyan-300">{typeLabel[item.type] ?? "إشعار"}</span><strong className="mt-1 block text-white">{item.title}</strong></span><span className="flex shrink-0 items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{new Date(item.createdAt).toLocaleString("ar-EG")}</span></span><span className="mt-2 flex items-end justify-between gap-4"><span className="text-sm leading-7 text-slate-400">{item.message}</span><ArrowLeft className="mb-1 h-4 w-4 shrink-0 text-cyan-300" /></span></span></button>)}</div> : <div className="empty-state"><BellRing className="h-9 w-9 text-slate-500" /><h2>لا توجد إشعارات بعد</h2><p>ستظهر هنا تحديثات الطلبات والدفع والتنفيذ وطلبات شحن المحفظة.</p><button onClick={() => setLocation("/store")} className="btn-primary mt-4">تصفح المتجر</button></div>}</section></section></StoreShell>;
}
