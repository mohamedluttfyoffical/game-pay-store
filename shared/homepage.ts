export const HOME_SECTION_KEYS = ["games", "featured", "offers", "features", "steps", "trust", "faq", "cta"] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export type HomeContentItem = { title: string; description: string };
export type NavigationChild = { id: string; label: string; path: string; visible: boolean };
export type NavigationItem = NavigationChild & { children: NavigationChild[] };

export type HomeSection = {
  key: HomeSectionKey;
  visible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: HomeContentItem[];
};

export type HomepageConfig = {
  brand: {
    logoUrl: string | null;
    logoKey: string | null;
    faviconUrl: string | null;
    faviconKey: string | null;
  };
  navigation: NavigationItem[];
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    trustItems: [string, string, string];
  };
  sections: HomeSection[];
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  brand: { logoUrl: null, logoKey: null, faviconUrl: null, faviconKey: null },
  navigation: [
    { id: "home", label: "الرئيسية", path: "/", visible: true, children: [] },
    { id: "store", label: "المتجر", path: "/store", visible: true, children: [] },
    { id: "topups", label: "شحن الألعاب", path: "/store?type=topup", visible: true, children: [{ id: "topups-all", label: "كل الشحنات", path: "/store?type=topup", visible: true }, { id: "topups-offers", label: "عروض الشحن", path: "/store?type=topup&sort=discount", visible: true }] },
    { id: "accounts", label: "الحسابات", path: "/store?type=account", visible: true, children: [] },
    { id: "offers", label: "العروض", path: "/store?sort=discount", visible: true, children: [] },
  ],
  hero: {
    eyebrow: "منصة رقمية آمنة للاعبين",
    title: "كل عالم الألعاب",
    accent: "في مكان واحد.",
    description: "اشحن ألعابك، واحصل على منتجاتك الرقمية بسرعة وأمان. تجربة واضحة، تسليم رقمي، وحماية أعلى لبياناتك.",
    primaryLabel: "تصفح المتجر",
    primaryHref: "/store",
    secondaryLabel: "شحن لعبة الآن",
    secondaryHref: "/store?type=topup",
    trustItems: ["بياناتك محمية", "تسليم رقمي سريع", "دفع تجريبي قابل للتطوير"],
  },
  sections: [
    { key: "games", visible: true, eyebrow: "تصنيفات سريعة", title: "اختر لعبتك المفضلة", description: "", ctaLabel: "عرض الجميع", ctaHref: "/store", items: [] },
    { key: "featured", visible: true, eyebrow: "اختيارات اللاعبين", title: "منتجات رقمية مميزة", description: "", ctaLabel: "اكتشف المنتجات", ctaHref: "/store?sort=popular", items: [] },
    { key: "offers", visible: true, eyebrow: "عروض لفترة محدودة", title: "خصومات رقمية جاهزة للانطلاق", description: "استكشف باقات مختارة بعرض السعر والخصم ووقت التسليم بوضوح.", ctaLabel: "عرض العروض", ctaHref: "/store?sort=discount", items: [] },
    { key: "features", visible: true, eyebrow: "لماذا Game Pay؟", title: "تجربة رقمية واضحة وآمنة", description: "", ctaLabel: "", ctaHref: "/", items: [{ title: "حماية البيانات", description: "لا تظهر بيانات التسليم الحساسة قبل تأكيد الدفع." }, { title: "تجربة سريعة", description: "سلة وطلب رقمي بلا حاجة إلى عنوان شحن." }, { title: "اختيار واضح", description: "بحث وفلاتر تساعدك على الوصول للمنتج المناسب." }] },
    { key: "steps", visible: true, eyebrow: "بخطوات بسيطة", title: "كيف تشتري من Game Pay؟", description: "اختر منتجك وأكمل بيانات التنفيذ، ثم تابع حالة طلبك من حسابك.", ctaLabel: "ابدأ التسوق", ctaHref: "/store", items: [{ title: "اختر المنتج", description: "تصفّح الألعاب والباقات واختر ما يناسبك." }, { title: "أكمل الطلب", description: "أدخل بيانات الشحن أو التنفيذ المطلوبة بوضوح." }, { title: "تابع التسليم", description: "راقب حالة الدفع والتنفيذ من حسابك." }] },
    { key: "trust", visible: true, eyebrow: "وضوح في كل خطوة", title: "مصمم لتجربة شراء أفضل", description: "معلومات المنتج وحالة الدفع والتنفيذ تظهر لك في مكان واحد.", ctaLabel: "تصفح المتجر", ctaHref: "/store", items: [{ title: "بيانات محمية", description: "بيانات الحساب والطلب تُدار ضمن جلسة آمنة." }, { title: "حالة محدثة", description: "تعرف متى ينتقل الطلب من الانتظار إلى التنفيذ والتسليم." }, { title: "محفظة مرنة", description: "اشحن رصيدك ثم استخدمه للشراء عندما تتوفر وسيلة الشحن." }] },
    { key: "faq", visible: true, eyebrow: "تحتاج مساعدة؟", title: "أسئلة شائعة", description: "إجابات سريعة على أكثر النقاط التي يحتاجها اللاعب قبل إتمام الطلب.", ctaLabel: "تواصل معنا", ctaHref: "/contact", items: [{ title: "كيف أتابع طلبي؟", description: "من صفحة الحساب ستظهر حالة الدفع والتنفيذ وتفاصيل كل طلب." }, { title: "متى يتم التسليم؟", description: "تعرض كل صفحة منتج وقت التسليم المتوقع، وتتغير حالة الطلب عند بدء التنفيذ." }, { title: "هل يمكنني استخدام رصيد المحفظة؟", description: "نعم، بعد اعتماد طلب شحن المحفظة من فريق المتجر يصبح الرصيد متاحًا عند الدفع." }] },
    { key: "cta", visible: true, eyebrow: "جاهز للانطلاق؟", title: "ابنِ تجربتك داخل اللعبة الآن", description: "اختر لعبة، أضف المنتج إلى السلة، ثم تابع طلبك من حساب Game Pay.", ctaLabel: "استكشف المنتجات", ctaHref: "/store", items: [] },
  ],
};
