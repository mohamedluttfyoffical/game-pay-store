import { useAuth } from "@/_core/hooks/useAuth";
import { StoreShell } from "@/components/StoreShell";
import { fulfillmentLabel, formatPrice, paymentLabel } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ClipboardList, ExternalLink, PackageCheck } from "lucide-react";
import { useLocation } from "wouter";

export default function Orders() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const orders = trpc.orders.mine.useQuery(undefined, { enabled: Boolean(user) });
  if (!loading && !user) return <StoreShell><div className="container py-20"><div className="empty-state"><ClipboardList className="h-8 w-8 text-slate-500" /><h1>سجّل الدخول لرؤية طلباتك</h1><button onClick={() => setLocation("/login")} className="btn-primary mt-4">تسجيل الدخول</button></div></div></StoreShell>;
  return <StoreShell><section className="container py-6 sm:py-12"><span className="eyebrow">حسابي</span><h1 className="mt-4 text-3xl font-black text-white">طلباتي</h1><p className="mt-3 text-sm text-slate-400">تابع حالة الدفع والتسليم لكل طلب من مكان واحد.</p>{orders.isLoading ? <div className="mt-6 grid gap-3 sm:mt-8">{Array.from({ length: 3 }).map((_, index) => <div className="h-28 animate-pulse rounded-2xl bg-white/[.05]" key={index} />)}</div> : orders.data?.length ? <div className="mt-6 overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929] sm:mt-8">{orders.data.map(order => <article key={order.id} className="grid gap-3 border-b border-white/[.07] p-4 last:border-b-0 sm:gap-4 sm:p-5 md:grid-cols-[1.2fr_.8fr_.7fr_auto] md:items-center"><div><strong className="text-white">{order.reference}</strong><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString("ar-EG")}</p></div><div><span className="block text-xs text-slate-500">الإجمالي</span><strong className="text-sm text-cyan-200">{formatPrice(order.total)}</strong></div><div className="flex flex-wrap gap-2"><span className="badge-neutral">{paymentLabel[order.paymentStatus]}</span><span className="badge-neutral">{fulfillmentLabel[order.fulfillmentStatus]}</span></div><button onClick={() => setLocation(`/order-success/${order.reference}`)} className="btn-secondary text-xs">التفاصيل <ExternalLink className="h-3.5 w-3.5" /></button></article>)}</div> : <div className="empty-state mt-6 sm:mt-8"><PackageCheck className="h-8 w-8 text-slate-500" /><h2>لا توجد طلبات حتى الآن</h2><p>بعد إتمام الطلب ستظهر تفاصيله وحالة تسليمه هنا.</p><button onClick={() => setLocation("/store")} className="btn-primary mt-4">تصفح المتجر</button></div>}</section></StoreShell>;
}
