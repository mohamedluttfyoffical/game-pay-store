const fs = require('fs');

const config = JSON.parse(fs.readFileSync('C:/Users/RDP/.config/configstore/firebase-tools.json', 'utf8'));
const token = config.tokens?.access_token;
if (!token) throw new Error('No access token found');

const projectId = 'orders-abb76';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const k of Object.keys(val)) {
      fields[k] = toFirestoreValue(val[k]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDocument(obj) {
  const fields = {};
  for (const k of Object.keys(obj)) {
    fields[k] = toFirestoreValue(obj[k]);
  }
  return { fields };
}

async function setDocument(collection, docId, data) {
  const url = `${baseUrl}/${collection}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(toFirestoreDocument(data))
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to set ${collection}/${docId}: ${err}`);
  }
  console.log(`✓ Set ${collection}/${docId}`);
}

const INITIAL_GAMES = [
  { slug: "efootball", name: "eFootball", accent: "sky" },
  { slug: "pubg", name: "PUBG Mobile", accent: "orange" },
  { slug: "fc-mobile", name: "FC Mobile", accent: "violet" },
  { slug: "cod-mobile", name: "Call of Duty Mobile", accent: "emerald" },
  { slug: "free-fire", name: "Free Fire", accent: "rose" },
  { slug: "roblox", name: "Roblox", accent: "amber" }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    slug: "efootball-coin-550",
    name: "باقة 550 كوين eFootball",
    gameSlug: "efootball",
    type: "topup",
    price: 42,
    compareAtPrice: 50,
    discountPercent: 16,
    stock: 50,
    status: "active",
    featured: true,
    popular: true,
    deliveryEta: "خلال 5–20 دقيقة",
    description: "شحن سريع وآمن لباقة كوينز داخل لعبة eFootball Mobile.",
    details: "أدخل معرّف المستخدم الخاص بك عند إتمام الطلب. لا نطلب كلمة المرور.",
    useInstructions: "تأكد من صحة معرّف اللاعب قبل تأكيد الطلب.",
    imageUrl: null,
    images: []
  },
  {
    id: 2,
    slug: "pubg-uc-660",
    name: "شحن 660 UC لـ PUBG Mobile",
    gameSlug: "pubg",
    type: "topup",
    price: 68,
    compareAtPrice: 75,
    discountPercent: 9,
    stock: 30,
    status: "active",
    featured: true,
    popular: true,
    deliveryEta: "خلال 10–30 دقيقة",
    description: "رصيد UC رقمي للاستخدام داخل PUBG Mobile.",
    details: "الخدمة رقمية وتُنفذ باستخدام Player ID فقط.",
    useInstructions: "اكتب Player ID من داخل صفحة الملف الشخصي في اللعبة.",
    imageUrl: null,
    images: []
  },
  {
    id: 3,
    slug: "fc-points-500",
    name: "500 نقطة FC Mobile",
    gameSlug: "fc-mobile",
    type: "topup",
    price: 55,
    compareAtPrice: null,
    discountPercent: 0,
    stock: 25,
    status: "active",
    featured: false,
    popular: true,
    deliveryEta: "خلال 15–45 دقيقة",
    description: "باقة نقاط رقمية لتطوير تشكيلتك في FC Mobile.",
    details: "يتم تنفيذ الشحن بعد مراجعة رقم المستخدم.",
    useInstructions: "أدخل UID الصحيح من إعدادات اللعبة.",
    imageUrl: null,
    images: []
  },
  {
    id: 4,
    slug: "cod-cp-880",
    name: "880 CP لـ Call of Duty Mobile",
    gameSlug: "cod-mobile",
    type: "topup",
    price: 70,
    compareAtPrice: 82,
    discountPercent: 15,
    stock: 20,
    status: "active",
    featured: true,
    popular: false,
    deliveryEta: "خلال 10–30 دقيقة",
    description: "باقة CP رقمية لاستكمال تجربة Call of Duty Mobile.",
    details: "إتمام رقمي من دون أي شحن مادي.",
    useInstructions: "تحقق من المنطقة وبيانات الحساب قبل الإرسال.",
    imageUrl: null,
    images: []
  },
  {
    id: 5,
    slug: "roblox-800-robux",
    name: "بطاقة 800 Robux",
    gameSlug: "roblox",
    type: "digital",
    price: 85,
    compareAtPrice: null,
    discountPercent: 0,
    stock: 40,
    status: "active",
    featured: false,
    popular: true,
    deliveryEta: "فوري – خلال دقيقتين",
    description: "كود شحن بطاقة 800 روبوكس للاستخدام في منصة Roblox.",
    details: "كود رقمي صالح للاسترداد المباشر.",
    useInstructions: "ادخل على موقع roblox.com/redeem وسجل الكود.",
    imageUrl: null,
    images: []
  },
  {
    id: 6,
    slug: "efootball-legend-acc-120",
    name: "حساب eFootball أسطوري ليفل 120",
    gameSlug: "efootball",
    type: "account",
    price: 350,
    compareAtPrice: 420,
    discountPercent: 17,
    stock: 1,
    status: "active",
    featured: true,
    popular: true,
    deliveryEta: "خلال ساعة مع الضمان",
    description: "حساب eFootball جاهز بتشكيلة أسطورية ولاعبين Epic ومربوط بكونامي آمن.",
    details: "حساب جاهز مع بريد مستقل وتغيير البيانات متاح فورًا.",
    useInstructions: "سيتم تسليم بيانات الحساب وكلمة المرور في صفحة تفاصيل الطلب بعد الاعتماد.",
    imageUrl: null,
    images: [],
    accountProfile: {
      level: "120",
      highlights: "ميسي Epic، نيمار Showtime، رونالدينيو",
      accountStatus: "available"
    }
  }
];

const INITIAL_HOMEPAGE = {
  hero: {
    eyebrow: "منصة رقمية آمنة للاعبين",
    title: "كل عالم الألعاب",
    accent: "في مكان واحد.",
    description: "اشحن ألعابك، واحصل على منتجاتك الرقمية بسرعة وأمان. تجربة واضحة، تسليم رقمي، وحماية أعلى لبياناتك.",
    primaryLabel: "تصفح المتجر",
    primaryHref: "store",
    secondaryLabel: "شحن لعبة الآن",
    secondaryHref: "store?type=topup",
    trustItems: ["بياناتك محمية", "تسليم رقمي سريع", "دفع إلكتروني فوري وآمن"]
  }
};

async function main() {
  console.log('Seeding products...');
  for (const p of INITIAL_PRODUCTS) {
    await setDocument('products', String(p.id), p);
  }
  console.log('Seeding games...');
  for (const g of INITIAL_GAMES) {
    await setDocument('games', g.slug, g);
  }
  console.log('Seeding homepage config...');
  await setDocument('homepage_configs', 'main', INITIAL_HOMEPAGE);
  console.log('Seeding coupon...');
  await setDocument('coupons', 'WELCOME10', {
    code: 'WELCOME10',
    discountType: 'percent',
    value: 10,
    isActive: true
  });
  console.log('✔ All collections seeded successfully to Firestore!');
}

main().catch(console.error);
