import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { DEFAULT_HOMEPAGE_CONFIG, type HomepageConfig } from "@shared/homepage";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type BrandFile = { url: string; key: string };

export default function AdminBranding() {
  const [, setLocation] = useLocation();
  const session = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const settings = trpc.homepage.adminGet.useQuery(undefined, { enabled: Boolean(session.data) });
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<HomepageConfig | null>(null);
  useEffect(() => { if (!session.isLoading && !session.data) setLocation("/admin/login"); }, [session.data, session.isLoading, setLocation]);
  useEffect(() => { if (settings.data) setDraft(JSON.parse(JSON.stringify(settings.data))); }, [settings.data]);
  const upload = trpc.admin.uploadBrandImage.useMutation({ onError: error => toast.error(error.message) });
  const save = trpc.homepage.save.useMutation({ onSuccess: async () => { await utils.homepage.get.invalidate(); await utils.homepage.adminGet.invalidate(); toast.success("تم حفظ هوية المتجر ونشرها"); }, onError: error => toast.error(error.message) });
  if (session.isLoading || settings.isLoading || !draft) return <div className="grid min-h-screen place-items-center bg-[#07111f]"><Loader2 className="h-7 w-7 animate-spin text-cyan-300" /></div>;
  if (!session.data) return null;
  const chooseFile = (kind: "logo" | "favicon") => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error("استخدم JPG أو PNG أو WEBP فقط.");
    if (kind === "favicon" && file.type !== "image/png") return toast.error("لأفضل توافق، استخدم PNG مربعًا كـ favicon.");
    const reader = new FileReader();
    reader.onload = () => upload.mutate({ filename: file.name, mimeType: file.type as "image/jpeg" | "image/png" | "image/webp", dataUrl: String(reader.result) }, { onSuccess: (fileData: BrandFile) => { setDraft(current => current ? { ...current, brand: kind === "logo" ? { ...current.brand, logoUrl: fileData.url, logoKey: fileData.key } : { ...current.brand, faviconUrl: fileData.url, faviconKey: fileData.key } } : current); toast.success(kind === "logo" ? "تم رفع الشعار" : "تم رفع favicon"); } });
    reader.readAsDataURL(file);
  };
  const clear = (kind: "logo" | "favicon") => setDraft({ ...draft, brand: kind === "logo" ? { ...draft.brand, logoUrl: null, logoKey: null } : { ...draft.brand, faviconUrl: null, faviconKey: null } });
  return <DashboardLayout skipCustomerAuth><main dir="rtl" className="admin-page min-h-[calc(100vh-2rem)] bg-[#07111f] text-slate-100"><div className="mx-auto max-w-4xl"><header className="flex flex-col gap-4 border-b border-white/[.08] pb-5 sm:pb-6 md:flex-row md:items-end md:justify-between"><div><span className="eyebrow">Game Pay · إعدادات المتجر</span><h1 className="mt-3 text-xl font-black text-white sm:text-2xl">شعار المتجر وfavicon</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">ارفع شعارًا يظهر في الترويسة والفوتر، وصورة PNG مربعة تظهر في تبويب المتصفح. تبقى العلامة الافتراضية ظاهرة حتى تحفظ صورك الجديدة.</p></div><div className="admin-action-group flex flex-wrap gap-2"><button onClick={() => setLocation("/admin")} className="btn-secondary text-xs">العودة للوحة الإدارة</button><button onClick={() => save.mutate(draft)} disabled={save.isPending} className="btn-primary text-xs"><Save className="h-4 w-4" />{save.isPending ? "جارٍ الحفظ..." : "حفظ ونشر الهوية"}</button></div></header><section className="mt-5 grid gap-4 sm:mt-7 sm:gap-5 md:grid-cols-2">{([['logo', 'شعار المتجر', 'يفضل صورة مربعة أو أفقية بخلفية شفافة.', draft.brand.logoUrl], ['favicon', 'Favicon المتصفح', 'يفضل PNG مربعًا بدقة 512×512 أو 64×64.', draft.brand.faviconUrl]] as const).map(([kind, title, description, imageUrl]) => <article key={kind} className="rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-4 sm:p-5"><h2 className="font-bold text-white">{title}</h2><p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">{description}</p><div className="mt-5 grid aspect-square place-items-center overflow-hidden rounded-2xl border border-dashed border-cyan-300/30 bg-white/[.025] p-5">{imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-contain" /> : <span className="text-center text-xs text-slate-500">لم تُرفع صورة بعد.<br />سيظهر بديل Game Pay الافتراضي.</span>}</div><label className="btn-secondary mt-4 w-full text-xs"><ImagePlus className="h-4 w-4" />{upload.isPending ? "جارٍ الرفع..." : `رفع ${title}`}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile(kind)} /></label>{imageUrl && <button onClick={() => clear(kind)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-300 hover:text-rose-200"><Trash2 className="h-3.5 w-3.5" />إزالة الصورة والعودة للبديل الافتراضي</button>}</article>)}</section></div></main></DashboardLayout>;
}
