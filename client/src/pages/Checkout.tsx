import { useAuth } from "@/_core/hooks/useAuth";
import { StoreShell } from "@/components/StoreShell";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { CreditCard, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const methods = trpc.catalog.paymentMethods.useQuery();
  const wallet = trpc.wallet.summary.useQuery(undefined, { enabled: Boolean(user) });
  const [form, setForm] = useState({ name: "", email: "", phone: "", accountData: "", couponCode: "", paymentMethod: "demo_gateway" });
  const create = trpc.orders.create.useMutation({
    onSuccess: order => { clear(); toast.success("تم إنشاء طلبك بنجاح"); setLocation(`/order-success/${order.reference}`); },
    onError: error => toast.error(error.message),
  });
  const needsAccountData = lines.some(line => line.product.type === "topup" || line.product.type === "account");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!lines.length) return setLocation("/store");
    if (needsAccountData && !form.accountData.trim()) {
      toast.error("أدخل Player ID أو بيانات التنفيذ المطلوبة قبل تأكيد الطلب.");
      return;
    }
    create.mutate({
      items: lines.map(line => ({ productId: line.product.id, quantity: line.quantity })),
      customerName: form.name || user?.name || "عميل Game Pay",
      customerEmail: form.email || user?.email || "customer@example.com",
      customerPhone: form.phone,
      accountData: needsAccountData ? form.accountData : undefined,
      paymentMethod: form.paymentMethod,
      couponCode: form.couponCode || undefined,
    });
  };
  if (!loading && !user) return <StoreShell><div className="container py-20"><div className="mx-auto max-w-lg rounded-3xl border border-cyan-300/15 bg-[#0d1929] p-8 text-center"><LockKeyhole className="mx-auto h-9 w-9 text-cyan-300" /><h1 className="mt-5 text-2xl font-black text-white">سجّل الدخول لإتمام الطلب</h1><p className="mt-3 text-sm leading-7 text-slate-400">نحتاج إلى حسابك في Game Pay لحفظ طلباتك وإشعارات التسليم بأمان.</p><button onClick={() => setLocation("/login")} className="btn-primary mt-6 px-5 py-3">تسجيل الدخول والمتابعة</button></div></div></StoreShell>;
  if (!lines.length) { setLocation("/cart"); return null; }
  return <StoreShell><section className="container py-12"><span className="eyebrow">إتمام الطلب</span><h1 className="mt-4 text-3xl font-black text-white">بياناتك وخدمة الشحن</h1><p className="mt-3 text-sm text-slate-400">المنتجات رقمية، ولذلك لن نطلب منك عنوان شحن.</p><form onSubmit={submit} className="mt-8 grid gap-7 lg:grid-cols-[1fr_340px]"><div className="space-y-6"><section className="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5"><div className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-cyan-300" /><h2 className="font-bold">بيانات العميل</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="field-label sm:col-span-2">الاسم<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder={user?.name || "الاسم الكامل"} className="field-input" /></label><label className="field-label">البريد الإلكتروني<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder={user?.email || "name@example.com"} className="field-input" /></label><label className="field-label">رقم الهاتف<input required value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="05xxxxxxxx" className="field-input" /></label></div></section>{needsAccountData && <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[.04] p-5"><div className="flex items-center gap-2 text-white"><LockKeyhole className="h-5 w-5 text-cyan-300" /><h2 className="font-bold">بيانات تنفيذ الخدمة</h2></div><p className="mt-2 text-xs leading-6 text-slate-400">أدخل Player ID أو معرّف الحساب المطلوب فقط. لا تشارك كلمة المرور أبدًا.</p><label className="field-label mt-4">معرّف اللاعب أو الحساب<textarea required value={form.accountData} onChange={event => setForm({ ...form, accountData: event.target.value })} placeholder="مثال: Player ID / UID" className="field-input min-h-24 resize-y" /></label></section>}<section className="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5"><div className="flex items-center gap-2 text-white"><CreditCard className="h-5 w-5 text-cyan-300" /><h2 className="font-bold">طريقة الدفع</h2></div><div className="mt-4 grid gap-3">{user && <label className={`cursor-pointer rounded-xl border p-4 transition ${form.paymentMethod === "wallet" ? "border-cyan-300/60 bg-cyan-300/[.07]" : "border-white/10 bg-white/[.02]"}`}><input className="sr-only" type="radio" name="payment" checked={form.paymentMethod === "wallet"} onChange={() => setForm({ ...form, paymentMethod: "wallet" })} /><div className="flex items-start justify-between gap-3"><div><strong className="flex items-center gap-2 text-sm text-white"><WalletCards className="h-4 w-4 text-cyan-300" />رصيد محفظة Game Pay</strong><span className="mt-1 block text-xs text-slate-400">يُخصم المبلغ كاملًا من رصيدك عند تأكيد الطلب.</span></div><strong className="shrink-0 text-sm text-cyan-200">{formatPrice(wallet.data?.wallet.balance ?? 0)}</strong></div>{Number(wallet.data?.wallet.balance ?? 0) < subtotal && <span className="mt-2 block text-[11px] text-amber-200">قد لا يكفي الرصيد قبل احتساب الكوبون. يُتحقق من القيمة النهائية عند التأكيد.</span>}</label>}{methods.data?.map(method => <label key={method.code} className={`cursor-pointer rounded-xl border p-4 transition ${form.paymentMethod === method.code ? "border-cyan-300/60 bg-cyan-300/[.07]" : "border-white/10 bg-white/[.02]"}`}><input className="sr-only" type="radio" name="payment" checked={form.paymentMethod === method.code} onChange={() => setForm({ ...form, paymentMethod: method.code })} /><strong className="text-sm text-white">{method.name}</strong><span className="mt-1 block text-xs text-slate-400">{method.description}</span>{method.isTest && <span className="mt-2 inline-block text-[11px] font-bold text-cyan-300">وضع تجريبي</span>}</label>)}</div></section></div><aside className="h-fit rounded-2xl border border-cyan-300/15 bg-gradient-to-b from-cyan-400/10 to-[#0d1929] p-5 lg:sticky lg:top-24"><h2 className="font-bold text-white">مراجعة الطلب</h2><div className="mt-4 space-y-3">{lines.map(line => <div key={line.product.id} className="flex justify-between gap-4 text-sm"><span className="line-clamp-1 text-slate-300">{line.product.name} × {line.quantity}</span><span className="shrink-0 text-cyan-200">{formatPrice(Number(line.product.price) * line.quantity)}</span></div>)}</div><label className="field-label mt-5">كوبون الخصم<input value={form.couponCode} onChange={event => setForm({ ...form, couponCode: event.target.value.toUpperCase() })} placeholder="اختياري" className="field-input uppercase" /></label><div className="mt-5 border-t border-white/10 pt-4"><div className="flex justify-between font-bold text-white"><span>الإجمالي</span><span className="text-cyan-200">{formatPrice(subtotal)}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">يُراجع الكوبون والرصيد عند تأكيد الطلب.</p></div><button disabled={create.isPending} className="btn-primary mt-6 w-full py-3.5 disabled:opacity-50">{create.isPending ? "جارٍ إنشاء الطلب..." : "تأكيد الطلب"}</button></aside></form></section></StoreShell>;
}
