import { ProductVisual } from "@/components/ProductVisual";
import { StoreShell } from "@/components/StoreShell";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, gameLabel, typeLabel, type StoreProduct } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Clock3, LockKeyhole, PackageCheck, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const { add } = useCart();
  const productQuery = trpc.catalog.bySlug.useQuery({ slug: params?.slug ?? "" });
  if (productQuery.isLoading) return <StoreShell><div className="container py-20"><div className="h-96 animate-pulse rounded-3xl bg-white/[.05]" /></div></StoreShell>;
  const product = productQuery.data as StoreProduct | null | undefined;
  if (!product) return <StoreShell><div className="container py-20"><div className="empty-state"><h1>هذا المنتج غير متاح</h1><p>ربما تمت إزالته أو تغيّرت حالته.</p><button onClick={() => setLocation("/store")} className="btn-primary mt-4">العودة للمتجر</button></div></div></StoreShell>;
  const addToCart = () => { add(product); toast.success("أُضيف المنتج إلى سلتك"); };
  const buyNow = () => { add(product); setLocation("/checkout"); };
  return <StoreShell><section className="container py-6 sm:py-8"><button onClick={() => setLocation("/store")} className="mb-5 flex min-h-11 items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 sm:mb-7"><ArrowRight className="h-4 w-4" />العودة إلى المتجر</button><div className="grid gap-6 sm:gap-8 lg:grid-cols-[.9fr_1.1fr]"><ProductGallery product={product} /><div><div className="flex flex-wrap items-center gap-2"><span className="badge-neutral">{typeLabel[product.type]}</span><span className="badge-neutral">{gameLabel[product.gameSlug]}</span>{product.discountPercent > 0 && <span className="badge-cyan">خصم {product.discountPercent}%</span>}</div><h1 className="mt-4 text-3xl font-black leading-tight text-white sm:mt-5 md:text-4xl">{product.name}</h1><p className="mt-4 text-base leading-8 text-slate-300">{product.description}</p><div className="mt-6 flex items-end gap-3"><strong className="text-3xl text-cyan-200">{formatPrice(product.price)}</strong>{product.compareAtPrice && <span className="mb-1 text-sm text-slate-500 line-through">{formatPrice(product.compareAtPrice)}</span>}</div><div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-3"><Info icon={Clock3} label="وقت التسليم" value={product.deliveryEta} /><Info icon={LockKeyhole} label="الخصوصية" value="بياناتك محمية" /><Info icon={PackageCheck} label="نوع التسليم" value="رقمي فقط" /></div><div className="mt-6 grid gap-3 sm:mt-7 sm:flex sm:flex-wrap"><button onClick={buyNow} className="btn-primary px-6 py-3.5"><ShoppingCart className="h-4 w-4" />شراء الآن</button><button onClick={addToCart} className="btn-secondary px-6 py-3.5">أضف للسلة</button></div><p className="mt-4 text-xs leading-6 text-slate-500">لا تشارك كلمة المرور. سيُطلب منك فقط بيانات الحساب الضرورية لتنفيذ الخدمة عند الحاجة.</p></div></div><div className={`mt-9 grid gap-4 sm:mt-12 ${product.accountProfile ? "md:grid-cols-4" : "md:grid-cols-3"}`}><Detail title="تفاصيل المنتج" text={product.details} />{product.accountProfile && <Detail title={`حساب بمستوى ${product.accountProfile.level}`} text={`العناصر المهمة: ${product.accountProfile.highlights}. الحالة: ${product.accountProfile.accountStatus === "available" ? "متاح" : "مباع"}.`} />}<Detail title="طريقة الاستخدام" text={product.useInstructions} /><Detail title="سياسة التسليم" text="لا تظهر بيانات المنتج أو الحساب الحساسة إلا بعد تأكيد الدفع والتحقق من حالة الطلب." /></div></section></StoreShell>;
}

function ProductGallery({ product }: { product: StoreProduct }) {
  const images = product.images.length ? product.images : product.imageUrl ? [{ imageUrl: product.imageUrl, isPrimary: true }] : [];
  const defaultImage = images.find(image => image.isPrimary)?.imageUrl ?? images[0]?.imageUrl ?? null;
  const [activeImageUrl, setActiveImageUrl] = useState(defaultImage);
  useEffect(() => setActiveImageUrl(defaultImage), [product.id, defaultImage]);
  const activeProduct = activeImageUrl ? { ...product, imageUrl: activeImageUrl } : product;
  return <div className="space-y-3"><ProductVisual product={activeProduct} className="min-h-[260px] rounded-[24px] border border-white/10 sm:min-h-[330px] sm:rounded-[28px] lg:min-h-[480px]" />{images.length > 1 && <div className="grid grid-cols-4 gap-2">{images.map((image, index) => <button key={`${image.imageUrl}-${index}`} type="button" onClick={() => setActiveImageUrl(image.imageUrl)} aria-label={`عرض صورة المنتج ${index + 1}`} aria-pressed={activeImageUrl === image.imageUrl} className={`overflow-hidden rounded-xl border transition-colors ${activeImageUrl === image.imageUrl ? "border-cyan-300 ring-2 ring-cyan-300/25" : "border-white/10 hover:border-cyan-300/60"}`}><img src={image.imageUrl} alt={`${product.name} ${index + 1}`} className="h-14 w-full object-cover sm:h-20" /></button>)}</div>}</div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="rounded-2xl border border-white/[.08] bg-white/[.03] p-3"><Icon className="h-4 w-4 text-cyan-300" /><span className="mt-3 block text-xs text-slate-500">{label}</span><strong className="mt-1 block text-xs text-slate-200">{value}</strong></div>; }
function Detail({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5"><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{text}</p></article>; }
