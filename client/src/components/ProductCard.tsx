import { useCart } from "@/contexts/CartContext";
import { formatPrice, gameLabel, typeLabel, type StoreProduct } from "@/lib/store";
import { ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: StoreProduct }) {
  const [, setLocation] = useLocation();
  const { add } = useCart();
  const addToCart = () => { add(product); toast.success("أُضيف المنتج إلى سلتك"); };
  return <article className="product-card group"><button onClick={() => setLocation(`/product/${product.slug}`)} className="block w-full text-right"><div className="relative"><ProductVisual product={product} className="h-36 w-full transition duration-300 group-hover:scale-[1.03] sm:h-40" />{product.discountPercent > 0 && <span className="absolute right-3 top-3 rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-black text-slate-950">خصم {product.discountPercent}%</span>}<span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] font-bold text-slate-200 backdrop-blur">{typeLabel[product.type]}</span></div><div className="p-3 sm:p-4"><p className="text-xs text-cyan-300">{gameLabel[product.gameSlug] ?? product.gameSlug}</p><h3 className="mt-1 text-sm font-bold leading-6 text-white sm:min-h-12">{product.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{product.description}</p>{product.accountProfile && <p className="mt-2 line-clamp-1 text-[11px] text-slate-500">المستوى {product.accountProfile.level} · {product.accountProfile.highlights}</p>}<div className="mt-4 flex items-end justify-between gap-3"><div><strong className="text-base text-white">{formatPrice(product.price)}</strong>{product.compareAtPrice && <span className="mr-2 text-xs text-slate-500 line-through">{formatPrice(product.compareAtPrice)}</span>}</div><span className="shrink-0 text-[11px] text-slate-500">{product.deliveryEta}</span></div></div></button><div className="grid gap-2 border-t border-white/[.07] p-3 sm:grid-cols-2"><button onClick={() => setLocation(`/product/${product.slug}`)} className="btn-secondary text-xs"><Zap className="h-3.5 w-3.5" />شراء الآن</button><button onClick={addToCart} className="btn-primary text-xs"><ShoppingCart className="h-3.5 w-3.5" />أضف للسلة</button></div></article>;
}
