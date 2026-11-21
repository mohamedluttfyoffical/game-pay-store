import { Gamepad2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function GameMark({ compact = false }: { compact?: boolean }) {
  const homepage = trpc.homepage.get.useQuery();
  const logoUrl = homepage.data?.brand.logoUrl;
  return (
    <div className="flex items-center gap-2.5 select-none" aria-label="Game Pay">
      {logoUrl ? <img src={logoUrl} alt="شعار Game Pay" className="h-10 w-10 rounded-xl object-contain shadow-[0_0_28px_rgba(136,70,208,.42)]" /> : <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-white shadow-[0_0_28px_rgba(136,70,208,.42)]"><Gamepad2 className="h-5 w-5" strokeWidth={2.6} /></div>}
      {!compact && <div className="leading-none"><strong className="block text-lg tracking-tight text-white">Game Pay</strong><span className="mt-1 block text-[10px] font-bold tracking-[.28em] text-cyan-300">جيم باي</span></div>}
    </div>
  );
}
