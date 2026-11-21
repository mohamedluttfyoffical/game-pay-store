import type { StoreProduct } from "@/lib/store";
import { CircleDollarSign, KeyRound, Zap } from "lucide-react";

const palettes: Record<string, string> = {
  efootball: "from-sky-500/30 via-cyan-400/10 to-blue-950",
  pubg: "from-orange-500/30 via-amber-400/10 to-slate-950",
  "fc-mobile": "from-violet-500/30 via-fuchsia-400/10 to-slate-950",
  "cod-mobile": "from-emerald-500/30 via-cyan-400/10 to-slate-950",
  "free-fire": "from-rose-500/30 via-orange-400/10 to-slate-950",
  roblox: "from-amber-400/30 via-red-500/10 to-slate-950",
};

export function ProductVisual({ product, className = "" }: { product: Pick<StoreProduct, "type" | "gameSlug" | "name" | "imageUrl">; className?: string }) {
  const Icon = product.type === "account" ? KeyRound : product.type === "digital" ? CircleDollarSign : Zap;
  if (product.imageUrl) return <img src={product.imageUrl} alt={product.name} className={`object-cover ${className}`} />;
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${palettes[product.gameSlug] ?? "from-cyan-500/25 to-slate-950"} ${className}`}>
      <div className="absolute -left-9 -top-12 h-36 w-36 rounded-full bg-cyan-300/15 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full border border-cyan-200/15" />
      <div className="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-slate-950/35 text-cyan-200 backdrop-blur">
        <Icon className="h-6 w-6" />
      </div>
      <span className="absolute left-5 top-5 text-xs font-bold tracking-[.18em] text-white/70">GAME PAY</span>
    </div>
  );
}
