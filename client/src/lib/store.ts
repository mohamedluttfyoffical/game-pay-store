export type StoreProduct = {
  id: number;
  slug: string;
  name: string;
  gameSlug: string;
  type: "topup" | "digital" | "account";
  description: string;
  details: string;
  useInstructions: string;
  deliveryEta: string;
  price: string;
  compareAtPrice: string | null;
  discountPercent: number;
  stock: number;
  status: "active" | "draft" | "sold_out";
  imageUrl: string | null;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  featured: boolean;
  popular: boolean;
  accountProfile?: { level: string; highlights: string; accountStatus: "available" | "sold" } | null;
};

export const formatPrice = (value: string | number) => `\u2066${Number(value).toLocaleString("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})} EGP\u2069`;

export const typeLabel: Record<StoreProduct["type"], string> = {
  topup: "شحن ألعاب",
  digital: "منتج رقمي",
  account: "حساب ألعاب",
};

export const gameLabel: Record<string, string> = {
  efootball: "eFootball",
  pubg: "PUBG Mobile",
  "fc-mobile": "FC Mobile",
  "cod-mobile": "Call of Duty",
  "free-fire": "Free Fire",
  roblox: "Roblox",
};

export const paymentLabel: Record<string, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "تم الاسترداد",
};

export const fulfillmentLabel: Record<string, string> = {
  pending: "بانتظار المعالجة",
  processing: "قيد التنفيذ",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};
