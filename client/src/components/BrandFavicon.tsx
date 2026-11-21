import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export function BrandFavicon() {
  const homepage = trpc.homepage.get.useQuery();
  const faviconUrl = homepage.data?.brand.faviconUrl;

  useEffect(() => {
    const selector = 'link[rel="icon"]';
    let link = document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = faviconUrl || "/favicon.ico";
  }, [faviconUrl]);

  return null;
}
