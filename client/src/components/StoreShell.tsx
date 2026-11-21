import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { DEFAULT_HOMEPAGE_CONFIG, type NavigationItem } from "@shared/homepage";
import { Bell, ChevronDown, Menu, MessageCircle, Music2, Search, Send, ShoppingBag, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { GameMark } from "./GameMark";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [desktopExpandedItem, setDesktopExpandedItem] = useState<string | null>(null);
  const [menuActivity, setMenuActivity] = useState(0);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const desktopMenuRef = useRef<HTMLElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();
  const { user, loading, logout } = useAuth();
  const homepage = trpc.homepage.get.useQuery();
  const navigation = (homepage.data?.navigation ?? DEFAULT_HOMEPAGE_CONFIG.navigation).filter(item => item.visible);
  const notifications = trpc.orders.notifications.useQuery(undefined, { enabled: Boolean(user) });
  const markRead = trpc.orders.markNotificationRead.useMutation({ onSuccess: () => notifications.refetch() });
  const closeMenu = () => { setOpen(false); setExpandedItem(null); setDesktopExpandedItem(null); };
  const touchMenu = () => setMenuActivity(value => value + 1);
  const navigate = (path: string) => { closeMenu(); setLocation(path); };
  const unread = notifications.data?.filter(item => !item.readAt).length ?? 0;
  const notificationTarget = (item: NonNullable<typeof notifications.data>[number]) => item.orderReference ? `/order-success/${item.orderReference}` : item.type.startsWith("wallet_") ? "/account" : "/notifications";

  useEffect(() => {
    if (!noticeOpen) return;
    const timeout = window.setTimeout(() => setNoticeOpen(false), 5000);
    const closeOutside = (event: PointerEvent) => { if (!noticeRef.current?.contains(event.target as Node)) setNoticeOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setNoticeOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { window.clearTimeout(timeout); document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [noticeOpen]);

  useEffect(() => {
    if (!open && !desktopExpandedItem) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      const toggle = (target as Element).closest?.("[data-main-menu-toggle]");
      if (!mobileMenuRef.current?.contains(target) && !desktopMenuRef.current?.contains(target) && !toggle) closeMenu();
    };
    const closeOnScroll = () => closeMenu();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeMenu(); };
    const timeout = open ? window.setTimeout(closeMenu, 5000) : undefined;
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, { passive: true, capture: true });
    return () => { if (timeout) window.clearTimeout(timeout); document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); window.removeEventListener("scroll", closeOnScroll, true); };
  }, [open, desktopExpandedItem, menuActivity]);

  const renderDesktopItem = (item: NavigationItem) => {
    const children = item.children.filter(child => child.visible);
    const active = location === item.path || children.some(child => location === child.path);
    if (!children.length) return <button key={item.id} onClick={() => navigate(item.path)} className={`rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/[.07] text-cyan-300" : "text-slate-300 hover:bg-white/[.05] hover:text-white"}`}>{item.label}</button>;
    return <div key={item.id} className="relative"><button onClick={() => { touchMenu(); setDesktopExpandedItem(current => current === item.id ? null : item.id); }} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/[.07] text-cyan-300" : "text-slate-300 hover:bg-white/[.05] hover:text-white"}`} aria-expanded={desktopExpandedItem === item.id}>{item.label}<ChevronDown className={`h-3.5 w-3.5 transition ${desktopExpandedItem === item.id ? "rotate-180" : ""}`} /></button>{desktopExpandedItem === item.id && <div className="absolute right-0 top-11 z-[60] w-52 overflow-hidden rounded-xl border border-white/10 bg-[#101d2f] p-1 shadow-2xl"><button onClick={() => navigate(item.path)} className="menu-action text-cyan-200">عرض {item.label}</button>{children.map(child => <button key={child.id} onClick={() => navigate(child.path)} className="menu-action">{child.label}</button>)}</div>}</div>;
  };

  return <div className="store-shell min-h-screen bg-[#07111f] text-slate-100" dir="rtl"><header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#07111f]/85 backdrop-blur-xl"><div className="container flex h-[68px] items-center justify-between gap-2 sm:h-[72px] sm:gap-3"><button onClick={() => navigate("/")} className="shrink-0" aria-label="العودة للرئيسية"><GameMark /></button><nav ref={desktopMenuRef} className="hidden items-center gap-1 lg:flex">{navigation.map(renderDesktopItem)}</nav><div className="flex items-center gap-1 sm:gap-1.5"><button onClick={() => navigate("/store")} className="icon-button h-10 w-10 sm:h-9 sm:w-9" aria-label="بحث"><Search className="h-5 w-5" /></button>{user && <div ref={noticeRef} className="relative"><button onClick={() => setNoticeOpen(value => !value)} className="icon-button relative h-10 w-10 sm:h-9 sm:w-9" aria-label="الإشعارات" aria-expanded={noticeOpen}><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-cyan-300" />}</button>{noticeOpen && <div className="fixed inset-x-3 top-[72px] z-[60] mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#101d2f] shadow-2xl md:absolute md:left-0 md:right-auto md:top-12 md:w-80"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm font-bold"><span>الإشعارات</span><button onClick={() => { setNoticeOpen(false); navigate("/notifications"); }} className="text-xs font-bold text-cyan-200 hover:text-cyan-100">عرض كل الإشعارات</button></div><div className="max-h-[min(60vh,26rem)] overflow-auto">{notifications.data?.length ? notifications.data.slice(0, 4).map(item => <button key={item.id} onClick={() => { if (!item.readAt) markRead.mutate({ id: item.id }); setNoticeOpen(false); navigate(notificationTarget(item)); }} className="block w-full border-b border-white/[.06] px-4 py-3 text-right text-xs hover:bg-white/[.05]"><strong className="block text-slate-100">{item.title}</strong><span className="mt-1 block text-slate-400">{item.message}</span></button>) : <p className="p-5 text-center text-sm text-slate-400">لا توجد إشعارات بعد.</p>}</div></div>}</div>}<button onClick={() => navigate("/cart")} className="icon-button relative h-10 w-10 sm:h-9 sm:w-9" aria-label="السلة"><ShoppingBag className="h-5 w-5" />{count > 0 && <span className="absolute -left-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950">{count}</span>}</button><div className="hidden md:block">{loading ? <div className="h-9 w-20 animate-pulse rounded-lg bg-white/10" /> : user ? <div className="group relative"><button className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/[.05]">{user.name || "حسابي"}<ChevronDown className="h-3.5 w-3.5" /></button><div className="invisible absolute left-0 top-11 w-44 rounded-xl border border-white/10 bg-[#101d2f] p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100"><button onClick={() => navigate("/account")} className="menu-action">حسابي</button><button onClick={() => navigate("/orders")} className="menu-action">طلباتي</button><button onClick={logout} className="menu-action text-rose-300">تسجيل الخروج</button></div></div> : <button onClick={() => navigate("/login")} className="btn-primary px-4 py-2 text-sm">تسجيل الدخول</button>}</div><button data-main-menu-toggle onClick={() => { setOpen(value => !value); setExpandedItem(null); touchMenu(); }} className="icon-button h-10 w-10 lg:hidden sm:h-9 sm:w-9" aria-label="القائمة" aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div></div>{open && <nav ref={mobileMenuRef} onPointerDown={touchMenu} onFocus={touchMenu} onKeyDown={touchMenu} className="border-t border-white/[.07] bg-[#0b1728] px-3 py-3 sm:px-4 lg:hidden">{navigation.map(item => { const children = item.children.filter(child => child.visible); return <div key={item.id}>{children.length ? <><button onClick={() => { touchMenu(); setExpandedItem(current => current === item.id ? null : item.id); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]" aria-expanded={expandedItem === item.id}><span>{item.label}</span><ChevronDown className={`h-4 w-4 transition ${expandedItem === item.id ? "rotate-180" : ""}`} /></button>{expandedItem === item.id && <div className="mr-3 border-r border-cyan-300/25 pr-2"><button onClick={() => navigate(item.path)} className="block w-full rounded-lg px-3 py-2.5 text-right text-xs font-bold text-cyan-200 hover:bg-cyan-300/[.07]">عرض {item.label}</button>{children.map(child => <button key={child.id} onClick={() => navigate(child.path)} className="block w-full rounded-lg px-3 py-2.5 text-right text-sm text-slate-300 hover:bg-white/[.06]">{child.label}</button>)}</div>}</> : <button onClick={() => navigate(item.path)} className="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">{item.label}</button>}</div>; })}{user ? <><button onClick={() => navigate("/account")} className="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">حسابي</button><button onClick={() => navigate("/orders")} className="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">طلباتي</button></> : <button onClick={() => navigate("/login")} className="mt-2 w-full rounded-xl bg-cyan-300 px-3 py-3 text-sm font-bold text-slate-950">تسجيل الدخول</button>}</nav>}</header><main className="min-w-0">{children}</main><Footer /></div>;
}

function Footer() {
  const [, setLocation] = useLocation();
  return <footer className="mt-14 border-t border-white/[.08] bg-[#050c16] sm:mt-20"><div className="container grid gap-8 py-10 sm:gap-10 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"><div className="md:col-span-2 lg:col-span-1"><GameMark /><p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">متجرك الموثوق للمنتجات والخدمات الرقمية الخاصة بالألعاب، بتجربة شراء واضحة وتسليم رقمي سريع.</p></div><div><h3 className="font-bold text-white">روابط سريعة</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><button onClick={() => setLocation("/about")} className="w-fit text-right hover:text-cyan-300">من نحن</button><button onClick={() => setLocation("/faq")} className="w-fit text-right hover:text-cyan-300">الأسئلة الشائعة</button><button onClick={() => setLocation("/contact")} className="w-fit text-right hover:text-cyan-300">تواصل معنا</button></div></div><div><h3 className="font-bold text-white">سياسات المتجر</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><button onClick={() => setLocation("/privacy")} className="w-fit text-right hover:text-cyan-300">الخصوصية</button><button onClick={() => setLocation("/terms")} className="w-fit text-right hover:text-cyan-300">الشروط والأحكام</button><button onClick={() => setLocation("/digital-delivery")} className="w-fit text-right hover:text-cyan-300">تسليم المنتجات الرقمية</button></div></div></div><div className="border-t border-white/[.07]"><div className="container grid gap-2 py-5 text-center text-xs text-slate-500 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><span className="sm:text-right">© Game Pay – جيم باي</span><div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 justify-self-center whitespace-nowrap text-slate-400"><span className="inline-flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5 text-[#8b5cf6]" aria-hidden="true" />Facebook</span><span className="inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />Telegram</span><span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />WhatsApp</span><span className="inline-flex items-center gap-1.5"><Music2 className="h-3.5 w-3.5 text-rose-300" aria-hidden="true" />TikTok</span></div><span className="hidden sm:block" aria-hidden="true" /></div></div></footer>;
}
