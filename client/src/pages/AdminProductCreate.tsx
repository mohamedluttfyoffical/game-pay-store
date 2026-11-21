import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ImagePlus, Images, Loader2, Save, Star, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ProductImageDraft = { imageUrl: string; imageKey: string; isPrimary: boolean };

const initial = {
  slug: "",
  name: "",
  gameSlug: "efootball",
  type: "topup" as "topup" | "digital" | "account",
  shortDescription: "",
  description: "",
  details: "تفاصيل المنتج",
  useInstructions: "تعليمات الاستخدام",
  deliveryEta: "خلال 5–20 دقيقة",
  price: 0,
  compareAtPrice: null as number | null,
  costPrice: null as number | null,
  discountPercent: 0,
  sku: "",
  stock: 1,
  status: "draft" as "active" | "inactive" | "draft" | "sold_out",
  imageUrl: null as string | null,
  imageKey: null as string | null,
  images: [] as ProductImageDraft[],
  sensitiveDelivery: null as string | null,
  seoTitle: "",
  featured: false,
  popular: false,
};

function normalizeImages(images: ProductImageDraft[]) {
  const uniqueImages = Array.from(new Map(images.map(image => [image.imageKey, image])).values()).slice(0, 8);
  const primaryKey = uniqueImages.find(image => image.isPrimary)?.imageKey ?? uniqueImages[0]?.imageKey;
  return uniqueImages.map(image => ({ ...image, isPrimary: image.imageKey === primaryKey }));
}

function ProductImageLibrary({ selectedImageKeys, onToggle, onManage }: { selectedImageKeys: string[]; onToggle: (image: Omit<ProductImageDraft, "isPrimary">) => void; onManage: () => void }) {
  const assets = trpc.admin.assets.useQuery();
  const productImages = (assets.data ?? []).filter(asset => asset.category === "product" && asset.isActive);

  return <div className="space-y-3 rounded-xl border border-white/[.08] bg-[#07111f]/50 p-3">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold"><Images className="h-4 w-4 text-cyan-200" />اختر من مكتبة الملفات</h3>
        <p className="mt-1 text-xs text-slate-500">اختر حتى 8 صور من صور المنتجات النشطة.</p>
      </div>
      <button type="button" onClick={onManage} className="btn-secondary shrink-0 text-xs">إدارة الملفات</button>
    </div>
    {assets.isLoading ? <p className="text-xs text-slate-500">جارٍ تحميل صور المنتجات...</p> : productImages.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {productImages.map(asset => {
        const selected = selectedImageKeys.includes(asset.imageKey);
        return <button
          key={asset.id}
          type="button"
          onClick={() => onToggle({ imageUrl: asset.imageUrl, imageKey: asset.imageKey })}
          aria-pressed={selected}
          className={`group overflow-hidden rounded-lg border text-right transition-colors ${selected ? "border-cyan-300 ring-2 ring-cyan-300/25" : "border-white/[.08] hover:border-cyan-300/60"}`}
        >
          <img src={asset.imageUrl} alt={asset.title} className="h-20 w-full object-cover" />
          <span className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-slate-300"><span className="truncate">{asset.title}</span><span className={selected ? "text-cyan-200" : "text-slate-500"}>{selected ? "مضافة" : "إضافة"}</span></span>
        </button>;
      })}
    </div> : <p className="text-xs leading-6 text-slate-500">لا توجد صور منتجات نشطة في المكتبة. أضف صورة ضمن تصنيف «صور المنتجات» لتظهر هنا.</p>}
  </div>;
}

export default function AdminProductCreate() {
  const [location, setLocation] = useLocation();
  const session = trpc.adminAuth.me.useQuery(undefined, { retry: false });
  const [draft, setDraft] = useState(initial);
  const editingId = Number(new URLSearchParams(location.split("?")[1] ?? "").get("id")) || null;
  const products = trpc.admin.products.useQuery(undefined, { enabled: Boolean(session.data) });
  const utils = trpc.useUtils();
  const upload = trpc.admin.uploadProductImage.useMutation({
    onSuccess: file => setDraft(current => {
      const images = normalizeImages([...current.images, { imageUrl: file.url, imageKey: file.key, isPrimary: current.images.length === 0 }]);
      const primary = images.find(image => image.isPrimary) ?? null;
      return { ...current, images, imageUrl: primary?.imageUrl ?? null, imageKey: primary?.imageKey ?? null };
    }),
    onError: error => toast.error(error.message),
  });
  const save = trpc.admin.saveProduct.useMutation({
    onSuccess: async () => {
      await utils.admin.products.invalidate();
      toast.success(editingId ? "تم تعديل المنتج" : "تم إنشاء المنتج");
      setLocation("/admin");
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!session.isLoading && !session.data) setLocation("/admin/login");
  }, [session.data, session.isLoading, setLocation]);

  useEffect(() => {
    const product = products.data?.find(item => item.id === editingId);
    if (!product) return;
    const images = normalizeImages(product.images?.length ? product.images : product.imageUrl && product.imageKey ? [{ imageUrl: product.imageUrl, imageKey: product.imageKey, isPrimary: true }] : []);
    const primary = images.find(image => image.isPrimary) ?? null;
    setDraft({
      ...initial,
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      shortDescription: product.shortDescription ?? "",
      sku: product.sku ?? "",
      seoTitle: product.seoTitle ?? "",
      images,
      imageUrl: primary?.imageUrl ?? product.imageUrl ?? null,
      imageKey: primary?.imageKey ?? product.imageKey ?? null,
    });
  }, [editingId, products.data]);

  if (session.isLoading) return <div className="grid min-h-screen place-items-center bg-[#07111f]"><Loader2 className="animate-spin text-cyan-300" /></div>;
  if (!session.data) return null;

  const updateImages = (nextImages: ProductImageDraft[]) => setDraft(current => {
    const images = normalizeImages(nextImages);
    const primary = images.find(image => image.isPrimary) ?? null;
    return { ...current, images, imageUrl: primary?.imageUrl ?? null, imageKey: primary?.imageKey ?? null };
  });
  const toggleLibraryImage = (image: Omit<ProductImageDraft, "isPrimary">) => {
    if (draft.images.some(item => item.imageKey === image.imageKey)) return updateImages(draft.images.filter(item => item.imageKey !== image.imageKey));
    if (draft.images.length >= 8) return toast.error("يمكن إضافة 8 صور كحد أقصى لكل منتج.");
    updateImages([...draft.images, { ...image, isPrimary: draft.images.length === 0 }]);
  };
  const fileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const accepted = files.filter(file => ["image/jpeg", "image/png", "image/webp"].includes(file.type)).slice(0, Math.max(0, 8 - draft.images.length));
    if (!accepted.length) return toast.error(draft.images.length >= 8 ? "يمكن إضافة 8 صور كحد أقصى لكل منتج." : "استخدم JPG أو PNG أو WEBP فقط.");
    if (accepted.length < files.length) toast.message("تمت إضافة الصور المدعومة ضمن الحد الأقصى فقط.");
    accepted.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => upload.mutate({ filename: file.name, mimeType: file.type as "image/jpeg" | "image/png" | "image/webp", dataUrl: String(reader.result) });
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };
  const field = (label: string, key: keyof typeof draft, type = "text") => <label className="field-label">{label}<input type={type} value={(draft[key] ?? "") as string | number} onChange={e => setDraft({ ...draft, [key]: type === "number" ? Number(e.target.value) : e.target.value })} className="field-input" /></label>;

  return <DashboardLayout skipCustomerAuth><main dir="rtl" className="admin-page min-h-[calc(100vh-2rem)] bg-[#07111f] text-slate-100">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[.08] pb-6">
      <div><span className="eyebrow">Game Pay · المنتجات</span><h1 className="mt-3 text-xl font-black sm:text-2xl">{editingId ? "تعديل المنتج" : "إضافة منتج"}</h1></div>
      <button onClick={() => setLocation("/admin")} className="btn-secondary text-xs">العودة للوحة الإدارة</button>
    </header>
    <div className="mt-7 grid gap-5 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-4 sm:p-5">
        <h2 className="font-bold">بيانات المنتج</h2>
        {field("اسم المنتج", "name")}
        <label className="field-label">وصف قصير<textarea value={draft.shortDescription} onChange={e => setDraft({ ...draft, shortDescription: e.target.value })} className="field-input min-h-20" /></label>
        <label className="field-label">وصف المنتج<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="field-input min-h-28" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">الحالة<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as typeof draft.status })} className="field-select"><option value="active">نشط</option><option value="inactive">غير نشط</option><option value="draft">غير مدرج</option></select></label>
          <label className="field-label">الفئة<select value={draft.gameSlug} onChange={e => setDraft({ ...draft, gameSlug: e.target.value })} className="field-select"><option value="efootball">eFootball</option><option value="pubg">PUBG</option><option value="fc-mobile">FC Mobile</option><option value="cod-mobile">COD Mobile</option><option value="free-fire">Free Fire</option><option value="roblox">Roblox</option></select></label>
        </div>
        <ProductImageLibrary selectedImageKeys={draft.images.map(image => image.imageKey)} onToggle={toggleLibraryImage} onManage={() => setLocation("/admin/files")} />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-300/30 p-3 text-xs text-cyan-200"><ImagePlus className="h-4 w-4" />{upload.isPending ? "جارٍ رفع الصور..." : "أو ارفع صورًا جديدة"}<input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={fileChange} /></label>
        {draft.images.length ? <div className="space-y-2 rounded-xl border border-white/[.08] bg-[#07111f]/50 p-3"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">صور المنتج ({draft.images.length}/8)</h3><p className="mt-1 text-xs text-slate-500">عيّن صورة واحدة رئيسية للعرض في المتجر.</p></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{draft.images.map(image => <article key={image.imageKey} className={`relative overflow-hidden rounded-lg border ${image.isPrimary ? "border-cyan-300 ring-2 ring-cyan-300/25" : "border-white/[.08]"}`}><img src={image.imageUrl} alt="صورة المنتج المحددة" className="h-24 w-full object-cover" />{image.isPrimary && <span className="absolute right-1 top-1 rounded bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">الرئيسية</span>}<div className="flex gap-1 p-1"><button type="button" onClick={() => updateImages(draft.images.map(item => ({ ...item, isPrimary: item.imageKey === image.imageKey })))} disabled={image.isPrimary} className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[.06] px-1 py-1 text-[10px] text-slate-200 disabled:opacity-40"><Star className="h-3 w-3" />رئيسية</button><button type="button" onClick={() => updateImages(draft.images.filter(item => item.imageKey !== image.imageKey))} className="grid place-items-center rounded bg-rose-400/10 px-1.5 text-rose-300" aria-label="إزالة الصورة"><X className="h-3.5 w-3.5" /></button></div></article>)}</div></div> : <p className="rounded-xl border border-dashed border-white/[.10] p-3 text-xs text-slate-500">اختر صورًا من المكتبة أو ارفع صورًا جديدة لعرضها مع المنتج.</p>}
      </section>
      <section className="space-y-4 rounded-2xl border border-white/[.08] bg-[#0d1929] p-4 sm:p-5">
        <h2 className="font-bold">التسعير والمخزون</h2>
        <div className="grid gap-3 sm:grid-cols-3">{field("سعر المنتج", "price", "number")}{field("سعر الخصم", "compareAtPrice", "number")}{field("سعر التكلفة", "costPrice", "number")}</div>
        <div className="grid grid-cols-2 gap-3">{field("SKU", "sku")}{field("الكمية", "stock", "number")}</div>
        <h2 className="pt-2 font-bold">تهيئة محركات البحث (SEO)</h2>
        {field("رابط URL للمنتج", "slug")}
        {field("اسم SEO", "seoTitle")}
        <button onClick={() => save.mutate({ ...draft, id: editingId ?? undefined, compareAtPrice: draft.compareAtPrice || null, costPrice: draft.costPrice || null, seoTitle: draft.seoTitle || null })} disabled={save.isPending || !draft.name || !draft.slug || !draft.sku || !draft.shortDescription || !draft.description} className="btn-primary w-full disabled:opacity-50"><Save className="h-4 w-4" />{save.isPending ? "جارٍ الحفظ..." : editingId ? "حفظ التعديل" : "حفظ المنتج"}</button>
      </section>
    </div>
  </main></DashboardLayout>;
}
