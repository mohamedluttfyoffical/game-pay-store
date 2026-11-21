/* ========================================================
   GAME PAY - 1:1 REPLICA ENGINE FOR BLOGGER (FIREBASE READY)
   ======================================================== */

// --- Firebase Configuration ---
// Connected to Project: game-pay (orders-abb76)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDBxSLqst8-_unXXa6RNJ4ur8xm8s9a1ag",
  authDomain: "orders-abb76.firebaseapp.com",
  projectId: "orders-abb76",
  storageBucket: "orders-abb76.firebasestorage.app",
  messagingSenderId: "320717160019",
  appId: "1:320717160019:web:6cc1dd0f9b8eb4fc25d0a6"
};

let db = null;
let auth = null;
let storage = null;
let isFirebaseActive = false;

try {
  if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes('YOUR_API_KEY')) {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    isFirebaseActive = true;
    console.log('[Game Pay] Firebase initialized successfully.');
  } else {
    console.warn('[Game Pay] Running in Standalone LocalStorage Mode. Configure FIREBASE_CONFIG to sync across devices.');
  }
} catch (e) {
  console.error('[Game Pay] Firebase init error:', e);
}

// --- Seed Data (Exact match with localhost:3000) ---
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

const INITIAL_HOMEPAGE_CONFIG = {
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

// Clean legacy test wallet balance and fake test items from localStorage
let initialWallet = { balance: 0.00, transactions: [] };
try {
  const savedWallet = JSON.parse(localStorage.getItem('gp_wallet') || 'null');
  if (savedWallet && typeof savedWallet.balance === 'number' && savedWallet.balance !== 150 && Array.isArray(savedWallet.transactions)) {
    initialWallet = savedWallet;
  } else {
    localStorage.setItem('gp_wallet', JSON.stringify(initialWallet));
  }
} catch (e) {
  initialWallet = { balance: 0.00, transactions: [] };
}

let savedHomepage = null;
try {
  savedHomepage = JSON.parse(localStorage.getItem('gp_homepage') || 'null');
  if (savedHomepage && savedHomepage.hero && Array.isArray(savedHomepage.hero.trustItems)) {
    savedHomepage.hero.trustItems = ["بياناتك محمية", "تسليم رقمي سريع", "دفع إلكتروني فوري وآمن"];
    localStorage.setItem('gp_homepage', JSON.stringify(savedHomepage));
  }
} catch(e) {}

// Clean any legacy default/corrupted cart items so cart starts completely empty
let initialCart = [];
try {
  const cleanedKey = 'gp_cart_cleaned_v3';
  if (!localStorage.getItem(cleanedKey)) {
    localStorage.removeItem('gp_cart');
    localStorage.setItem(cleanedKey, 'true');
    initialCart = [];
  } else {
    const savedCart = JSON.parse(localStorage.getItem('gp_cart') || '[]');
    initialCart = Array.isArray(savedCart) ? savedCart : [];
  }
} catch (e) {
  initialCart = [];
}

// --- App State Store ---
const Store = {
  products: JSON.parse(localStorage.getItem('gp_products') || 'null') || INITIAL_PRODUCTS,
  games: INITIAL_GAMES,
  homepage: savedHomepage || INITIAL_HOMEPAGE_CONFIG,
  cart: initialCart,
  user: JSON.parse(localStorage.getItem('gp_user') || 'null'),
  orders: JSON.parse(localStorage.getItem('gp_orders') || '[]'),
  wallet: initialWallet,
  topupRequests: JSON.parse(localStorage.getItem('gp_topups') || '[]'),
  coupons: JSON.parse(localStorage.getItem('gp_coupons') || '[{"code":"WELCOME10","discountType":"percent","value":10,"isActive":true}]'),
  notifications: JSON.parse(localStorage.getItem('gp_notifications') || '[]'),
  
  saveProducts() {
    localStorage.setItem('gp_products', JSON.stringify(this.products));
  },
  saveCart() {
    localStorage.setItem('gp_cart', JSON.stringify(this.cart));
    updateHeaderBadges();
  },
  saveUser() {
    localStorage.setItem('gp_user', JSON.stringify(this.user));
    updateHeaderUser();
  },
  saveOrders() {
    localStorage.setItem('gp_orders', JSON.stringify(this.orders));
  },
  saveWallet() {
    localStorage.setItem('gp_wallet', JSON.stringify(this.wallet));
  },
  saveTopups() {
    localStorage.setItem('gp_topups', JSON.stringify(this.topupRequests));
  },
  saveCoupons() {
    localStorage.setItem('gp_coupons', JSON.stringify(this.coupons));
  },
  saveHomepage() {
    localStorage.setItem('gp_homepage', JSON.stringify(this.homepage));
  }
};

// --- Formatters & Helpers ---
function formatPrice(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' EGP';
}

const typeLabels = {
  topup: 'شحن ألعاب',
  digital: 'منتج رقمي',
  account: 'حساب ألعاب'
};

const gameLabels = {
  efootball: 'eFootball',
  pubg: 'PUBG Mobile',
  'fc-mobile': 'FC Mobile',
  'cod-mobile': 'Call of Duty',
  'free-fire': 'Free Fire',
  roblox: 'Roblox'
};

const paymentLabels = {
  pending: 'بانتظار الدفع',
  paid: 'مدفوع',
  failed: 'فشل الدفع',
  refunded: 'تم الاسترداد'
};

const fulfillmentLabels = {
  pending: 'بانتظار المعالجة',
  processing: 'قيد التنفيذ',
  delivered: 'تم التسليم',
  cancelled: 'ملغي'
};

const gamePalettes = {
  efootball: "from-sky-500/30 via-cyan-400/10 to-blue-950",
  pubg: "from-orange-500/30 via-amber-400/10 to-slate-950",
  "fc-mobile": "from-violet-500/30 via-fuchsia-400/10 to-slate-950",
  "cod-mobile": "from-emerald-500/30 via-cyan-400/10 to-slate-950",
  "free-fire": "from-rose-500/30 via-orange-400/10 to-slate-950",
  roblox: "from-amber-400/30 via-red-500/10 to-slate-950"
};

// --- Toast Notifications ---
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const item = document.createElement('div');
  item.className = 'toast-item';
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
  item.innerHTML = `<i data-lucide="${icon}" class="h-4 w-4 text-cyan-300"></i><span>${msg}</span>`;
  container.appendChild(item);
  if (window.lucide) window.lucide.createIcons({ root: item });
  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    item.style.transition = 'all 0.3s ease';
    setTimeout(() => item.remove(), 300);
  }, 3200);
}

// --- Cart Operations ---
function addToCart(productId, qty = 1) {
  const pIdStr = String(productId);
  const product = Store.products.find(p => String(p.id) === pIdStr || (p.slug && String(p.slug) === pIdStr));
  if (!product) return;
  const existing = Store.cart.find(c => {
    const cId = String(c.productId ?? c.product?.id ?? c.id ?? '');
    return cId === String(product.id) || (product.slug && cId === String(product.slug));
  });
  if (existing) {
    existing.quantity = (existing.quantity || 1) + qty;
  } else {
    Store.cart.push({
      productId: product.id,
      quantity: qty,
      product: { ...product }
    });
  }
  Store.saveCart();
  showToast('أُضيف المنتج إلى سلتك', 'success');
}

function updateCartQty(identifier, qty) {
  if (qty <= 0) {
    removeFromCart(identifier);
    return;
  }
  const targetId = String(identifier);
  const item = Store.cart.find((c, idx) => {
    const cId = String(c.productId ?? c.product?.id ?? c.id ?? '');
    return cId === targetId || String(idx) === targetId;
  });
  if (item) {
    item.quantity = qty;
    Store.saveCart();
    renderCurrentRoute();
  }
}

function removeFromCart(identifier) {
  const targetId = String(identifier);
  Store.cart = Store.cart.filter((c, idx) => {
    const cId = String(c.productId ?? c.product?.id ?? c.id ?? '');
    const cSlug = String(c.product?.slug ?? '');
    if (cId === targetId || cSlug === targetId || String(idx) === targetId) {
      return false;
    }
    return true;
  });
  Store.saveCart();
  renderCurrentRoute();
  showToast('تمت إزالة المنتج من السلة');
}

function clearCart() {
  Store.cart = [];
  Store.saveCart();
  renderCurrentRoute();
  showToast('تم إفراغ السلة بالكامل');
}

function getCartCount() {
  return Store.cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

function getCartSubtotal() {
  return Store.cart.reduce((sum, item) => {
    const price = Number(item.product?.price ?? item.price ?? 0);
    return sum + (price * (Number(item.quantity) || 1));
  }, 0);
}

// --- Dynamic Visual Component Generator ---
function renderProductVisual(product, className = '') {
  if (product.imageUrl) {
    return `<img src="${product.imageUrl}" alt="${product.name}" class="object-cover ${className}" />`;
  }
  const palette = gamePalettes[product.gameSlug] || 'from-cyan-500/25 to-slate-950';
  const icon = product.type === 'account' ? 'key-round' : product.type === 'digital' ? 'circle-dollar-sign' : 'zap';
  return `
    <div class="relative isolate overflow-hidden bg-gradient-to-br ${palette} ${className}">
      <div class="absolute -left-9 -top-12 h-36 w-36 rounded-full bg-cyan-300/15 blur-2xl"></div>
      <div class="absolute bottom-0 right-0 h-24 w-24 rounded-full border border-cyan-200/15"></div>
      <div class="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-slate-950/35 text-cyan-200 backdrop-blur">
        <i data-lucide="${icon}" class="h-6 w-6"></i>
      </div>
      <span class="absolute left-5 top-5 text-xs font-bold tracking-[.18em] text-white/70">GAME PAY</span>
    </div>
  `;
}

function renderProductCard(product) {
  const discountBadge = product.discountPercent > 0
    ? `<span class="absolute right-3 top-3 rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-black text-slate-950">خصم ${product.discountPercent}%</span>`
    : '';
  const comparePrice = product.compareAtPrice
    ? `<span class="mr-2 text-xs text-slate-500 line-through">${formatPrice(product.compareAtPrice)}</span>`
    : '';
  const accountInfo = product.accountProfile
    ? `<p class="mt-2 line-clamp-1 text-[11px] text-slate-500">المستوى ${product.accountProfile.level} · ${product.accountProfile.highlights}</p>`
    : '';

  return `
    <article class="product-card group">
      <button onclick="navigate('product/${product.slug}')" class="block w-full text-right cursor-pointer">
        <div class="relative">
          ${renderProductVisual(product, 'h-36 w-full transition duration-300 group-hover:scale-[1.03] sm:h-40')}
          ${discountBadge}
          <span class="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] font-bold text-slate-200 backdrop-blur">${typeLabels[product.type] || product.type}</span>
        </div>
        <div class="p-3 sm:p-4">
          <p class="text-xs text-cyan-300">${gameLabels[product.gameSlug] || product.gameSlug}</p>
          <h3 class="mt-1 text-sm font-bold leading-6 text-white sm:min-h-12">${product.name}</h3>
          <p class="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">${product.description || ''}</p>
          ${accountInfo}
          <div class="mt-4 flex items-end justify-between gap-3">
            <div>
              <strong class="text-base text-white">${formatPrice(product.price)}</strong>
              ${comparePrice}
            </div>
            <span class="shrink-0 text-[11px] text-slate-500">${product.deliveryEta || 'تسليم رقمي'}</span>
          </div>
        </div>
      </button>
      <div class="grid gap-2 border-t border-white/[.07] p-3 sm:grid-cols-2">
        <button onclick="navigate('product/${product.slug}')" class="btn-secondary text-xs">
          <i data-lucide="zap" class="h-3.5 w-3.5"></i>شراء الآن
        </button>
        <button onclick="addToCart(${product.id})" class="btn-primary text-xs">
          <i data-lucide="shopping-cart" class="h-3.5 w-3.5"></i>أضف للسلة
        </button>
      </div>
    </article>
  `;
}

// --- Navigation Engine ---
function parseRoute() {
  const rawHash = window.location.hash || '';
  const hash = rawHash.replace(/^#\/?/, '') || 'home';
  const parts = hash.split('?');
  const path = parts[0];
  const query = {};
  if (parts[1]) {
    parts[1].split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }
  return { path, query, full: hash };
}

function navigate(target) {
  window.location.hash = target.startsWith('#') ? target : '#' + target;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', renderCurrentRoute);

// --- Header Updating ---
function updateHeaderBadges() {
  const badge = document.getElementById('cartCountBadge');
  const count = getCartCount();
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function updateHeaderUser() {
  const area = document.getElementById('userHeaderArea');
  const mobileArea = document.getElementById('mobileUserArea');
  if (!area) return;

  if (Store.user) {
    area.innerHTML = `
      <div class="group relative">
        <button class="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/[.05]">
          ${Store.user.name || 'حسابي'} <i data-lucide="chevron-down" class="h-3.5 w-3.5"></i>
        </button>
        <div class="invisible absolute left-0 top-11 w-44 rounded-xl border border-white/10 bg-[#101d2f] p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 z-50">
          <button onclick="navigate('account')" class="menu-action">حسابي</button>
          <button onclick="navigate('orders')" class="menu-action">طلباتي</button>
          <button onclick="logoutUser()" class="menu-action text-rose-300">تسجيل الخروج</button>
        </div>
      </div>
    `;
    if (mobileArea) {
      mobileArea.innerHTML = `
        <button onclick="navigate('account'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">حسابي</button>
        <button onclick="navigate('orders'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">طلباتي</button>
        <button onclick="logoutUser(); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-rose-300 hover:bg-white/[.06]">تسجيل الخروج</button>
      `;
    }
  } else {
    area.innerHTML = `
      <button onclick="navigate('login')" class="btn-primary px-4 py-2 text-sm">تسجيل الدخول</button>
    `;
    if (mobileArea) {
      mobileArea.innerHTML = `
        <button onclick="navigate('login'); toggleMobileMenu(false);" class="mt-2 w-full rounded-xl bg-cyan-300 px-3 py-3 text-sm font-bold text-slate-950">تسجيل الدخول</button>
      `;
    }
  }
  if (window.lucide) window.lucide.createIcons({ root: area });
}

function logoutUser() {
  detachUserListeners();
  Store.user = null;
  Store.saveUser();
  Store.wallet = { balance: 0.00, transactions: [] };
  Store.saveWallet();
  Store.orders = [];
  Store.saveOrders();
  Store.topupRequests = [];
  Store.saveTopups();
  if (isFirebaseActive && auth) {
    auth.signOut().catch(console.error);
  }
  showToast('تم تسجيل الخروج بنجاح');
  navigate('home');
}

function toggleMobileMenu(force) {
  const menu = document.getElementById('mobileMenu');
  const icon = document.getElementById('mobileMenuIcon');
  if (!menu) return;
  const isCurrentlyOpen = !menu.classList.contains('hidden');
  const shouldOpen = force !== undefined ? force : !isCurrentlyOpen;
  if (shouldOpen) {
    menu.classList.remove('hidden');
    if (icon) icon.setAttribute('data-lucide', 'x');
  } else {
    menu.classList.add('hidden');
    if (icon) icon.setAttribute('data-lucide', 'menu');
  }
  if (window.lucide) window.lucide.createIcons();
}

// --- Views / Pages ---

// 1. HOME VIEW
function viewHome() {
  const cfg = Store.homepage;
  const featured = Store.products.filter(p => p.featured).slice(0, 4);
  const offers = Store.products.filter(p => p.discountPercent > 0).slice(0, 3);

  return `
    <!-- HERO SECTION -->
    <section class="hero-grid relative overflow-hidden">
      <div class="container relative grid min-h-[530px] items-center gap-10 py-12 sm:min-h-[590px] sm:gap-12 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
        <div class="relative z-10">
          <div class="eyebrow">
            <span class="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]"></span>
            ${cfg.hero.eyebrow}
          </div>
          <h1 class="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-tight text-white sm:mt-7 sm:text-5xl lg:text-6xl">
            ${cfg.hero.title}<br />
            <span class="text-gradient">${cfg.hero.accent}</span>
          </h1>
          <p class="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:mt-6 sm:text-lg">
            ${cfg.hero.description}
          </p>
          <div class="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <button onclick="navigate('${cfg.hero.primaryHref}')" class="btn-primary px-5 py-3.5">
              ${cfg.hero.primaryLabel} <i data-lucide="arrow-left" class="h-4 w-4"></i>
            </button>
            <a href="#store" onclick="navigate('store'); return false;" class="btn-secondary justify-center px-5 py-3.5 sm:justify-start" aria-label="تنزيل تطبيق Game Pay لأندرويد بصيغة APK">
              <i data-lucide="download" class="h-4 w-4"></i>تنزيل تطبيق Android <span class="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">APK أندرويد</span>
            </a>
            <button onclick="navigate('${cfg.hero.secondaryHref}')" class="btn-secondary px-5 py-3.5">
              <i data-lucide="bolt" class="h-4 w-4"></i>${cfg.hero.secondaryLabel}
            </button>
          </div>
          <div class="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-400 sm:mt-10 sm:gap-x-7">
            <span class="flex items-center gap-2"><i data-lucide="lock-keyhole" class="h-4 w-4 text-cyan-300"></i>${cfg.hero.trustItems[0]}</span>
            <span class="flex items-center gap-2"><i data-lucide="clock-3" class="h-4 w-4 text-cyan-300"></i>${cfg.hero.trustItems[1]}</span>
            <span class="flex items-center gap-2"><i data-lucide="badge-check" class="h-4 w-4 text-cyan-300"></i>${cfg.hero.trustItems[2]}</span>
          </div>
        </div>

        <!-- HERO RIGHT VISUAL (Tilted Card) -->
        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <div class="hero-orb absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-72 sm:w-72"></div>
          <div class="relative rotate-[-4deg] rounded-[24px] border border-cyan-200/15 bg-[#0d1b2d]/80 p-3 shadow-[0_30px_80px_rgba(0,0,0,.42)] backdrop-blur sm:rounded-[30px] sm:p-4">
            <div class="rounded-[18px] border border-white/10 bg-[#081221] p-3 sm:rounded-[22px] sm:p-4">
              <div class="flex items-center justify-between">
                <span class="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">الأكثر طلبًا</span>
                <i data-lucide="gamepad-2" class="h-5 w-5 text-cyan-300"></i>
              </div>
              <div class="mt-4 h-40 overflow-hidden rounded-2xl sm:mt-5 sm:h-48 relative isolate overflow-hidden bg-gradient-to-br from-sky-500/30 via-cyan-400/10 to-blue-950">
                <div class="absolute -left-9 -top-12 h-36 w-36 rounded-full bg-cyan-300/15 blur-2xl"></div>
                <div class="absolute bottom-0 right-0 h-24 w-24 rounded-full border border-cyan-200/15"></div>
                <div class="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-slate-950/35 text-cyan-200 backdrop-blur">
                  <i data-lucide="zap" class="h-6 w-6"></i>
                </div>
                <span class="absolute left-5 top-5 text-xs font-bold tracking-[.18em] text-white/70">GAME PAY</span>
              </div>
              <div class="mt-4 flex items-end justify-between">
                <div>
                  <p class="text-xs text-slate-400">شحن آمن وسريع</p>
                  <strong class="mt-1 block text-base text-white sm:text-lg">اختر لعبتك وابدأ</strong>
                </div>
                <button onclick="navigate('store')" class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-slate-950">
                  <i data-lucide="chevron-left" class="h-5 w-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 1: GAMES TILES -->
    <section class="container py-12 sm:py-16">
      <div class="section-title">
        <div>
          <span>تصنيفات سريعة</span>
          <h2>اختر لعبتك المفضلة</h2>
        </div>
        <button onclick="navigate('store')" class="text-link">عرض الجميع <i data-lucide="arrow-left" class="h-4 w-4"></i></button>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-3 sm:mt-8 md:grid-cols-3 lg:grid-cols-6">
        ${Store.games.map(game => `
          <button onclick="navigate('store?game=${game.slug}')" class="game-tile">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <i data-lucide="gamepad-2" class="h-5 w-5"></i>
            </span>
            <strong class="mt-4 text-sm text-white">${game.name}</strong>
            <span class="mt-1 text-[11px] text-slate-500">شحن ومنتجات</span>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 2: FEATURED PRODUCTS -->
    <section class="container py-8">
      <div class="section-title">
        <div>
          <span>اختيارات اللاعبين</span>
          <h2>منتجات رقمية مميزة</h2>
        </div>
        <button onclick="navigate('store?sort=popular')" class="text-link">اكتشف المنتجات <i data-lucide="arrow-left" class="h-4 w-4"></i></button>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ${featured.map(product => renderProductCard(product)).join('')}
      </div>
    </section>

    <!-- SECTION 3: LIMITED OFFERS BANNER -->
    <section class="container py-12 sm:py-16">
      <div class="relative overflow-hidden rounded-[24px] border border-cyan-300/15 bg-gradient-to-l from-cyan-400/15 via-blue-500/10 to-[#0d1b2d] px-5 py-7 sm:rounded-[28px] sm:px-6 sm:py-8 md:px-10 md:py-10">
        <div class="absolute left-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_left,rgba(34,211,238,.16),transparent_70%)]"></div>
        <div class="relative grid items-center gap-5 sm:gap-7 md:grid-cols-[1fr_auto]">
          <div>
            <span class="eyebrow">عروض لفترة محدودة</span>
            <h2 class="mt-4 text-2xl font-black text-white md:text-3xl">خصومات رقمية جاهزة للانطلاق</h2>
            <p class="mt-3 max-w-xl text-sm leading-7 text-slate-300">استكشف باقات مختارة بعرض السعر والخصم ووقت التسليم بوضوح.</p>
          </div>
          <button onclick="navigate('store?sort=discount')" class="btn-primary w-full px-5 py-3 sm:w-auto">عرض العروض <i data-lucide="arrow-left" class="h-4 w-4"></i></button>
        </div>
        <div class="relative mt-6 grid gap-3 sm:mt-7 md:grid-cols-3">
          ${offers.map(product => `
            <button onclick="navigate('product/${product.slug}')" class="rounded-2xl border border-white/10 bg-[#07111f]/70 p-4 text-right transition hover:-translate-y-1 hover:border-cyan-300/30">
              <span class="text-xs text-cyan-300">خصم ${product.discountPercent}% · ${gameLabels[product.gameSlug] || product.gameSlug}</span>
              <strong class="mt-2 block text-sm text-white">${product.name}</strong>
            </button>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- SECTION 4: FEATURES -->
    <section class="container py-10">
      <div class="mb-7 text-center">
        <span class="eyebrow">لماذا Game Pay؟</span>
        <h2 class="mt-3 text-2xl font-black text-white">تجربة رقمية واضحة وآمنة</h2>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="feature-card">
          <i data-lucide="lock-keyhole" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>حماية البيانات</h3>
            <p>لا تظهر بيانات التسليم الحساسة قبل تأكيد الدفع والتحقق من حسابك.</p>
          </div>
        </div>
        <div class="feature-card">
          <i data-lucide="bolt" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>تجربة سريعة</h3>
            <p>سلة وطلب رقمي بلا حاجة إلى عنوان شحن، وتسليم فوري ومباشر.</p>
          </div>
        </div>
        <div class="feature-card">
          <i data-lucide="search" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>اختيار واضح</h3>
            <p>بحث وفلاتر متقدمة تساعدك على الوصول للمنتج المناسب لأي لعبة.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: STEPS -->
    <section class="container py-12">
      <div class="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
        <div>
          <span class="eyebrow">بخطوات بسيطة</span>
          <h2 class="mt-4 text-3xl font-black text-white">كيف تشتري من Game Pay؟</h2>
          <p class="mt-4 text-sm leading-7 text-slate-400">اختر منتجك وأكمل بيانات التنفيذ، ثم تابع حالة طلبك من حسابك بكل سهولة.</p>
          <button onclick="navigate('store')" class="btn-primary mt-6">ابدأ التسوق <i data-lucide="arrow-left" class="h-4 w-4"></i></button>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300 text-sm font-black text-slate-950">1</span>
            <h3 class="mt-5 font-bold text-white">اختر المنتج</h3>
            <p class="mt-2 text-xs leading-6 text-slate-400">تصفّح الألعاب والباقات واختر ما يناسبك بوضوح.</p>
          </article>
          <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300 text-sm font-black text-slate-950">2</span>
            <h3 class="mt-5 font-bold text-white">أكمل الطلب</h3>
            <p class="mt-2 text-xs leading-6 text-slate-400">أدخل معرّف اللاعب (Player ID) المطلوب للتنفيذ بأمان.</p>
          </article>
          <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300 text-sm font-black text-slate-950">3</span>
            <h3 class="mt-5 font-bold text-white">تابع التسليم</h3>
            <p class="mt-2 text-xs leading-6 text-slate-400">راقب حالة الدفع والتنفيذ وتفاصيل الكود من صفحة طلباتك.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- SECTION 6: TRUST -->
    <section class="container py-10">
      <div class="mb-7 text-center">
        <span class="eyebrow">وضوح في كل خطوة</span>
        <h2 class="mt-3 text-2xl font-black text-white">مصمم لتجربة شراء أفضل</h2>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">معلومات المنتج وحالة الدفع والتنفيذ تظهر لك في مكان واحد وبأقصى شفافية.</p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="feature-card">
          <i data-lucide="shield-check" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>بيانات محمية</h3>
            <p>بيانات الحساب والطلب تُدار ضمن جلسة آمنة وقاعدة بيانات مشفرة.</p>
          </div>
        </div>
        <div class="feature-card">
          <i data-lucide="circle-check-big" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>حالة محدثة</h3>
            <p>تعرف متى ينتقل الطلب من الانتظار إلى التنفيذ والتسليم فورًا.</p>
          </div>
        </div>
        <div class="feature-card">
          <i data-lucide="sparkles" class="h-5 w-5 text-cyan-300"></i>
          <div>
            <h3>محفظة مرنة</h3>
            <p>اشحن رصيد محفظتك ثم استخدمه للشراء المباشر بأي وقت بضغطة زر.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 7: FAQ -->
    <section class="container py-12">
      <div class="mx-auto max-w-3xl">
        <div class="text-center">
          <span class="eyebrow">تحتاج مساعدة؟</span>
          <h2 class="mt-3 text-3xl font-black text-white">أسئلة شائعة</h2>
          <p class="mt-3 text-sm leading-7 text-slate-400">إجابات سريعة على أكثر النقاط التي يحتاجها اللاعب قبل إتمام الطلب.</p>
        </div>
        <div class="mt-7 space-y-3">
          <details class="group rounded-2xl border border-white/[.08] bg-[#0d1929] px-5 py-4">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
              <span>كيف أتابع طلبي؟</span>
              <i data-lucide="message-circle-question" class="h-5 w-5 shrink-0 text-cyan-300"></i>
            </summary>
            <p class="mt-4 border-t border-white/[.07] pt-4 text-sm leading-7 text-slate-400">
              من صفحة «حسابي» أو «طلباتي» ستظهر حالة الدفع والتنفيذ وشريط التتبع المباشر لكل طلب.
            </p>
          </details>
          <details class="group rounded-2xl border border-white/[.08] bg-[#0d1929] px-5 py-4">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
              <span>متى يتم التسليم؟</span>
              <i data-lucide="message-circle-question" class="h-5 w-5 shrink-0 text-cyan-300"></i>
            </summary>
            <p class="mt-4 border-t border-white/[.07] pt-4 text-sm leading-7 text-slate-400">
              تعرض كل صفحة منتج وقت التسليم المتوقع، وتتغير حالة الطلب تلقائيًا عند بدء التنفيذ والتسليم.
            </p>
          </details>
          <details class="group rounded-2xl border border-white/[.08] bg-[#0d1929] px-5 py-4">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
              <span>هل يمكنني استخدام رصيد المحفظة؟</span>
              <i data-lucide="message-circle-question" class="h-5 w-5 shrink-0 text-cyan-300"></i>
            </summary>
            <p class="mt-4 border-t border-white/[.07] pt-4 text-sm leading-7 text-slate-400">
              نعم، بعد شحن رصيد المحفظة يصبح الرصيد متاحًا مباشرة كوسيلة دفع أساسية وسريعة في صفحة إتمام الطلب.
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- SECTION 8: CTA -->
    <section class="container py-12">
      <div class="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.2),transparent_36%),linear-gradient(135deg,#0d1b2d,#091321)] px-6 py-10 text-center md:px-12">
        <i data-lucide="list-checks" class="mx-auto h-8 w-8 text-cyan-300"></i>
        <span class="eyebrow mt-4 inline-flex">جاهز للانطلاق؟</span>
        <h2 class="mx-auto mt-4 max-w-2xl text-3xl font-black text-white">ابنِ تجربتك داخل اللعبة الآن</h2>
        <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">اختر لعبتك، أضف باقتك إلى السلة، ثم تابع طلبك من حساب Game Pay الموثوق.</p>
        <button onclick="navigate('store')" class="btn-primary mt-7">استكشف المنتجات <i data-lucide="arrow-left" class="h-4 w-4"></i></button>
      </div>
    </section>
  `;
}

// 2. CATALOG / STORE VIEW
let catalogFilterState = {
  query: '',
  game: '',
  type: '',
  sort: 'newest',
  max: '',
  discountOnly: false,
  filtersOpen: false
};

function viewCatalog(query = {}) {
  if (query.game) catalogFilterState.game = query.game;
  if (query.type) catalogFilterState.type = query.type;
  if (query.sort) catalogFilterState.sort = query.sort;

  let filtered = [...Store.products];

  if (catalogFilterState.query) {
    const q = catalogFilterState.query.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }
  if (catalogFilterState.game) {
    filtered = filtered.filter(p => p.gameSlug === catalogFilterState.game);
  }
  if (catalogFilterState.type) {
    filtered = filtered.filter(p => p.type === catalogFilterState.type);
  }
  if (catalogFilterState.max) {
    const m = Number(catalogFilterState.max);
    if (!isNaN(m) && m > 0) {
      filtered = filtered.filter(p => Number(p.price) <= m);
    }
  }
  if (catalogFilterState.discountOnly) {
    filtered = filtered.filter(p => p.discountPercent > 0);
  }

  // Sort
  if (catalogFilterState.sort === 'popular') {
    filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  } else if (catalogFilterState.sort === 'discount') {
    filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  } else if (catalogFilterState.sort === 'price_asc') {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (catalogFilterState.sort === 'price_desc') {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    filtered.sort((a, b) => b.id - a.id);
  }

  return `
    <section class="page-hero">
      <div class="container py-9 sm:py-12">
        <span class="eyebrow">المتجر الرقمي</span>
        <h1 class="mt-4 text-3xl font-black text-white md:text-4xl">اكتشف ما يناسب لعبتك</h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-400">ابحث بين الشحن والمنتجات الرقمية وحسابات الألعاب، ثم قارن السعر والخصم ووقت التسليم.</p>
      </div>
    </section>

    <section class="container py-6 sm:py-10">
      <button type="button" onclick="catalogFilterState.filtersOpen = !catalogFilterState.filtersOpen; renderCurrentRoute();" class="btn-secondary mb-4 w-full lg:hidden">
        <i data-lucide="sliders-horizontal" class="h-4 w-4"></i>${catalogFilterState.filtersOpen ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
      </button>

      <div class="grid gap-5 sm:gap-7 lg:grid-cols-[270px_1fr]">
        <!-- SIDEBAR FILTERS -->
        <aside class="h-fit rounded-2xl border border-white/[.08] bg-[#0d1929] p-4 lg:sticky lg:top-24 lg:block ${catalogFilterState.filtersOpen ? 'block' : 'hidden'}">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-sm font-bold text-white">
              <i data-lucide="sliders-horizontal" class="h-4 w-4 text-cyan-300"></i>الفلاتر
            </h2>
            <button onclick="resetCatalogFilters()" class="text-xs text-cyan-300">إعادة الضبط</button>
          </div>
          <div class="grid gap-4">
            <label class="field-label">اللعبة
              <select onchange="catalogFilterState.game = this.value; renderCurrentRoute();" class="field-select">
                <option value="">كل الألعاب</option>
                ${Store.games.map(g => `<option value="${g.slug}" ${catalogFilterState.game === g.slug ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
            </label>
            <label class="field-label">نوع المنتج
              <select onchange="catalogFilterState.type = this.value; renderCurrentRoute();" class="field-select">
                <option value="">كل الأنواع</option>
                <option value="topup" ${catalogFilterState.type === 'topup' ? 'selected' : ''}>شحن ألعاب</option>
                <option value="digital" ${catalogFilterState.type === 'digital' ? 'selected' : ''}>منتجات رقمية</option>
                <option value="account" ${catalogFilterState.type === 'account' ? 'selected' : ''}>حسابات الألعاب</option>
              </select>
            </label>
            <label class="field-label">السعر حتى
              <input inputmode="decimal" value="${catalogFilterState.max}" oninput="catalogFilterState.max = this.value; renderCurrentRoute();" placeholder="مثال: 100" class="field-input" />
            </label>
            <label class="flex items-center gap-2 text-xs font-bold text-slate-300">
              <input type="checkbox" ${catalogFilterState.discountOnly ? 'checked' : ''} onchange="catalogFilterState.discountOnly = this.checked; renderCurrentRoute();" />
              العروض والخصومات فقط
            </label>
          </div>
        </aside>

        <!-- PRODUCT LISTINGS -->
        <div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <label class="relative flex-1">
              <i data-lucide="search" class="absolute right-3 top-3 h-4 w-4 text-slate-500"></i>
              <input value="${catalogFilterState.query}" oninput="catalogFilterState.query = this.value; renderCurrentRoute();" placeholder="ابحث باسم المنتج أو الخدمة..." class="field-input pr-10" />
            </label>
            <label class="sm:w-48">
              <select onchange="catalogFilterState.sort = this.value; renderCurrentRoute();" class="field-select h-full">
                <option value="newest" ${catalogFilterState.sort === 'newest' ? 'selected' : ''}>الأحدث</option>
                <option value="popular" ${catalogFilterState.sort === 'popular' ? 'selected' : ''}>الأكثر مبيعًا</option>
                <option value="discount" ${catalogFilterState.sort === 'discount' ? 'selected' : ''}>الأعلى خصمًا</option>
                <option value="price_asc" ${catalogFilterState.sort === 'price_asc' ? 'selected' : ''}>السعر: الأقل أولًا</option>
                <option value="price_desc" ${catalogFilterState.sort === 'price_desc' ? 'selected' : ''}>السعر: الأعلى أولًا</option>
              </select>
            </label>
          </div>

          <div class="mt-5 flex items-center justify-between sm:mt-6">
            <p class="text-sm text-slate-400">${filtered.length} منتج متاح</p>
            <span class="flex items-center gap-1 text-xs text-slate-500"><i data-lucide="filter" class="h-3.5 w-3.5"></i>تحديث فوري</span>
          </div>

          ${filtered.length > 0 ? `
            <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              ${filtered.map(p => renderProductCard(p)).join('')}
            </div>
          ` : `
            <div class="empty-state mt-5">
              <i data-lucide="x" class="h-8 w-8 text-slate-500"></i>
              <h3>لا توجد نتائج مطابقة</h3>
              <p>جرّب تعديل البحث أو إزالة أحد الفلاتر.</p>
              <button onclick="resetCatalogFilters()" class="btn-secondary mt-4">إزالة الفلاتر</button>
            </div>
          `}
        </div>
      </div>
    </section>
  `;
}

function resetCatalogFilters() {
  catalogFilterState = { query: '', game: '', type: '', sort: 'newest', max: '', discountOnly: false, filtersOpen: false };
  renderCurrentRoute();
}

// 3. PRODUCT DETAILS VIEW
function viewProductDetails(slug) {
  const product = Store.products.find(p => p.slug === slug);
  if (!product) {
    return `
      <div class="container py-20">
        <div class="empty-state">
          <h1>هذا المنتج غير متاح</h1>
          <p>ربما تمت إزالته أو تغيّرت حالته.</p>
          <button onclick="navigate('store')" class="btn-primary mt-4">العودة للمتجر</button>
        </div>
      </div>
    `;
  }

  const comparePrice = product.compareAtPrice
    ? `<span class="mb-1 text-sm text-slate-500 line-through">${formatPrice(product.compareAtPrice)}</span>`
    : '';
  const discountBadge = product.discountPercent > 0
    ? `<span class="badge-cyan">خصم ${product.discountPercent}%</span>`
    : '';

  return `
    <section class="container py-6 sm:py-8">
      <button onclick="navigate('store')" class="mb-5 flex min-h-11 items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 sm:mb-7">
        <i data-lucide="arrow-right" class="h-4 w-4"></i>العودة إلى المتجر
      </button>

      <div class="grid gap-6 sm:gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <!-- Product Visual / Gallery -->
        <div class="space-y-3">
          ${renderProductVisual(product, 'min-h-[260px] rounded-[24px] border border-white/10 sm:min-h-[330px] sm:rounded-[28px] lg:min-h-[480px]')}
        </div>

        <!-- Product Purchase Information -->
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge-neutral">${typeLabels[product.type] || product.type}</span>
            <span class="badge-neutral">${gameLabels[product.gameSlug] || product.gameSlug}</span>
            ${discountBadge}
          </div>
          <h1 class="mt-4 text-3xl font-black leading-tight text-white sm:mt-5 md:text-4xl">${product.name}</h1>
          <p class="mt-4 text-base leading-8 text-slate-300">${product.description || ''}</p>
          <div class="mt-6 flex items-end gap-3">
            <strong class="text-3xl text-cyan-200">${formatPrice(product.price)}</strong>
            ${comparePrice}
          </div>

          <div class="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/[.08] bg-white/[.03] p-3">
              <i data-lucide="clock-3" class="h-4 w-4 text-cyan-300"></i>
              <span class="mt-3 block text-xs text-slate-500">وقت التسليم</span>
              <strong class="mt-1 block text-xs text-slate-200">${product.deliveryEta || 'تسليم رقمي'}</strong>
            </div>
            <div class="rounded-2xl border border-white/[.08] bg-white/[.03] p-3">
              <i data-lucide="lock-keyhole" class="h-4 w-4 text-cyan-300"></i>
              <span class="mt-3 block text-xs text-slate-500">الخصوصية</span>
              <strong class="mt-1 block text-xs text-slate-200">بياناتك محمية</strong>
            </div>
            <div class="rounded-2xl border border-white/[.08] bg-white/[.03] p-3">
              <i data-lucide="package-check" class="h-4 w-4 text-cyan-300"></i>
              <span class="mt-3 block text-xs text-slate-500">نوع التسليم</span>
              <strong class="mt-1 block text-xs text-slate-200">رقمي فقط</strong>
            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:mt-7 sm:flex sm:flex-wrap">
            <button onclick="addToCart(${product.id}); navigate('checkout');" class="btn-primary px-6 py-3.5">
              <i data-lucide="shopping-cart" class="h-4 w-4"></i>شراء الآن
            </button>
            <button onclick="addToCart(${product.id})" class="btn-secondary px-6 py-3.5">أضف للسلة</button>
          </div>
          <p class="mt-4 text-xs leading-6 text-slate-500">لا تشارك كلمة المرور أبدًا. سيُطلب منك فقط معرّف اللاعب (Player ID / UID) الضروري لتنفيذ الخدمة.</p>
        </div>
      </div>

      <!-- Detail Cards Grid -->
      <div class="mt-9 grid gap-4 sm:mt-12 ${product.accountProfile ? 'md:grid-cols-4' : 'md:grid-cols-3'}">
        <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
          <h2 class="text-sm font-bold text-white">تفاصيل المنتج</h2>
          <p class="mt-3 text-sm leading-7 text-slate-400">${product.details || product.description || 'خدمة شحن رقمية مباشرة.'}</p>
        </article>
        ${product.accountProfile ? `
          <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <h2 class="text-sm font-bold text-white">حساب بمستوى ${product.accountProfile.level}</h2>
            <p class="mt-3 text-sm leading-7 text-slate-400">العناصر المهمة: ${product.accountProfile.highlights}. الحالة: ${product.accountProfile.accountStatus === 'available' ? 'متاح' : 'مباع'}.</p>
          </article>
        ` : ''}
        <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
          <h2 class="text-sm font-bold text-white">طريقة الاستخدام</h2>
          <p class="mt-3 text-sm leading-7 text-slate-400">${product.useInstructions || 'أدخل معرّف الحساب الصحيح، وتابع حالة الطلب من صفحة حسابك.'}</p>
        </article>
        <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
          <h2 class="text-sm font-bold text-white">سياسة التسليم</h2>
          <p class="mt-3 text-sm leading-7 text-slate-400">لا تظهر بيانات المنتج أو الحساب الحساسة إلا بعد تأكيد الدفع والتحقق من حالة الطلب.</p>
        </article>
      </div>
    </section>
  `;
}

// 4. CART VIEW
function viewCart() {
  const lines = Store.cart;
  const subtotal = getCartSubtotal();

  if (!lines.length) {
    return `
      <section class="container py-6 sm:py-12">
        <span class="eyebrow">سلة التسوق</span>
        <h1 class="mt-4 text-3xl font-black text-white">جاهز لإتمام طلبك؟</h1>
        <div class="empty-state mt-6 sm:mt-8">
          <i data-lucide="shopping-bag" class="h-8 w-8 text-slate-500"></i>
          <h2>سلتك فارغة</h2>
          <p>ابدأ باستكشاف شحن الألعاب والمنتجات الرقمية المتاحة.</p>
          <button onclick="navigate('store')" class="btn-primary mt-4">تصفح المتجر</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="container py-6 sm:py-12">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="eyebrow">سلة التسوق</span>
          <h1 class="mt-2 text-3xl font-black text-white">جاهز لإتمام طلبك؟</h1>
        </div>
        <button onclick="clearCart()" class="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 transition">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
          <span>إفراغ السلة</span>
        </button>
      </div>

      <div class="mt-6 grid gap-5 sm:mt-8 sm:gap-7 lg:grid-cols-[1fr_330px]">
        <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
          ${lines.map((line, idx) => {
            const p = line.product || Store.products.find(prod => String(prod.id) === String(line.productId)) || { id: line.productId || idx, name: 'منتج رقمي', price: 0 };
            const pId = p.id ?? line.productId ?? idx;
            const pPrice = Number(p.price || 0);
            return `
            <div class="flex flex-col gap-4 border-b border-white/[.07] p-4 sm:flex-row sm:items-center">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-black text-cyan-200">GP</div>
              <div class="min-w-0 flex-1">
                <h2 class="font-bold text-white">${p.name || 'منتج'}</h2>
                <p class="mt-1 text-xs text-slate-500">${p.deliveryEta || 'تسليم رقمي'} · تسليم رقمي</p>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <div class="flex items-center rounded-xl border border-white/10">
                  <button onclick="updateCartQty('${pId}', ${(line.quantity || 1) - 1})" class="grid h-10 w-10 place-items-center text-slate-400 hover:text-white">
                    <i data-lucide="minus" class="h-4 w-4"></i>
                  </button>
                  <span class="w-7 text-center text-sm font-bold">${line.quantity || 1}</span>
                  <button onclick="updateCartQty('${pId}', ${(line.quantity || 1) + 1})" class="grid h-10 w-10 place-items-center text-slate-400 hover:text-white">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                  </button>
                </div>
                <strong class="text-sm text-cyan-200">${formatPrice(pPrice * (line.quantity || 1))}</strong>
                <button onclick="removeFromCart('${pId}')" class="icon-button h-10 w-10 text-rose-300 hover:bg-rose-500/10" aria-label="حذف">
                  <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
              </div>
            </div>
          `;}).join('')}
        </div>

        <!-- Cart Summary Sidebar -->
        <aside class="h-fit rounded-2xl border border-cyan-300/15 bg-gradient-to-b from-cyan-400/10 to-[#0d1929] p-4 sm:p-5">
          <h2 class="font-bold text-white">ملخص الطلب</h2>
          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between text-slate-400">
              <span>الإجمالي الفرعي</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>التسليم</span>
              <span class="text-cyan-300">رقمي</span>
            </div>
            <div class="border-t border-white/10 pt-4 text-base font-bold text-white">
              <span>الإجمالي</span>
              <span class="float-left text-cyan-200">${formatPrice(subtotal)}</span>
            </div>
          </div>
          <button onclick="navigate('checkout')" class="btn-primary mt-6 w-full py-3.5">إتمام الطلب</button>
          <p class="mt-4 text-center text-xs leading-5 text-slate-500">لن يطلب منك عنوان شحن؛ المنتجات والخدمات رقمية بالكامل.</p>
        </aside>
      </div>
    </section>
  `;
}

// 5. CHECKOUT VIEW
let checkoutState = {
  name: '',
  email: '',
  phone: '',
  accountData: '',
  couponCode: '',
  paymentMethod: 'wallet',
  appliedDiscount: 0
};

function viewCheckout() {
  const lines = Store.cart;
  if (!lines.length) {
    navigate('cart');
    return '';
  }

  const needsAccountData = lines.some(l => l.product.type === 'topup' || l.product.type === 'account');
  const subtotal = getCartSubtotal();
  const finalTotal = Math.max(0, subtotal - checkoutState.appliedDiscount);
  const walletBalance = Store.wallet ? Store.wallet.balance : 0;

  return `
    <section class="container py-12">
      <span class="eyebrow">إتمام الطلب</span>
      <h1 class="mt-4 text-3xl font-black text-white">بياناتك وخدمة الشحن</h1>
      <p class="mt-3 text-sm text-slate-400">المنتجات رقمية، ولذلك لن نطلب منك عنوان شحن.</p>

      <form id="checkoutForm" onsubmit="handleCheckoutSubmit(event)" class="mt-8 grid gap-7 lg:grid-cols-[1fr_340px]">
        <div class="space-y-6">
          <!-- Customer Info -->
          <section class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <div class="flex items-center gap-2 text-white">
              <i data-lucide="shield-check" class="h-5 w-5 text-cyan-300"></i>
              <h2 class="font-bold">بيانات العميل</h2>
            </div>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="field-label sm:col-span-2">الاسم
                <input required value="${checkoutState.name || (Store.user ? Store.user.name : '')}" oninput="checkoutState.name = this.value" placeholder="الاسم الكامل" class="field-input" />
              </label>
              <label class="field-label">البريد الإلكتروني
                <input required type="email" value="${checkoutState.email || (Store.user ? Store.user.email : '')}" oninput="checkoutState.email = this.value" placeholder="name@example.com" class="field-input" />
              </label>
              <label class="field-label">رقم الهاتف
                <input required value="${checkoutState.phone}" oninput="checkoutState.phone = this.value" placeholder="01xxxxxxxxx" class="field-input" />
              </label>
            </div>
          </section>

          <!-- Account Fulfillment Data (if topup or account) -->
          ${needsAccountData ? `
            <section class="rounded-2xl border border-cyan-300/15 bg-cyan-300/[.04] p-5">
              <div class="flex items-center gap-2 text-white">
                <i data-lucide="lock-keyhole" class="h-5 w-5 text-cyan-300"></i>
                <h2 class="font-bold">بيانات تنفيذ الخدمة</h2>
              </div>
              <p class="mt-2 text-xs leading-6 text-slate-400">أدخل معرّف اللاعب (Player ID) أو UID المطلوب فقط. لا تشارك كلمة المرور أبدًا.</p>
              <label class="field-label mt-4">معرّف اللاعب أو الحساب
                <textarea required value="${checkoutState.accountData}" oninput="checkoutState.accountData = this.value" placeholder="مثال: Player ID: 529381029 / UID: 1029381" class="field-input min-h-24 resize-y"></textarea>
              </label>
            </section>
          ` : ''}

          <!-- Payment Methods -->
          <section class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
            <div class="flex items-center gap-2 text-white">
              <i data-lucide="credit-card" class="h-5 w-5 text-cyan-300"></i>
              <h2 class="font-bold">طريقة الدفع</h2>
            </div>
            <div class="mt-4 grid gap-3">
              <!-- Wallet Option -->
              <label class="cursor-pointer rounded-xl border p-4 transition ${checkoutState.paymentMethod === 'wallet' ? 'border-cyan-300/60 bg-cyan-300/[.07]' : 'border-white/10 bg-white/[.02]'}">
                <input class="sr-only" type="radio" name="payment" value="wallet" ${checkoutState.paymentMethod === 'wallet' ? 'checked' : ''} onchange="checkoutState.paymentMethod = 'wallet'; renderCurrentRoute();" />
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <strong class="flex items-center gap-2 text-sm text-white">
                      <i data-lucide="wallet-cards" class="h-4 w-4 text-cyan-300"></i>رصيد محفظة Game Pay
                    </strong>
                    <span class="mt-1 block text-xs text-slate-400">يُخصم المبلغ مباشرة من رصيدك عند تأكيد الطلب فورًا.</span>
                  </div>
                  <strong class="shrink-0 text-sm text-cyan-200">${formatPrice(walletBalance)}</strong>
                </div>
                ${walletBalance < finalTotal ? `
                  <span class="mt-2 block text-[11px] text-amber-200">الرصيد الحالي (${formatPrice(walletBalance)}) أقل من الإجمالي (${formatPrice(finalTotal)}). يمكنك شحن المحفظة من حسابك أو اختيار وسيلة دفع أخرى.</span>
                ` : ''}
              </label>

              <!-- Vodafone Cash Option -->
              <label class="cursor-pointer rounded-xl border p-4 transition ${checkoutState.paymentMethod === 'vodafone' ? 'border-cyan-300/60 bg-cyan-300/[.07]' : 'border-white/10 bg-white/[.02]'}">
                <input class="sr-only" type="radio" name="payment" value="vodafone" ${checkoutState.paymentMethod === 'vodafone' ? 'checked' : ''} onchange="checkoutState.paymentMethod = 'vodafone'; renderCurrentRoute();" />
                <strong class="text-sm text-white">فودافون كاش (Vodafone Cash)</strong>
                <span class="mt-1 block text-xs text-slate-400">تحويل مباشر إلى محفظة فودافون كاش وتأكيد فوري عبر رقم الإشعار.</span>
                ${checkoutState.paymentMethod === 'vodafone' ? `
                  <div class="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/[.06] p-3 text-xs leading-6 text-rose-200">
                    يرجى تحويل المبلغ المطلوب إلى رقم فودافون كاش: <strong>010XXXXXXXX</strong> ثم إتمام الطلب وسيتولى فريقنا التنفيذ فور التأكيد.
                  </div>
                ` : ''}
              </label>

              <!-- InstaPay Option -->
              <label class="cursor-pointer rounded-xl border p-4 transition ${checkoutState.paymentMethod === 'instapay' ? 'border-cyan-300/60 bg-cyan-300/[.07]' : 'border-white/10 bg-white/[.02]'}">
                <input class="sr-only" type="radio" name="payment" value="instapay" ${checkoutState.paymentMethod === 'instapay' ? 'checked' : ''} onchange="checkoutState.paymentMethod = 'instapay'; renderCurrentRoute();" />
                <strong class="text-sm text-white">انستاباي (InstaPay)</strong>
                <span class="mt-1 block text-xs text-slate-400">تحويل لحظي عن طريق معرّف IPA أو رقم الحساب البنكي.</span>
                ${checkoutState.paymentMethod === 'instapay' ? `
                  <div class="mt-3 rounded-xl border border-violet-400/20 bg-violet-400/[.06] p-3 text-xs leading-6 text-violet-200">
                    يرجى تحويل المبلغ عبر إنستاباي إلى العنوان: <strong>gamepay@instapay</strong> ثم تأكيد الطلب للبدء في تسليمه.
                  </div>
                ` : ''}
              </label>
            </div>
          </section>
        </div>

        <!-- Checkout Sidebar Review -->
        <aside class="h-fit rounded-2xl border border-cyan-300/15 bg-gradient-to-b from-cyan-400/10 to-[#0d1929] p-5 lg:sticky lg:top-24">
          <h2 class="font-bold text-white">مراجعة الطلب</h2>
          <div class="mt-4 space-y-3">
            ${lines.map(line => `
              <div class="flex justify-between gap-4 text-sm">
                <span class="line-clamp-1 text-slate-300">${line.product.name} × ${line.quantity}</span>
                <span class="shrink-0 text-cyan-200">${formatPrice(Number(line.product.price) * line.quantity)}</span>
              </div>
            `).join('')}
          </div>

          <div class="mt-5">
            <label class="field-label">كوبون الخصم
              <div class="flex gap-2">
                <input id="couponInput" value="${checkoutState.couponCode}" placeholder="اختياري (مثل: WELCOME10)" class="field-input uppercase" />
                <button type="button" onclick="applyCoupon()" class="btn-secondary px-3 py-2 text-xs">تطبيق</button>
              </div>
            </label>
            ${checkoutState.appliedDiscount > 0 ? `
              <div class="mt-2 flex justify-between text-xs text-emerald-300 font-bold">
                <span>الخصم المطبق</span>
                <span>-${formatPrice(checkoutState.appliedDiscount)}</span>
              </div>
            ` : ''}
          </div>

          <div class="mt-5 border-t border-white/10 pt-4">
            <div class="flex justify-between font-bold text-white text-base">
              <span>الإجمالي</span>
              <span class="text-cyan-200">${formatPrice(finalTotal)}</span>
            </div>
            <p class="mt-2 text-xs leading-5 text-slate-500">يُراجع الكوبون والرصيد عند تأكيد الطلب.</p>
          </div>

          <button type="submit" class="btn-primary mt-6 w-full py-3.5">تأكيد الطلب</button>
        </aside>
      </form>
    </section>
  `;
}

function applyCoupon() {
  const code = (document.getElementById('couponInput')?.value || '').trim().toUpperCase();
  if (!code) return;
  const match = Store.coupons.find(c => c.code === code && c.isActive);
  if (!match) {
    showToast('كود الكوبون غير صحيح أو منتهي الصلاحية', 'error');
    return;
  }
  const subtotal = getCartSubtotal();
  let discount = match.discountType === 'percent' ? (subtotal * match.value / 100) : match.value;
  checkoutState.couponCode = code;
  checkoutState.appliedDiscount = discount;
  showToast(`تم تطبيق كوبون خصم ${match.value}${match.discountType === 'percent' ? '%' : ' EGP'}`, 'success');
  renderCurrentRoute();
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const lines = Store.cart;
  if (!lines.length) return navigate('store');

  const needsAccountData = lines.some(l => l.product.type === 'topup' || l.product.type === 'account');
  if (needsAccountData && !checkoutState.accountData.trim()) {
    showToast('أدخل معرّف اللاعب (Player ID) المطلوب للتنفيذ قبل تأكيد الطلب.', 'error');
    return;
  }

  const subtotal = getCartSubtotal();
  const finalTotal = Math.max(0, subtotal - checkoutState.appliedDiscount);
  const ref = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  // Check wallet balance if payment is wallet
  if (checkoutState.paymentMethod === 'wallet') {
    if (!Store.user || !Store.user.uid) {
      showToast('يرجى تسجيل الدخول بحسابك أولاً لإتمام الدفع عبر المحفظة.', 'error');
      navigate('login');
      return;
    }
    if (Store.wallet.balance < finalTotal) {
      showToast('رصيد المحفظة غير كافٍ لإتمام الطلب. يرجى شحن الرصيد أولاً أو اختيار وسيلة دفع أخرى.', 'error');
      return;
    }
    // Deduct from wallet
    Store.wallet.balance -= finalTotal;
    const txId = Date.now();
    const tx = {
      id: txId,
      customerId: Store.user.uid,
      type: 'purchase',
      amount: -finalTotal,
      orderRef: ref,
      createdAt: new Date().toISOString()
    };
    Store.wallet.transactions.unshift(tx);
    Store.saveWallet();

    if (isFirebaseActive && db) {
      db.collection('customer_wallets').doc(Store.user.uid).set({
        customerId: Store.user.uid,
        balance: Store.wallet.balance,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);

      db.collection('wallet_transactions').doc(String(txId)).set(tx).catch(console.error);
    }
  }

  // Generate Reference
  const newOrder = {
    id: Date.now(),
    reference: ref,
    customerId: Store.user ? Store.user.uid : null,
    customerName: checkoutState.name || (Store.user ? Store.user.name : 'عميل Game Pay'),
    customerEmail: checkoutState.email || (Store.user ? Store.user.email : 'customer@example.com'),
    customerPhone: checkoutState.phone || '',
    accountData: checkoutState.accountData,
    paymentMethod: checkoutState.paymentMethod,
    paymentStatus: checkoutState.paymentMethod === 'wallet' ? 'paid' : 'pending',
    fulfillmentStatus: 'processing',
    total: finalTotal,
    createdAt: new Date().toISOString(),
    items: lines.map(line => ({
      id: line.product.id,
      productName: line.product.name,
      productType: line.product.type,
      quantity: line.quantity,
      unitPrice: line.product.price,
      deliverySnapshot: line.product.type === 'digital' ? 'كود الشحن الرقمي: ' + Math.random().toString(36).substring(2, 12).toUpperCase() : null
    }))
  };

  Store.orders.unshift(newOrder);
  Store.saveOrders();

  // Clear Cart
  Store.cart = [];
  Store.saveCart();

  // If Firebase active, push to Firestore
  if (isFirebaseActive && db) {
    db.collection('orders').doc(ref).set(newOrder).catch(console.error);
  }

  showToast('تم إنشاء طلبك بنجاح!', 'success');
  navigate('order-success/' + ref);
}

// 6. ORDER SUCCESS VIEW
function viewOrderSuccess(reference) {
  const order = Store.orders.find(o => o.reference === reference);
  if (!order) {
    return `
      <div class="container py-20">
        <div class="empty-state">
          <h1>تعذر العثور على الطلب</h1>
          <p>سجل الدخول بالحساب الذي أنشأ الطلب ثم حاول مجددًا.</p>
          <button onclick="navigate('orders')" class="btn-primary mt-4">الذهاب إلى طلباتي</button>
        </div>
      </div>
    `;
  }

  return `
    <section class="container py-12">
      <div class="mx-auto max-w-3xl">
        <div class="rounded-[28px] border border-cyan-300/20 bg-gradient-to-b from-cyan-300/[.12] to-[#0d1929] p-7 text-center sm:p-10">
          <i data-lucide="check-circle-2" class="mx-auto h-14 w-14 text-cyan-300"></i>
          <h1 class="mt-5 text-3xl font-black text-white">تم إنشاء طلبك بنجاح</h1>
          <p class="mt-3 text-sm leading-7 text-slate-300">رقم طلبك المرجعي: <strong class="text-cyan-200">${order.reference}</strong></p>
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <span class="badge-neutral">${paymentLabels[order.paymentStatus] || order.paymentStatus}</span>
            <span class="badge-neutral">${fulfillmentLabels[order.fulfillmentStatus] || order.fulfillmentStatus}</span>
          </div>
        </div>

        <div class="mt-6 rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
          <div class="flex items-center gap-2">
            <i data-lucide="package-open" class="h-5 w-5 text-cyan-300"></i>
            <h2 class="font-bold text-white">تفاصيل المنتج</h2>
          </div>
          <div class="mt-5 space-y-4">
            ${order.items.map(item => `
              <div class="rounded-xl border border-white/[.06] bg-white/[.02] p-4">
                <div class="flex flex-wrap justify-between gap-3">
                  <div>
                    <strong class="text-sm text-white">${item.productName}</strong>
                    <p class="mt-1 text-xs text-slate-500">الكمية: ${item.quantity}</p>
                  </div>
                  <strong class="text-sm text-cyan-200">${formatPrice(Number(item.unitPrice) * item.quantity)}</strong>
                </div>
                ${item.deliverySnapshot ? `
                  <div class="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[.05] p-3 text-xs leading-6 text-slate-300">
                    <span class="mb-1 flex items-center gap-1.5 font-bold text-cyan-200">
                      <i data-lucide="lock-keyhole" class="h-3.5 w-3.5"></i>معلومات التسليم الرقمي
                    </span>
                    ${item.deliverySnapshot}
                  </div>
                ` : `
                  <p class="mt-4 text-xs leading-6 text-slate-500">تُعرض تفاصيل التسليم الحساسة بعد تأكيد الدفع والتحقق من حالة الطلب.</p>
                `}
              </div>
            `).join('')}
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button onclick="navigate('orders')" class="btn-primary">عرض طلباتي</button>
            <button onclick="navigate('store')" class="btn-secondary">العودة إلى المتجر</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 7. ORDERS VIEW
function viewOrders() {
  const orders = Store.orders;

  return `
    <section class="container py-6 sm:py-12">
      <span class="eyebrow">حسابي</span>
      <h1 class="mt-4 text-3xl font-black text-white">طلباتي</h1>
      <p class="mt-3 text-sm text-slate-400">تابع حالة الدفع والتسليم لكل طلب من مكان واحد وبكل شفافية.</p>

      ${orders.length > 0 ? `
        <div class="mt-6 overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929] sm:mt-8">
          ${orders.map(order => `
            <article class="grid gap-3 border-b border-white/[.07] p-4 last:border-b-0 sm:gap-4 sm:p-5 md:grid-cols-[1.2fr_.8fr_.7fr_auto] md:items-center">
              <div>
                <strong class="text-white">${order.reference}</strong>
                <p class="mt-1 text-xs text-slate-500">${new Date(order.createdAt).toLocaleString('ar-EG')}</p>
              </div>
              <div>
                <span class="block text-xs text-slate-500">الإجمالي</span>
                <strong class="text-sm text-cyan-200">${formatPrice(order.total)}</strong>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="badge-neutral">${paymentLabels[order.paymentStatus] || order.paymentStatus}</span>
                <span class="badge-neutral">${fulfillmentLabels[order.fulfillmentStatus] || order.fulfillmentStatus}</span>
              </div>
              <button onclick="navigate('order-success/${order.reference}')" class="btn-secondary text-xs">
                التفاصيل <i data-lucide="external-link" class="h-3.5 w-3.5"></i>
              </button>
            </article>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state mt-6 sm:mt-8">
          <i data-lucide="package-check" class="h-8 w-8 text-slate-500"></i>
          <h2>لا توجد طلبات حتى الآن</h2>
          <p>بعد إتمام طلبك ستظهر تفاصيله وحالة تسليمه خطوة بخطوة هنا.</p>
          <button onclick="navigate('store')" class="btn-primary mt-4">تصفح المتجر</button>
        </div>
      `}
    </section>
  `;
}

// 8. ACCOUNT & WALLET VIEW
let accountActiveTab = 'profile';

function viewAccount() {
  if (!Store.user) {
    return `
      <section class="container py-20">
        <div class="empty-state">
          <i data-lucide="user-round" class="h-9 w-9 text-cyan-300"></i>
          <h1>سجّل الدخول لفتح حسابك</h1>
          <p>يمكنك متابعة طلباتك ومحفظتك وإدارة بياناتك من حساب Game Pay الخاص بك.</p>
          <button onclick="navigate('login')" class="btn-primary mt-4">تسجيل الدخول</button>
          <button onclick="navigate('register')" class="mt-3 text-sm font-bold text-cyan-300">إنشاء حساب جديد</button>
        </div>
      </section>
    `;
  }

  const u = Store.user;
  const wallet = Store.wallet;
  const topupStatus = { pending: "قيد المراجعة", approved: "تمت الإضافة", rejected: "لم يُعتمد", cancelled: "ملغي" };

  return `
    <section class="container py-10">
      <!-- Profile Header -->
      <div class="rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.12),transparent_35%),#0d1929] p-6 md:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div class="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-2xl font-black text-slate-950">
              ${(u.name || 'G').charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="eyebrow">حساب Game Pay</span>
              <h1 class="mt-3 text-3xl font-black text-white">مرحبًا، ${u.name || 'العميل'}</h1>
              <p class="mt-2 text-sm text-slate-400">بياناتك وطلباتك ومحفظتك ضمن حسابك الخاص بالمتجر.</p>
            </div>
          </div>
          <button onclick="accountActiveTab = 'wallet'; renderCurrentRoute();" class="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.06] px-5 py-4 text-right">
            <span class="text-xs text-slate-400">رصيد المحفظة</span>
            <strong class="mt-1 block text-xl text-cyan-200">${formatPrice(wallet.balance)}</strong>
          </button>
        </div>

        <!-- Account Tabs -->
        <div class="mt-7 flex gap-2 overflow-x-auto pb-1">
          <button onclick="accountActiveTab = 'profile'; renderCurrentRoute();" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${accountActiveTab === 'profile' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
            <i data-lucide="user-round" class="h-4 w-4"></i>الملف الشخصي
          </button>
          <button onclick="accountActiveTab = 'orders'; renderCurrentRoute();" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${accountActiveTab === 'orders' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
            <i data-lucide="clipboard-list" class="h-4 w-4"></i>طلباتي
          </button>
          <button onclick="accountActiveTab = 'wallet'; renderCurrentRoute();" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${accountActiveTab === 'wallet' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
            <i data-lucide="wallet-cards" class="h-4 w-4"></i>المحفظة
          </button>
          <button onclick="accountActiveTab = 'security'; renderCurrentRoute();" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${accountActiveTab === 'security' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
            <i data-lucide="key-round" class="h-4 w-4"></i>الأمان
          </button>
        </div>
      </div>

      <!-- TAB CONTENT: PROFILE -->
      ${accountActiveTab === 'profile' ? `
        <section class="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <aside class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6 text-center">
            <div class="grid h-24 w-24 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-2xl font-black text-slate-950">
              ${(u.name || 'G').charAt(0).toUpperCase()}
            </div>
            <h2 class="mt-5 font-bold text-white">صورة الحساب</h2>
            <p class="mt-2 text-xs leading-6 text-slate-500">تم تعيين الأفاتار الافتراضي للحساب بنجاح.</p>
          </aside>
          <div class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6">
            <h2 class="text-lg font-bold text-white">بياناتك الشخصية</h2>
            <label class="field-label mt-6">الاسم
              <input id="profName" value="${u.name || ''}" class="field-input" />
            </label>
            <label class="field-label mt-4">البريد الإلكتروني
              <span class="field-input mt-1 block cursor-not-allowed bg-white/[.03] text-slate-500">${u.email || ''}</span>
            </label>
            <button onclick="saveUserProfile()" class="btn-primary mt-6">
              <i data-lucide="save" class="h-4 w-4"></i>حفظ التغييرات
            </button>
          </div>
        </section>
      ` : ''}

      <!-- TAB CONTENT: ORDERS -->
      ${accountActiveTab === 'orders' ? `
        <section class="mt-7">
          <h2 class="text-xl font-black text-white">تتبّع طلباتي</h2>
          <p class="mt-2 text-sm text-slate-400">تعرف بوضوح إن كان طلبك بانتظار الدفع أو قيد التنفيذ أو تم تسليمه.</p>
          ${Store.orders.length ? `
            <div class="mt-6 grid gap-4">
              ${Store.orders.map(order => `
                <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <strong class="text-white">${order.reference}</strong>
                      <p class="mt-1 text-xs text-slate-500">${new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="badge-neutral">${paymentLabels[order.paymentStatus] || order.paymentStatus}</span>
                      <span class="badge-neutral">${fulfillmentLabels[order.fulfillmentStatus] || order.fulfillmentStatus}</span>
                    </div>
                  </div>
                  <!-- 3-Step Progress Bar -->
                  <div class="mt-4 grid grid-cols-3 gap-1">
                    <div>
                      <div class="h-1 rounded-full bg-cyan-300"></div>
                      <span class="mt-2 block text-[10px] text-cyan-200">بانتظار</span>
                    </div>
                    <div>
                      <div class="h-1 rounded-full ${order.fulfillmentStatus === 'processing' || order.fulfillmentStatus === 'delivered' ? 'bg-cyan-300' : 'bg-white/10'}"></div>
                      <span class="mt-2 block text-[10px] ${order.fulfillmentStatus === 'processing' || order.fulfillmentStatus === 'delivered' ? 'text-cyan-200' : 'text-slate-500'}">قيد التنفيذ</span>
                    </div>
                    <div>
                      <div class="h-1 rounded-full ${order.fulfillmentStatus === 'delivered' ? 'bg-cyan-300' : 'bg-white/10'}"></div>
                      <span class="mt-2 block text-[10px] ${order.fulfillmentStatus === 'delivered' ? 'text-cyan-200' : 'text-slate-500'}">تم التسليم</span>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-4">
                    <div class="text-sm">
                      <span class="text-slate-500">الإجمالي: </span>
                      <strong class="text-cyan-200">${formatPrice(order.total)}</strong>
                    </div>
                    <button onclick="navigate('order-success/${order.reference}')" class="btn-secondary text-xs">
                      تفاصيل الطلب <i data-lucide="external-link" class="h-3.5 w-3.5"></i>
                    </button>
                  </div>
                </article>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state mt-6">
              <i data-lucide="package-check" class="h-8 w-8 text-slate-500"></i>
              <h2>لا توجد طلبات بعد</h2>
              <button onclick="navigate('store')" class="btn-primary mt-4">تصفح المتجر</button>
            </div>
          `}
        </section>
      ` : ''}

      <!-- TAB CONTENT: WALLET -->
      ${accountActiveTab === 'wallet' ? `
        <section class="mt-7 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
          <aside class="rounded-2xl border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.14),transparent_48%),#0d1929] p-6">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
                <i data-lucide="wallet-cards" class="h-5 w-5"></i>
              </span>
              <div>
                <h2 class="font-bold text-white">رصيدك المتاح</h2>
                <strong class="mt-1 block text-2xl text-cyan-200">${formatPrice(wallet.balance)}</strong>
              </div>
            </div>
            <p class="mt-5 text-xs leading-6 text-slate-400">بعد اعتماد طلب الشحن، يظهر الرصيد هنا فورًا ويمكنك اختياره كطريقة دفع سريعة من صفحة إتمام الطلب.</p>

            <div class="mt-6 border-t border-white/[.08] pt-5">
              <h3 class="font-bold text-white">سجل العمليات</h3>
              <div class="mt-3 space-y-2">
                ${wallet.transactions.length ? wallet.transactions.map(t => `
                  <div class="flex items-center justify-between gap-3 rounded-xl bg-white/[.035] px-3 py-2.5">
                    <div>
                      <strong class="block text-xs text-slate-200">${t.type === 'purchase' ? 'دفع طلب' : 'شحن محفظة'}</strong>
                      <span class="text-[11px] text-slate-500">${new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <strong class="${t.amount >= 0 ? 'text-sm text-emerald-300' : 'text-sm text-rose-300'}">
                      ${t.amount >= 0 ? '+' : ''}${formatPrice(t.amount)}
                    </strong>
                  </div>
                `).join('') : '<p class="rounded-xl bg-white/[.035] p-4 text-xs text-slate-500">لا توجد معاملات في المحفظة بعد.</p>'}
              </div>
            </div>
          </aside>

          <div class="space-y-6">
            <!-- Topup Request Form -->
            <section class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6">
              <div class="flex items-center gap-3">
                <i data-lucide="landmark" class="h-5 w-5 text-cyan-300"></i>
                <div>
                  <h2 class="font-bold text-white">طلب شحن رصيد</h2>
                  <p class="mt-1 text-xs text-slate-400">اختر الوسيلة، اتبع تعليمات التحويل، ثم أرسل رقم العملية للمراجعة والاعتماد.</p>
                </div>
              </div>

              <form onsubmit="handleTopupSubmit(event)" class="mt-5 grid gap-4">
                <label class="field-label">وسيلة الشحن
                  <select id="topupMethod" required class="field-select">
                    <option value="Vodafone Cash">فودافون كاش (Vodafone Cash)</option>
                    <option value="InstaPay">انستاباي (InstaPay)</option>
                    <option value="Bank Transfer">تحويل بنكي مباشر</option>
                  </select>
                </label>
                <div class="rounded-xl border border-cyan-300/15 bg-cyan-300/[.05] p-3 text-xs leading-6 text-cyan-100">
                  يرجى تحويل المبلغ المطلوب إلى رقم المحفظة المعتمد: <strong>010XXXXXXXX</strong> ثم إرفاق رقم العملية المرجعي أدناه.
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="field-label">قيمة الشحن (EGP)
                    <input id="topupAmount" required min="10" type="number" step="1" placeholder="مثال: 100" class="field-input" />
                  </label>
                  <label class="field-label">مرجع أو رقم التحويل
                    <input id="topupRef" required placeholder="رقم العملية / الحوالة" class="field-input" />
                  </label>
                </div>
                <label class="field-label">ملاحظة إضافية (اختياري)
                  <textarea id="topupNote" placeholder="ملاحظة لفريق المتجر..." class="field-input min-h-20"></textarea>
                </label>
                <button type="submit" class="btn-primary">إرسال طلب الشحن</button>
              </form>
            </section>

            <!-- Previous Topup Requests -->
            <section class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6">
              <h2 class="font-bold text-white">طلبات الشحن السابقة</h2>
              <div class="mt-4 space-y-3">
                ${Store.topupRequests.length ? Store.topupRequests.map(r => `
                  <article class="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong class="text-sm text-white">${r.method}</strong>
                        <p class="mt-1 text-xs text-slate-500">${new Date(r.createdAt).toLocaleString('ar-EG')} ${r.reference ? ' · ' + r.reference : ''}</p>
                      </div>
                      <div class="text-left">
                        <strong class="block text-sm text-cyan-200">${formatPrice(r.amount)}</strong>
                        <span class="text-xs text-slate-400">${topupStatus[r.status] || r.status}</span>
                      </div>
                    </div>
                  </article>
                `).join('') : '<p class="text-sm text-slate-500">لا توجد طلبات شحن سابقة.</p>'}
              </div>
            </section>
          </div>
        </section>
      ` : ''}

      <!-- TAB CONTENT: SECURITY -->
      ${accountActiveTab === 'security' ? `
        <section class="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <aside class="grid place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.05] p-8">
            <i data-lucide="shield-check" class="h-12 w-12 text-cyan-300"></i>
          </aside>
          <div class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6">
            <h2 class="text-xl font-black text-white">أمان الحساب وكلمة المرور</h2>
            <p class="mt-2 text-sm leading-7 text-slate-400">حسابك محمي بجلسة مستقلة وتشفير لكلمة المرور.</p>
            <div class="mt-5 grid gap-3">
              <label class="field-label">كلمة المرور الجديدة
                <input id="secNewPass" type="password" minlength="8" placeholder="8 أحرف على الأقل" class="field-input" />
              </label>
              <button onclick="showToast('تم تحديث أمان الحساب بنجاح', 'success')" class="btn-primary mt-2">تحديث كلمة المرور</button>
            </div>
          </div>
        </section>
      ` : ''}
    </section>
  `;
}

function saveUserProfile() {
  const name = document.getElementById('profName')?.value.trim();
  if (name && name.length >= 2) {
    Store.user.name = name;
    Store.saveUser();
    showToast('تم حفظ التغييرات بنجاح', 'success');
    renderCurrentRoute();
  }
}

function handleTopupSubmit(e) {
  e.preventDefault();
  if (!Store.user || !Store.user.uid) {
    showToast('يرجى تسجيل الدخول أولاً لتقديم طلب شحن المحفظة.', 'error');
    navigate('login');
    return;
  }

  const method = document.getElementById('topupMethod')?.value;
  const amount = Number(document.getElementById('topupAmount')?.value);
  const ref = document.getElementById('topupRef')?.value.trim();
  const note = document.getElementById('topupNote')?.value.trim();

  if (!amount || amount <= 0) {
    showToast('أدخل مبلغًا صحيحًا لشحن المحفظة', 'error');
    return;
  }

  const reqId = Date.now();
  const req = {
    id: reqId,
    customerId: Store.user.uid,
    customerName: Store.user.name || '',
    customerEmail: Store.user.email || '',
    method,
    amount,
    reference: ref,
    note,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  Store.topupRequests.unshift(req);
  Store.saveTopups();

  if (isFirebaseActive && db) {
    db.collection('wallet_topup_requests').doc(String(reqId)).set(req).then(() => {
      showToast('تم إرسال طلب الشحن بنجاح وهو قيد المراجعة والاعتماد!', 'success');
    }).catch(err => {
      console.error('Topup request error:', err);
      showToast('خطأ في إرسال طلب الشحن للسيرفر: ' + err.message, 'error');
    });
  } else {
    showToast('تم إرسال طلب الشحن للمراجعة والاعتماد', 'success');
  }

  renderCurrentRoute();
}

// 9. AUTH (LOGIN & REGISTER & FORGOT PASSWORD) VIEW
function viewAuth(mode = 'login') {
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot-password';
  const rememberedId = (!isRegister && !isForgot && localStorage.getItem('gp_remember_identifier')) || '';
  const isRemembered = !isRegister && !isForgot && (localStorage.getItem('gp_remember_me') !== 'false');

  return `
    <main dir="rtl" class="min-h-screen bg-[#07111f] p-4 text-slate-100 md:p-8">
      <div class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/[.08] bg-[#0b1728] lg:grid-cols-[1.05fr_.95fr]">
        <!-- Brand Info Sidebar -->
        <aside class="relative hidden overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,.2),transparent_25%),linear-gradient(145deg,#0d2744,#07111f)] p-12 lg:flex lg:flex-col lg:justify-between">
          <div class="flex items-center gap-2.5 select-none" aria-label="Game Pay">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-white shadow-[0_0_28px_rgba(136,70,208,.42)]">
              <i data-lucide="gamepad-2" class="h-5 w-5" stroke-width="2.6"></i>
            </div>
            <div class="leading-none">
              <strong class="block text-lg tracking-tight text-white">Game Pay</strong>
              <span class="mt-1 block text-[10px] font-bold tracking-[.28em] text-cyan-300">جيم باي</span>
            </div>
          </div>

          <div>
            <span class="eyebrow">حساب Game Pay</span>
            <h1 class="mt-6 text-5xl font-black leading-tight text-white">
              ألعابك، طلباتك،<br />
              <span class="text-gradient">وحسابك في مكان واحد.</span>
            </h1>
            <p class="mt-6 max-w-md leading-8 text-slate-300">سجّل بحساب خاص بالمتجر لتتابع الشحن والمنتجات الرقمية وتتحكم بمحفظتك بكل خصوصية وأمان.</p>
          </div>

          <div class="flex items-start gap-3 rounded-2xl border border-cyan-300/15 bg-[#07111f]/30 p-4 text-sm leading-7 text-cyan-50">
            <i data-lucide="shield-check" class="mt-1 h-5 w-5 shrink-0 text-cyan-300"></i>
            جلساتك آمنة، وكلمات المرور مشفرة ولا تظهر لأي طرف خارجي.
          </div>
        </aside>

        <!-- Auth Form -->
        <section class="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
          <button onclick="navigate('home')" class="mb-10 self-start lg:hidden">
            <div class="flex items-center gap-2.5 select-none">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-white">
                <i data-lucide="gamepad-2" class="h-5 w-5"></i>
              </div>
              <strong class="text-lg text-white">Game Pay</strong>
            </div>
          </button>

          <span class="eyebrow">${isForgot ? 'استعادة الحساب' : isRegister ? 'حساب جديد' : 'تسجيل الدخول'}</span>
          <h2 class="mt-4 text-3xl font-black text-white">${isForgot ? 'نسيت كلمة المرور؟' : isRegister ? 'أنشئ حسابك' : 'مرحبًا بعودتك'}</h2>
          ${isForgot ? `
            <p class="mt-3 text-sm leading-7 text-slate-400">
              أدخل بريدك الإلكتروني المسجّل وسنرسل لك رابط استعادة كلمة المرور.
            </p>
          ` : ''}

          <form onsubmit="handleAuthSubmit(event, '${mode}')" class="mt-8 grid gap-4">
            ${isRegister ? `
              <label class="field-label">الاسم الكامل
                <div class="relative">
                  <i data-lucide="user-round" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authName" required minlength="2" placeholder="مثال: أحمد محمد" class="field-input pr-10" />
                </div>
              </label>
            ` : ''}

            ${isRegister || isForgot ? `
              <label class="field-label">البريد الإلكتروني
                <div class="relative">
                  <i data-lucide="mail" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authEmail" required type="email" placeholder="name@example.com" class="field-input pr-10" />
                </div>
              </label>
            ` : `
              <label class="field-label">البريد الإلكتروني أو رقم الهاتف
                <div class="relative">
                  <i data-lucide="mail" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authEmail" required type="text" value="${rememberedId}" placeholder="name@example.com أو 01xxxxxxxxx" class="field-input pr-10" />
                </div>
              </label>
            `}

            ${isRegister ? `
              <label class="field-label">رقم الهاتف
                <div class="relative">
                  <i data-lucide="phone" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authPhone" required type="tel" placeholder="01xxxxxxxxx" class="field-input pr-10" />
                </div>
              </label>
            ` : ''}

            ${!isForgot ? `
              <label class="field-label">كلمة المرور
                <div class="relative">
                  <i data-lucide="lock-keyhole" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authPassword" required minlength="8" type="password" placeholder="8 أحرف على الأقل" class="field-input pr-10" />
                </div>
              </label>
            ` : ''}

            ${!isRegister && !isForgot ? `
              <div class="flex items-center justify-between mt-1">
                <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input id="authRememberMe" type="checkbox" ${isRemembered ? 'checked' : ''} class="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer" />
                  <span>تذكرني</span>
                </label>
                <button type="button" onclick="navigate('forgot-password')" class="text-xs text-cyan-300 hover:underline">
                  نسيت كلمة المرور؟
                </button>
              </div>
            ` : ''}

            ${isRegister ? `
              <label class="field-label">تأكيد كلمة المرور
                <div class="relative">
                  <i data-lucide="lock-keyhole" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authConfirmPassword" required minlength="8" type="password" placeholder="أعد إدخال كلمة المرور" class="field-input pr-10" />
                </div>
              </label>

              <label class="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none mt-1">
                <input id="authTerms" type="checkbox" required class="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer" />
                <span>
                  أوافق على <a href="#home" class="text-cyan-300 underline underline-offset-2">شروط الاستخدام</a> و <a href="#home" class="text-cyan-300 underline underline-offset-2">سياسة الخصوصية</a> الخاصة بـ Game Pay.
                </span>
              </label>
            ` : ''}

            <button id="authSubmitBtn" type="submit" class="btn-primary mt-2 w-full py-3.5 relative flex items-center justify-center transition-all duration-200">
              <span id="authBtnSpinner" class="hidden absolute inset-0 flex items-center justify-center bg-cyan-400 text-slate-950 font-bold rounded-xl gap-2">
                <svg class="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>${isForgot ? 'جارٍ إرسال الرابط...' : isRegister ? 'جارٍ إنشاء الحساب...' : 'جارٍ تسجيل الدخول...'}</span>
              </span>
              <span id="authBtnText">${isForgot ? 'إرسال رابط الاستعادة' : isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-400">
            ${isForgot ? `
              تذكرت كلمة المرور؟
              <button onclick="navigate('login')" class="font-bold text-cyan-300">
                سجّل الدخول
              </button>
            ` : isRegister ? `
              لديك حساب بالفعل؟
              <button onclick="navigate('login')" class="font-bold text-cyan-300">
                سجّل الدخول
              </button>
            ` : `
              ليس لديك حساب؟
              <button onclick="navigate('register')" class="font-bold text-cyan-300">
                أنشئ حسابًا
              </button>
            `}
          </p>
        </section>
      </div>
    </main>
  `;
}

function normalizePhone(raw) {
  if (!raw) return '';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let str = String(raw).trim().replace(/[٠-٩]/g, d => arabicDigits.indexOf(d));
  str = str.replace(/[\s\-\(\)]/g, '');
  return str;
}

function getPhoneLookupKeys(raw) {
  const clean = normalizePhone(raw);
  if (!clean) return [];
  const keys = new Set();
  keys.add(clean);
  let digits = clean.replace(/^\+/, '');
  keys.add(digits);
  if (digits.startsWith('0020')) {
    const d = digits.slice(4);
    keys.add('0' + d);
    keys.add(d);
    keys.add('20' + d);
    keys.add('+20' + d);
  } else if (digits.startsWith('20') && digits.length === 12) {
    const local = '0' + digits.slice(2);
    keys.add(local);
    keys.add(digits.slice(2));
    keys.add('+' + digits);
  } else if (digits.startsWith('01') && digits.length === 11) {
    keys.add('20' + digits.slice(1));
    keys.add('+20' + digits.slice(1));
    keys.add(digits.slice(1));
  }
  return Array.from(keys);
}

function handleAuthSubmit(e, mode) {
  e.preventDefault();
  const rawIdentifier = (document.getElementById('authEmail')?.value || '').trim();
  const password = document.getElementById('authPassword')?.value;
  const name = document.getElementById('authName')?.value.trim() || rawIdentifier.split('@')[0];
  const phone = document.getElementById('authPhone')?.value.trim() || '';
  const confirmPassword = document.getElementById('authConfirmPassword')?.value;
  const termsChecked = document.getElementById('authTerms')?.checked;
  const rememberMe = document.getElementById('authRememberMe')?.checked ?? true;

  if (mode === 'forgot-password') {
    const email = rawIdentifier.toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('يرجى إدخال بريد إلكتروني صحيح.', 'error');
      return;
    }
    const btn = document.getElementById('authSubmitBtn');
    const spinner = document.getElementById('authBtnSpinner');
    const btnText = document.getElementById('authBtnText');
    function setLoading(isLoading) {
      if (!btn) return;
      btn.disabled = isLoading;
      if (isLoading) {
        spinner?.classList.remove('hidden');
        btnText?.classList.add('invisible');
      } else {
        spinner?.classList.add('hidden');
        btnText?.classList.remove('invisible');
      }
    }
    setLoading(true);

    if (isFirebaseActive && auth) {
      auth.sendPasswordResetEmail(email)
        .then(() => {
          setLoading(false);
          const masked = email.replace(/(.{2})(.*)(?=@)/, '$1***');
          showToast(`تم إرسال رابط استعادة كلمة المرور إلى البريد: ${masked}`, 'success');
        })
        .catch(err => {
          setLoading(false);
          let msg = 'تعذر إرسال رابط استعادة كلمة المرور.';
          if (err.code === 'auth/user-not-found') msg = 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
          else if (err.code === 'auth/invalid-email') msg = 'صيغة البريد الإلكتروني غير صحيحة.';
          showToast(msg, 'error');
        });
    } else {
      setTimeout(() => {
        setLoading(false);
        showToast('تم إرسال رابط استعادة كلمة المرور بنجاح!', 'success');
      }, 500);
    }
    return;
  }

  if (!rawIdentifier || !password) return;

  if (mode === 'register') {
    if (password !== confirmPassword) {
      showToast('كلمة المرور وتأكيدها غير متطابقين.', 'error');
      return;
    }
    if (!termsChecked) {
      showToast('يرجى الموافقة على شروط وسياسة المنصة للمتابعة.', 'error');
      return;
    }
  }

  const btn = document.getElementById('authSubmitBtn');
  const spinner = document.getElementById('authBtnSpinner');
  const btnText = document.getElementById('authBtnText');
  function setLoading(isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      spinner?.classList.remove('hidden');
      btnText?.classList.add('invisible');
    } else {
      spinner?.classList.add('hidden');
      btnText?.classList.remove('invisible');
    }
  }

  setLoading(true);

  if (isFirebaseActive && auth) {
    if (mode === 'register') {
      auth.createUserWithEmailAndPassword(rawIdentifier, password)
        .then(cred => {
          cred.user.updateProfile({ displayName: name }).catch(console.error);
          const userObj = { uid: cred.user.uid, name, email: rawIdentifier, phone };
          Store.user = userObj;
          Store.saveUser();

          // Save customer profile and initial 0.00 wallet in Firestore
          if (db) {
            const customerData = {
              id: cred.user.uid,
              uid: cred.user.uid,
              name,
              email: rawIdentifier,
              phone: normalizePhone(phone) || phone,
              role: 'customer',
              termsAccepted: true,
              createdAt: new Date().toISOString()
            };

            db.collection('customers').doc(cred.user.uid).set(customerData).catch(console.error);
            db.collection('customer_wallets').doc(cred.user.uid).set({
              customerId: cred.user.uid,
              balance: 0.00,
              updatedAt: new Date().toISOString()
            }).catch(console.error);

            // Save phone lookup for phone-based login across all formats
            if (phone) {
              const keys = getPhoneLookupKeys(phone);
              keys.forEach(k => {
                db.collection('phone_lookup').doc(k).set({
                  email: rawIdentifier.toLowerCase(),
                  uid: cred.user.uid,
                  phone: normalizePhone(phone) || phone,
                  createdAt: new Date().toISOString()
                }).catch(console.error);
              });
            }
          }

          attachUserListeners(cred.user.uid);
          setLoading(false);
          showToast('تم إنشاء حسابك بنجاح في متجر Game Pay!', 'success');
          navigate('account');
        })
        .catch(err => {
          setLoading(false);
          let msg = err.message;
          if (err.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
          else if (err.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة. يرجى كتابة 8 أحرف على الأقل.';
          else if (err.code === 'auth/invalid-email') msg = 'صيغة البريد الإلكتروني غير صحيحة.';
          showToast(msg, 'error');
        });
    } else {
      // Login mode: handle Remember Me
      if (rememberMe) {
        localStorage.setItem('gp_remember_identifier', rawIdentifier);
        localStorage.setItem('gp_remember_me', 'true');
      } else {
        localStorage.removeItem('gp_remember_identifier');
        localStorage.setItem('gp_remember_me', 'false');
      }

      // Set persistence based on rememberMe
      if (firebase && firebase.auth && firebase.auth.Auth) {
        const persistence = rememberMe
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION;
        auth.setPersistence(persistence).catch(console.error);
      }

      // Check if identifier is email or phone number
      const isEmail = rawIdentifier.includes('@');

      const performLogin = (targetEmail) => {
        auth.signInWithEmailAndPassword(targetEmail, password)
          .then(cred => {
            const userObj = { uid: cred.user.uid, name: cred.user.displayName || targetEmail.split('@')[0], email: targetEmail };
            Store.user = userObj;
            Store.saveUser();
            attachUserListeners(cred.user.uid);

            // Auto-backfill phone_lookup if user has a phone number saved in profile
            if (db) {
              db.collection('customers').doc(cred.user.uid).get().then(cSnap => {
                if (cSnap.exists && cSnap.data() && cSnap.data().phone) {
                  const pKeys = getPhoneLookupKeys(cSnap.data().phone);
                  pKeys.forEach(pk => {
                    db.collection('phone_lookup').doc(pk).set({
                      email: targetEmail.toLowerCase(),
                      uid: cred.user.uid,
                      phone: cSnap.data().phone,
                      updatedAt: new Date().toISOString()
                    }).catch(console.error);
                  });
                }
              }).catch(console.error);
            }

            setLoading(false);
            showToast('أهلًا بك من جديد!', 'success');
            navigate('account');
          })
          .catch(err => {
            setLoading(false);
            let msg = err.message;
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
              msg = 'البريد الإلكتروني أو رقم الهاتف أو كلمة المرور غير صحيحة.';
            } else if (err.code === 'auth/too-many-requests') {
              msg = 'محاولات دخول كثيرة، يرجى الانتظار قليلاً ثم المحاولة ثانية.';
            }
            showToast(msg, 'error');
          });
      };

      if (isEmail) {
        performLogin(rawIdentifier.toLowerCase());
      } else {
        // Query phone_lookup with all normalized variants
        if (db) {
          const keys = getPhoneLookupKeys(rawIdentifier);
          Promise.all(keys.map(k => db.collection('phone_lookup').doc(k).get().catch(() => null)))
            .then(snapshots => {
              const matchedSnap = snapshots.find(snap => snap && snap.exists && snap.data() && snap.data().email);
              if (matchedSnap) {
                performLogin(matchedSnap.data().email);
              } else {
                setLoading(false);
                showToast('لا يوجد حساب مسجل برقم الهاتف هذا.', 'error');
              }
            })
            .catch(err => {
              console.error('Phone lookup error:', err);
              performLogin(rawIdentifier);
            });
        } else {
          performLogin(rawIdentifier);
        }
      }
    }
  } else {
    // Standalone fallback
    setTimeout(() => {
      Store.user = { uid: 'user-' + Date.now(), name, email: rawIdentifier, phone };
      Store.saveUser();
      setLoading(false);
      showToast(mode === 'register' ? 'تم إنشاء الحساب بنجاح!' : 'أهلًا بعودتك!', 'success');
      navigate('account');
    }, 500);
  }
}

// 10. ADMIN DASHBOARD VIEW
let adminTab = 'overview';
let adminAuthenticated = localStorage.getItem('gp_admin_auth') === 'true';
let adminSearchQuery = '';
let adminOrderFilter = 'all';
let adminProductFilterGame = 'all';
let adminProductFilterType = 'all';
let adminDensity = localStorage.getItem('gp_admin_density') || 'comfortable';
let adminProductModal = { isOpen: false, isEdit: false, product: null };
let adminDeliveryModal = { isOpen: false, orderRef: null, deliveryNote: '' };
let adminWalletAdjustModal = { isOpen: false, customerId: null, customerName: '', currentBalance: 0 };

function viewAdmin() {
  if (!adminAuthenticated) {
    return `
      <div dir="rtl" class="grid min-h-screen place-items-center bg-[#07111f] p-4 text-slate-100">
        <div class="w-full max-w-md rounded-[28px] border border-cyan-300/15 bg-[#0d1929] p-7 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none"></div>
          <div class="text-center">
            <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950 font-black shadow-[0_0_24px_rgba(34,211,238,.35)]">
              <i data-lucide="shield-check" class="h-6 w-6"></i>
            </div>
            <span class="eyebrow">إدارة Game Pay</span>
            <h1 class="mt-2 text-2xl font-black text-white">تسجيل دخول المسؤول</h1>
            <p class="mt-2 text-xs leading-6 text-slate-400">سجّل الدخول بحساب المسؤول السحابي أو باستخدام رمز المرور الرئيسي.</p>
          </div>

          <form onsubmit="handleAdminLogin(event)" class="mt-6 grid gap-4">
            <label class="field-label">البريد الإلكتروني للإدارة (اختياري)
              <div class="relative">
                <i data-lucide="mail" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                <input id="adminEmail" type="email" placeholder="admin@gamepay.com أو اتركه فارغاً" class="field-input pr-10" />
              </div>
            </label>

            <label class="field-label">رمز المرور أو كلمة مرور الإدارة
              <div class="relative">
                <i data-lucide="lock-keyhole" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                <input id="adminPass" required type="password" placeholder="الرمز الافتراضي: admin123" class="field-input pr-10" />
              </div>
            </label>

            <button id="adminLoginBtn" type="submit" class="btn-primary mt-2 py-3.5 relative flex items-center justify-center">
              <span id="adminLoginSpinner" class="hidden absolute inset-0 flex items-center justify-center bg-cyan-400 text-slate-950 font-bold rounded-xl gap-2">
                <svg class="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>جارٍ التحقق...</span>
              </span>
              <span>فتح لوحة التحكم</span>
            </button>

            <div class="rounded-xl border border-cyan-300/10 bg-cyan-300/[.03] p-3 text-center text-[11px] text-slate-400">
              رمز المرور السريع الافتراضي: <code class="text-cyan-300 font-bold">admin123</code>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  const confirmedSales = Store.orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const pendingOrdersCount = Store.orders.filter(o => o.fulfillmentStatus === 'pending').length;
  const pendingTopupsCount = Store.topupRequests.filter(r => r.status === 'pending').length;
  const customersCount = (Store.adminCustomers && Store.adminCustomers.length) || 0;

  // Filtered orders
  const filteredOrders = Store.orders.filter(o => {
    if (adminOrderFilter === 'paid' && o.paymentStatus !== 'paid') return false;
    if (adminOrderFilter === 'pending_payment' && o.paymentStatus !== 'pending') return false;
    if (adminOrderFilter === 'pending_fulfillment' && o.fulfillmentStatus !== 'pending') return false;
    if (adminOrderFilter === 'delivered' && o.fulfillmentStatus !== 'delivered') return false;
    if (adminSearchQuery) {
      const q = adminSearchQuery.toLowerCase();
      const ref = (o.reference || '').toLowerCase();
      const email = (o.customerEmail || '').toLowerCase();
      const name = (o.customerName || '').toLowerCase();
      const acc = (o.accountData || '').toLowerCase();
      return ref.includes(q) || email.includes(q) || name.includes(q) || acc.includes(q);
    }
    return true;
  });

  // Filtered products
  const filteredProducts = Store.products.filter(p => {
    if (adminProductFilterGame !== 'all' && p.gameSlug !== adminProductFilterGame) return false;
    if (adminProductFilterType !== 'all' && p.type !== adminProductFilterType) return false;
    if (adminSearchQuery) {
      const q = adminSearchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
    }
    return true;
  });

  return `
    <div dir="rtl" class="admin-page min-h-screen bg-[#07111f] text-slate-100 p-4 sm:p-6 lg:p-8 ${adminDensity === 'compact' ? 'admin-density-compact' : ''}">
      <!-- Header -->
      <header class="flex flex-col gap-4 border-b border-white/[.08] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="eyebrow">Game Pay · إدارة المتجر</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Firestore متصل (orders-abb76)
            </span>
          </div>
          <h1 class="mt-2 text-2xl font-black text-white">لوحة التحكم الإدارية</h1>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Density Toggle -->
          <button onclick="toggleAdminDensity()" class="btn-secondary text-xs" title="تبديل كثافة العرض">
            <i data-lucide="rows-3" class="h-4 w-4"></i>
            <span class="hidden sm:inline">${adminDensity === 'compact' ? 'عرض مريح' : 'عرض مكثف'}</span>
          </button>
          <!-- Sync to Firestore -->
          <button onclick="syncProductsToFirebase()" class="btn-secondary text-xs text-cyan-200">
            <i data-lucide="refresh-cw" class="h-3.5 w-3.5"></i>
            <span class="hidden sm:inline">مزامنة سحابية</span>
          </button>
          <!-- Preview Store -->
          <a href="#home" target="_blank" class="btn-secondary text-xs">
            <i data-lucide="external-link" class="h-3.5 w-3.5"></i>
            <span class="hidden sm:inline">معاينة المتجر</span>
          </a>
          <!-- Logout -->
          <button onclick="logoutAdmin()" class="btn-secondary text-xs text-rose-300 hover:border-rose-400/30">
            <i data-lucide="log-out" class="h-3.5 w-3.5"></i>
            <span>خروج</span>
          </button>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button onclick="adminTab = 'overview'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'overview' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="bar-chart-3" class="h-4 w-4"></i>نظرة عامة
        </button>
        <button onclick="adminTab = 'products'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'products' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="boxes" class="h-4 w-4"></i>المنتجات (${Store.products.length})
        </button>
        <button onclick="adminTab = 'orders'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'orders' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="package-check" class="h-4 w-4"></i>الطلبات (${Store.orders.length})
          ${pendingOrdersCount > 0 ? `<span class="grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 px-1">${pendingOrdersCount}</span>` : ''}
        </button>
        <button onclick="adminTab = 'wallet'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'wallet' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="wallet-cards" class="h-4 w-4"></i>شحن المحافظ
          ${pendingTopupsCount > 0 ? `<span class="grid h-4 min-w-4 place-items-center rounded-full bg-rose-400 text-[10px] font-black text-white px-1 animate-pulse">${pendingTopupsCount}</span>` : ''}
        </button>
        <button onclick="adminTab = 'customers'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'customers' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="users" class="h-4 w-4"></i>العملاء (${customersCount})
        </button>
        <button onclick="adminTab = 'coupons'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'coupons' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="tags" class="h-4 w-4"></i>الكوبونات (${Store.coupons.length})
        </button>
        <button onclick="adminTab = 'settings'; renderCurrentRoute();" class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${adminTab === 'settings' ? 'bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,.3)]' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">
          <i data-lucide="settings" class="h-4 w-4"></i>إعدادات المتجر
        </button>
      </nav>

      <!-- TAB CONTENT -->
      <main class="py-6">
        <!-- 1. OVERVIEW TAB -->
        ${adminTab === 'overview' ? `
          <!-- KPI Cards -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">المبيعات المؤكدة</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><i data-lucide="bar-chart-3" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black text-white">${formatPrice(confirmedSales)}</strong>
              <span class="mt-1 block text-[11px] text-emerald-400">طلبات مدفوعة</span>
            </article>

            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">إجمالي الطلبات</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><i data-lucide="package-check" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black text-white">${Store.orders.length}</strong>
              <span class="mt-1 block text-[11px] text-slate-400">${pendingOrdersCount} بانتظار التسليم</span>
            </article>

            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">طلبات شحن المحافظ</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl ${pendingTopupsCount > 0 ? 'bg-rose-400/20 text-rose-300 animate-pulse' : 'bg-cyan-400/10 text-cyan-300'}"><i data-lucide="wallet-cards" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black ${pendingTopupsCount > 0 ? 'text-rose-300' : 'text-white'}">${pendingTopupsCount}</strong>
              <span class="mt-1 block text-[11px] text-slate-400">بانتظار المراجعة والاعتماد</span>
            </article>

            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">العملاء المسجلين</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><i data-lucide="users" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black text-white">${customersCount}</strong>
              <span class="mt-1 block text-[11px] text-slate-400">حسابات Firestore</span>
            </article>

            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">المنتجات النشطة</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><i data-lucide="boxes" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black text-white">${Store.products.length}</strong>
              <span class="mt-1 block text-[11px] text-slate-400">${Store.games.length} ألعاب مدعومة</span>
            </article>

            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-bold">الكوبونات النشطة</span>
                <span class="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><i data-lucide="tags" class="h-4 w-4"></i></span>
              </div>
              <strong class="mt-3 block text-xl font-black text-white">${Store.coupons.filter(c => c.isActive !== false).length}</strong>
              <span class="mt-1 block text-[11px] text-slate-400">كوبونات ترويجية</span>
            </article>
          </div>

          <!-- Quick Action Bar -->
          <div class="mt-6 flex flex-wrap gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.03] p-4 items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300">
                <i data-lucide="sparkles" class="h-5 w-5"></i>
              </div>
              <div>
                <strong class="text-sm text-white">إجراءات سريعة للإدارة</strong>
                <p class="text-xs text-slate-400">إضافة وتعديل المنتجات، اعتماد الشحنات، وإدارة محتوى المتجر فورياً</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="openProductModal()" class="btn-primary text-xs">
                <i data-lucide="plus" class="h-3.5 w-3.5"></i>إضافة منتج جديد
              </button>
              <button onclick="adminTab = 'wallet'; renderCurrentRoute();" class="btn-secondary text-xs">
                <i data-lucide="wallet-cards" class="h-3.5 w-3.5"></i>مراجعة الشحنات (${pendingTopupsCount})
              </button>
              <button onclick="adminTab = 'coupons'; renderCurrentRoute();" class="btn-secondary text-xs">
                <i data-lucide="tags" class="h-3.5 w-3.5"></i>إنشاء كود خصم
              </button>
            </div>
          </div>

          <!-- Recent Orders & Topups Grid -->
          <div class="mt-6 grid gap-6 lg:grid-cols-2">
            <!-- Recent Orders -->
            <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
              <div class="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
                <div class="flex items-center gap-2">
                  <i data-lucide="package-check" class="h-4 w-4 text-cyan-300"></i>
                  <strong class="text-sm text-white">أحدث الطلبات</strong>
                </div>
                <button onclick="adminTab = 'orders'; renderCurrentRoute();" class="text-xs text-cyan-300 hover:underline">عرض الكل</button>
              </div>
              <div class="divide-y divide-white/[.06]">
                ${Store.orders.length ? Store.orders.slice(0, 5).map(o => `
                  <div class="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-white/[.02] transition">
                    <div>
                      <div class="flex items-center gap-2">
                        <strong class="text-xs text-white font-mono">${o.reference}</strong>
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${o.paymentStatus === 'paid' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}">${paymentLabels[o.paymentStatus] || o.paymentStatus}</span>
                      </div>
                      <p class="mt-1 text-xs text-slate-400">${o.customerName || 'عميل'} · ${o.customerEmail}</p>
                    </div>
                    <div class="text-left">
                      <strong class="text-sm text-cyan-200">${formatPrice(o.total)}</strong>
                      <span class="block text-[10px] text-slate-500">${new Date(o.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                `).join('') : '<p class="p-6 text-center text-xs text-slate-500">لا توجد طلبات واردة حتى الآن.</p>'}
              </div>
            </div>

            <!-- Recent Top-up Requests -->
            <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
              <div class="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
                <div class="flex items-center gap-2">
                  <i data-lucide="wallet-cards" class="h-4 w-4 text-cyan-300"></i>
                  <strong class="text-sm text-white">طلبات شحن المحفظة</strong>
                </div>
                <button onclick="adminTab = 'wallet'; renderCurrentRoute();" class="text-xs text-cyan-300 hover:underline">عرض الكل</button>
              </div>
              <div class="divide-y divide-white/[.06]">
                ${Store.topupRequests.length ? Store.topupRequests.slice(0, 5).map(r => `
                  <div class="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-white/[.02] transition">
                    <div>
                      <strong class="text-xs text-white">${r.method}</strong>
                      <p class="mt-1 text-xs text-slate-400">${r.reference ? 'المرجع: ' + r.reference : 'تحويل مباشر'} · ${new Date(r.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <strong class="text-sm text-cyan-200">${formatPrice(r.amount)}</strong>
                      ${r.status === 'pending' ? `
                        <button onclick="approveTopup(${r.id})" class="btn-primary text-[11px] py-1 px-2.5">اعتماد</button>
                      ` : `
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${r.status === 'approved' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}">${r.status === 'approved' ? 'معتمد' : 'مرفوض'}</span>
                      `}
                    </div>
                  </div>
                `).join('') : '<p class="p-6 text-center text-xs text-slate-500">لا توجد طلبات شحن حالياً.</p>'}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. PRODUCTS TAB -->
        ${adminTab === 'products' ? `
          <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <!-- Products Toolbar -->
            <div class="flex flex-col gap-4 border-b border-white/[.07] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-bold text-white text-base">إدارة المنتجات والباقات (${filteredProducts.length})</h2>
                <p class="mt-1 text-xs text-slate-400">إضافة باقات جديدة، تحديث الأسعار والمخزون، والمزامنة السحابية الفورية.</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="openProductModal()" class="btn-primary text-xs">
                  <i data-lucide="plus" class="h-3.5 w-3.5"></i>إضافة منتج جديد
                </button>
              </div>
            </div>

            <!-- Filters Bar -->
            <div class="grid gap-3 border-b border-white/[.06] p-4 sm:grid-cols-3">
              <div>
                <input type="text" placeholder="بحث بالاسم أو slug..." value="${adminSearchQuery}" oninput="adminSearchQuery = this.value; renderCurrentRoute();" class="field-input text-xs" />
              </div>
              <div>
                <select onchange="adminProductFilterGame = this.value; renderCurrentRoute();" class="field-select text-xs">
                  <option value="all" ${adminProductFilterGame === 'all' ? 'selected' : ''}>كل الألعاب</option>
                  ${Store.games.map(g => `<option value="${g.slug}" ${adminProductFilterGame === g.slug ? 'selected' : ''}>${g.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <select onchange="adminProductFilterType = this.value; renderCurrentRoute();" class="field-select text-xs">
                  <option value="all" ${adminProductFilterType === 'all' ? 'selected' : ''}>كل الأنواع</option>
                  <option value="topup" ${adminProductFilterType === 'topup' ? 'selected' : ''}>شحن فوري (Topup)</option>
                  <option value="digital" ${adminProductFilterType === 'digital' ? 'selected' : ''}>بطاقة رقمية (Digital)</option>
                  <option value="account" ${adminProductFilterType === 'account' ? 'selected' : ''}>حساب لعبة (Account)</option>
                </select>
              </div>
            </div>

            <!-- Products List -->
            <div class="divide-y divide-white/[.06]">
              ${filteredProducts.length ? filteredProducts.map(p => `
                <article class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[.02] transition">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" class="h-full w-full object-cover" />` : `<i data-lucide="gamepad-2" class="h-5 w-5 text-cyan-300"></i>`}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <strong class="text-sm text-white truncate">${p.name}</strong>
                        <span class="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">${gameLabels[p.gameSlug] || p.gameSlug}</span>
                        <span class="rounded-md bg-white/[.05] px-2 py-0.5 text-[10px] text-slate-400">${typeLabels[p.type] || p.type}</span>
                        ${p.discountPercent > 0 ? `<span class="rounded-md bg-amber-400/20 text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">خصم ${p.discountPercent}%</span>` : ''}
                      </div>
                      <p class="mt-1 text-xs text-slate-400">${p.deliveryEta || 'تسليم رقمي'} · المخزون: ${p.stock ?? 50} · slug: <code class="text-slate-500">${p.slug}</code></p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                    <div class="text-left">
                      <strong class="text-sm text-white">${formatPrice(p.price)}</strong>
                      ${p.compareAtPrice ? `<span class="block text-[11px] text-slate-500 line-through">${formatPrice(p.compareAtPrice)}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                      <button onclick="openProductModal(${p.id})" class="btn-secondary text-xs" title="تعديل تفاصيل المنتج">
                        <i data-lucide="edit-3" class="h-3.5 w-3.5"></i>تعديل
                      </button>
                      <button onclick="deleteProduct(${p.id})" class="rounded-xl border border-rose-400/25 px-2.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-400/10" title="حذف المنتج">
                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                      </button>
                    </div>
                  </div>
                </article>
              `).join('') : '<p class="p-8 text-center text-sm text-slate-500">لا توجد منتجات مطابقة للبحث.</p>'}
            </div>
          </div>
        ` : ''}

        <!-- 3. ORDERS TAB -->
        ${adminTab === 'orders' ? `
          <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <!-- Toolbar -->
            <div class="flex flex-col gap-4 border-b border-white/[.07] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-bold text-white text-base">إدارة جميع الطلبات (${filteredOrders.length})</h2>
                <p class="mt-1 text-xs text-slate-400">تحديث حالات الدفع والتسليم، إرسال أكواد الشحن للعملاء، ومتابعة التنفيذ.</p>
              </div>
            </div>

            <!-- Filters Bar -->
            <div class="grid gap-3 border-b border-white/[.06] p-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <input type="text" placeholder="بحث بالمرجع، البريد، أو ID اللاعب..." value="${adminSearchQuery}" oninput="adminSearchQuery = this.value; renderCurrentRoute();" class="field-input text-xs" />
              </div>
              <div>
                <select onchange="adminOrderFilter = this.value; renderCurrentRoute();" class="field-select text-xs">
                  <option value="all" ${adminOrderFilter === 'all' ? 'selected' : ''}>كل الطلبات</option>
                  <option value="paid" ${adminOrderFilter === 'paid' ? 'selected' : ''}>الطلبات المدفوعة</option>
                  <option value="pending_payment" ${adminOrderFilter === 'pending_payment' ? 'selected' : ''}>بانتظار الدفع</option>
                  <option value="pending_fulfillment" ${adminOrderFilter === 'pending_fulfillment' ? 'selected' : ''}>بانتظار التسليم</option>
                  <option value="delivered" ${adminOrderFilter === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                </select>
              </div>
            </div>

            <!-- Orders List -->
            <div class="divide-y divide-white/[.06]">
              ${filteredOrders.length ? filteredOrders.map(order => `
                <article class="p-5 hover:bg-white/[.02] transition">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <!-- Left: Reference & Customer info -->
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-3 flex-wrap">
                        <strong class="text-sm text-cyan-200 font-mono">${order.reference}</strong>
                        <button onclick="navigator.clipboard?.writeText('${order.reference}'); showToast('تم نسخ رقم المرجع');" class="text-xs text-slate-500 hover:text-white" title="نسخ المرجع">
                          <i data-lucide="copy" class="h-3.5 w-3.5"></i>
                        </button>
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${order.paymentStatus === 'paid' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}">
                          ${paymentLabels[order.paymentStatus] || order.paymentStatus}
                        </span>
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${order.fulfillmentStatus === 'delivered' ? 'bg-cyan-400/10 text-cyan-300' : 'bg-white/[.05] text-slate-300'}">
                          ${fulfillmentLabels[order.fulfillmentStatus] || order.fulfillmentStatus}
                        </span>
                      </div>

                      <div class="mt-2 text-xs text-slate-300 space-y-1">
                        <p><strong class="text-white">${order.customerName || 'عميل'}</strong> · ${order.customerEmail} ${order.customerPhone ? '· ' + order.customerPhone : ''}</p>
                        ${order.accountData ? `
                          <div class="mt-2 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 text-xs text-cyan-200">
                            <i data-lucide="gamepad-2" class="h-3.5 w-3.5"></i>
                            <span>بيانات الحساب: <strong>${order.accountData}</strong></span>
                            <button onclick="navigator.clipboard?.writeText('${order.accountData}'); showToast('تم نسخ بيانات الحساب');" class="text-xs text-slate-400 hover:text-white" title="نسخ">
                              <i data-lucide="copy" class="h-3 w-3"></i>
                            </button>
                          </div>
                        ` : ''}
                        ${order.deliveryData ? `
                          <div class="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2 text-xs text-emerald-200">
                            <strong>بيانات التسليم المسجلة:</strong> ${order.deliveryData}
                          </div>
                        ` : ''}
                      </div>

                      <div class="mt-3 text-xs text-slate-400">
                        المنتجات: ${(order.items || []).map(i => `${i.product?.name || 'منتج'} (x${i.quantity || 1})`).join('، ') || 'منتجات المتجر'}
                      </div>
                    </div>

                    <!-- Right: Pricing, Status Selectors & Actions -->
                    <div class="flex flex-col gap-3 lg:items-end shrink-0">
                      <div class="text-right">
                        <strong class="text-base text-white">${formatPrice(order.total)}</strong>
                        <span class="block text-[11px] text-slate-500">${new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                      </div>

                      <div class="flex flex-wrap items-center gap-2">
                        <!-- Payment Status Select -->
                        <select onchange="updateOrderStatus('${order.reference}', 'paymentStatus', this.value)" class="field-select text-xs py-1.5 w-auto">
                          <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>بانتظار الدفع</option>
                          <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>مدفوع</option>
                          <option value="failed" ${order.paymentStatus === 'failed' ? 'selected' : ''}>فشل</option>
                          <option value="refunded" ${order.paymentStatus === 'refunded' ? 'selected' : ''}>مسترد</option>
                        </select>

                        <!-- Fulfillment Status Select -->
                        <select onchange="updateOrderStatus('${order.reference}', 'fulfillmentStatus', this.value)" class="field-select text-xs py-1.5 w-auto">
                          <option value="pending" ${order.fulfillmentStatus === 'pending' ? 'selected' : ''}>بانتظار التسليم</option>
                          <option value="processing" ${order.fulfillmentStatus === 'processing' ? 'selected' : ''}>قيد التنفيذ</option>
                          <option value="delivered" ${order.fulfillmentStatus === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                          <option value="cancelled" ${order.fulfillmentStatus === 'cancelled' ? 'selected' : ''}>ملغي</option>
                        </select>

                        <!-- Add Delivery Details Button -->
                        <button onclick="openDeliveryModal('${order.reference}')" class="btn-secondary text-xs py-1.5" title="إرسال كود التسليم أو بيانات الحساب للعميل">
                          <i data-lucide="send" class="h-3.5 w-3.5"></i>تسليم كود
                        </button>

                        <!-- Delete Order -->
                        <button onclick="deleteOrder('${order.reference}')" class="rounded-xl border border-rose-400/20 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10" title="حذف الطلب">
                          <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              `).join('') : '<p class="p-8 text-center text-sm text-slate-500">لا توجد طلبات تطابق الفلتر الحالي.</p>'}
            </div>
          </div>
        ` : ''}

        <!-- 4. WALLET TAB -->
        ${adminTab === 'wallet' ? `
          <div class="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
            <!-- Requests List -->
            <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
              <div class="flex items-center justify-between border-b border-white/[.07] p-5">
                <div>
                  <h2 class="font-bold text-white text-base">طلبات شحن المحافظ (${Store.topupRequests.length})</h2>
                  <p class="mt-1 text-xs text-slate-400">راجع إيصالات وتحويلات العملاء واعتمد إضافة الرصيد لمحفظتهم فوراً.</p>
                </div>
              </div>

              <div class="divide-y divide-white/[.06]">
                ${Store.topupRequests.length ? Store.topupRequests.map(r => `
                  <article class="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/[.02] transition">
                    <div>
                      <div class="flex items-center gap-2">
                        <strong class="text-sm text-white">${r.method}</strong>
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${r.status === 'pending' ? 'bg-amber-400/20 text-amber-300 animate-pulse' : r.status === 'approved' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}">
                          ${r.status === 'pending' ? 'بانتظار الاعتماد' : r.status === 'approved' ? 'معتمد' : 'مرفوض'}
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-400">المرجع/الرقم: <strong class="text-white">${r.reference || 'تحويل مباشر'}</strong> · ${new Date(r.createdAt).toLocaleString('ar-EG')}</p>
                      <strong class="mt-2 block text-sm text-cyan-200">${formatPrice(r.amount)}</strong>
                    </div>

                    <div class="flex items-center gap-2">
                      ${r.status === 'pending' ? `
                        <button onclick="approveTopup(${r.id})" class="btn-primary text-xs py-2">
                          <i data-lucide="check-circle-2" class="h-3.5 w-3.5"></i>اعتماد وإضافة الرصيد
                        </button>
                        <button onclick="rejectTopup(${r.id})" class="rounded-xl border border-rose-400/25 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-400/10">
                          رفض
                        </button>
                      ` : `
                        <span class="text-xs text-slate-500">${r.status === 'approved' ? 'تمت إضافة الرصيد للمحفظة' : 'تم رفض الطلب'}</span>
                      `}
                    </div>
                  </article>
                `).join('') : '<p class="p-8 text-center text-sm text-slate-500">لا توجد طلبات شحن محافظ حالياً.</p>'}
              </div>
            </div>

            <!-- Topup Methods Info / Settings -->
            <div class="rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-5 h-fit space-y-4">
              <div class="flex items-center gap-2">
                <i data-lucide="wallet-cards" class="h-5 w-5 text-cyan-300"></i>
                <h3 class="font-bold text-white text-sm">بيانات وسائل الدفع المعروضة للعميل</h3>
              </div>
              <p class="text-xs text-slate-400 leading-6">هذه البيانات تظهر للعملاء في نافذة شحن الرصيد عند اختيار فودافون كاش أو إنستاباي.</p>

              <form onsubmit="saveStoreSettings(event)" class="grid gap-3 pt-2">
                <label class="field-label">رقم محفظة فودافون كاش
                  <input id="settingVodafone" value="${Store.homepage?.paymentMethods?.vodafone || '01012345678'}" class="field-input text-xs" />
                </label>
                <label class="field-label">معرف إنستاباي (InstaPay Handle)
                  <input id="settingInstapay" value="${Store.homepage?.paymentMethods?.instapay || 'gamepay@instapay'}" class="field-input text-xs" />
                </label>
                <button type="submit" class="btn-primary text-xs py-2.5 mt-2">
                  <i data-lucide="save" class="h-3.5 w-3.5"></i>تحديث بيانات الدفع
                </button>
              </form>
            </div>
          </div>
        ` : ''}

        <!-- 5. CUSTOMERS TAB -->
        ${adminTab === 'customers' ? `
          <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <div class="flex flex-col gap-4 border-b border-white/[.07] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-bold text-white text-base">قائمة العملاء ومحافظهم (${customersCount})</h2>
                <p class="mt-1 text-xs text-slate-400">استعراض بيانات العملاء المسجلين في Firestore، والتحكم بأرصدة محافظهم يدوياً.</p>
              </div>
              <input type="text" placeholder="بحث بالاسم، البريد، أو الهاتف..." value="${adminSearchQuery}" oninput="adminSearchQuery = this.value; renderCurrentRoute();" class="field-input text-xs sm:max-w-xs" />
            </div>

            <div class="divide-y divide-white/[.06]">
              ${Store.adminCustomers && Store.adminCustomers.length ? Store.adminCustomers.filter(c => {
                if (!adminSearchQuery) return true;
                const q = adminSearchQuery.toLowerCase();
                return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
              }).map(c => `
                <article class="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/[.02] transition">
                  <div class="flex items-center gap-3">
                    <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300 font-bold text-sm">
                      ${(c.name || c.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong class="text-sm text-white">${c.name || 'عميل'}</strong>
                      <p class="mt-0.5 text-xs text-slate-400">${c.email} ${c.phone ? '· ' + c.phone : ''}</p>
                      <span class="text-[11px] text-slate-500">UID: <code class="text-slate-500">${c.uid || c.id || 'N/A'}</code></span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 justify-between sm:justify-end">
                    <div class="text-left">
                      <span class="block text-[11px] text-slate-500">الرصيد</span>
                      <strong class="text-sm text-cyan-200">${formatPrice(c.balance || 0)}</strong>
                    </div>
                    <button onclick="openWalletAdjustModal('${c.uid || c.id}', '${c.name || c.email}', ${c.balance || 0})" class="btn-secondary text-xs">
                      <i data-lucide="wallet" class="h-3.5 w-3.5"></i>إدارة الرصيد
                    </button>
                  </div>
                </article>
              `).join('') : '<p class="p-8 text-center text-sm text-slate-500">لا يوجد عملاء مسجلين حتى الآن، أو جارٍ تحميلهم من Firestore.</p>'}
            </div>
          </div>
        ` : ''}

        <!-- 6. COUPONS TAB -->
        ${adminTab === 'coupons' ? `
          <div class="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
            <!-- Create Coupon Form -->
            <section class="rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-5 h-fit">
              <div class="flex items-center gap-2">
                <i data-lucide="tags" class="h-5 w-5 text-cyan-300"></i>
                <h3 class="font-bold text-white text-base">إنشاء كوبون خصم جديد</h3>
              </div>
              <p class="mt-1 text-xs text-slate-400">أنشئ أكواد خصم ترويجية للعملاء وسيتم تفعيلها فوراً في صفحة الدفع (Checkout).</p>

              <form onsubmit="handleCreateCoupon(event)" class="mt-5 grid gap-3">
                <label class="field-label">كود الكوبون
                  <input id="newCouponCode" required placeholder="مثال: GAME20" class="field-input uppercase font-mono font-bold" />
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="field-label">نوع الخصم
                    <select id="newCouponType" class="field-select">
                      <option value="percent">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (EGP)</option>
                    </select>
                  </label>
                  <label class="field-label">قيمة الخصم
                    <input id="newCouponValue" required type="number" min="1" placeholder="مثال: 15" class="field-input" />
                  </label>
                </div>
                <label class="field-label">الحد الأقصى لمرات الاستخدام (اختياري)
                  <input id="newCouponMaxUses" type="number" min="1" placeholder="مثال: 100 أو اتركه فارغاً" class="field-input" />
                </label>
                <button type="submit" class="btn-primary mt-2 py-3">
                  <i data-lucide="plus" class="h-4 w-4"></i>حفظ ونشر الكوبون
                </button>
              </form>
            </section>

            <!-- Coupons List -->
            <section class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
              <div class="border-b border-white/[.07] p-5 font-bold text-white text-base">الكوبونات الحالية (${Store.coupons.length})</div>
              <div class="divide-y divide-white/[.06]">
                ${Store.coupons.length ? Store.coupons.map(coupon => `
                  <article class="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[.02] transition">
                    <div>
                      <div class="flex items-center gap-2">
                        <strong class="font-mono text-sm text-cyan-300 font-bold tracking-wider">${coupon.code}</strong>
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${coupon.isActive !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}">
                          ${coupon.isActive !== false ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-400">
                        الخصم: ${coupon.discountType === 'percent' ? coupon.value + '%' : formatPrice(coupon.value)}
                        ${coupon.maxUses ? ` · الحد: ${coupon.maxUses}` : ''}
                      </p>
                    </div>

                    <div class="flex items-center gap-2">
                      <button onclick="toggleCouponStatus('${coupon.code}')" class="btn-secondary text-xs">
                        ${coupon.isActive !== false ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button onclick="deleteCoupon('${coupon.code}')" class="rounded-xl border border-rose-400/25 px-2.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-400/10">
                        حذف
                      </button>
                    </div>
                  </article>
                `).join('') : '<p class="p-8 text-center text-sm text-slate-500">لا توجد كوبونات مضافة بعد.</p>'}
              </div>
            </section>
          </div>
        ` : ''}

        <!-- 7. SETTINGS & CMS TAB -->
        ${adminTab === 'settings' ? `
          <div class="max-w-4xl space-y-6">
            <!-- Hero CMS -->
            <section class="rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-6">
              <div class="flex items-center gap-2 border-b border-white/[.08] pb-4">
                <i data-lucide="layout-template" class="h-5 w-5 text-cyan-300"></i>
                <h3 class="font-bold text-white text-base">محرر الواجهة الرئيسية (Hero Section)</h3>
              </div>
              <form onsubmit="saveStoreSettings(event)" class="mt-5 grid gap-4 lg:grid-cols-2">
                <label class="field-label">السطر التعريفي (Eyebrow)
                  <input id="editHeroEyebrow" value="${Store.homepage?.hero?.eyebrow || 'المتجر الأول للألعاب الرقمية'}" class="field-input" />
                </label>
                <label class="field-label">العنوان الرئيسي
                  <input id="editHeroTitle" value="${Store.homepage?.hero?.title || 'أسرع شحن رقمي لحساباتك'}" class="field-input" />
                </label>
                <label class="field-label">الكلمة المضيئة (Accent)
                  <input id="editHeroAccent" value="${Store.homepage?.hero?.accent || 'بأفضل الأسعار'}" class="field-input" />
                </label>
                <label class="field-label">زر الشراء الرئيسي
                  <input id="editHeroPrimaryLabel" value="${Store.homepage?.hero?.primaryLabel || 'تصفح العروض'}" class="field-input" />
                </label>
                <label class="field-label lg:col-span-2">الوصف
                  <textarea id="editHeroDesc" class="field-input min-h-24">${Store.homepage?.hero?.description || 'شحن فوري، حسابات مميزة، وأمان كامل مع تسليم رسمي بأفضل سعر.'}</textarea>
                </label>
                <div class="lg:col-span-2 flex justify-end">
                  <button type="submit" class="btn-primary">
                    <i data-lucide="save" class="h-4 w-4"></i>حفظ ونشر التعديلات سحابياً
                  </button>
                </div>
              </form>
            </section>

            <!-- Store Contact Info -->
            <section class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-6">
              <div class="flex items-center gap-2 border-b border-white/[.08] pb-4">
                <i data-lucide="message-circle" class="h-5 w-5 text-cyan-300"></i>
                <h3 class="font-bold text-white text-base">بيانات الدعم والتواصل الرسمي</h3>
              </div>
              <form onsubmit="saveStoreSettings(event)" class="mt-5 grid gap-4 lg:grid-cols-2">
                <label class="field-label">رقم واتساب الدعم الفني
                  <input id="settingWhatsapp" value="${Store.homepage?.contacts?.whatsapp || '01012345678'}" placeholder="010xxxxxxxxx" class="field-input" />
                </label>
                <label class="field-label">رابط قناة أو حساب تيليجرام
                  <input id="settingTelegram" value="${Store.homepage?.contacts?.telegram || 'https://t.me/gamepay'}" class="field-input" />
                </label>
                <label class="field-label lg:col-span-2">شريط الإعلانات أعلى المتجر (Banner)
                  <input id="settingBanner" value="${Store.homepage?.bannerText || 'خصومات حصرية على جميع باقات eFootball و PUBG لفترة محدودة!'}" class="field-input" />
                </label>
                <div class="lg:col-span-2 flex justify-end">
                  <button type="submit" class="btn-primary">
                    <i data-lucide="save" class="h-4 w-4"></i>حفظ بيانات الدعم
                  </button>
                </div>
              </form>
            </section>
          </div>
        ` : ''}
      </main>

      <!-- ================= MODALS ================= -->

      <!-- 1. ADD / EDIT PRODUCT MODAL -->
      ${adminProductModal.isOpen ? `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-300/20 bg-[#0b1728] p-6 sm:p-8 shadow-2xl text-slate-100">
            <div class="flex items-center justify-between border-b border-white/[.08] pb-4">
              <h3 class="font-black text-xl text-white">${adminProductModal.isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button onclick="closeProductModal()" class="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/[.05]">✕</button>
            </div>

            <form onsubmit="handleSaveProductModal(event)" class="mt-6 grid gap-4 sm:grid-cols-2">
              <label class="field-label sm:col-span-2">اسم المنتج
                <input id="prodModalName" required value="${adminProductModal.product?.name || ''}" placeholder="مثال: باقة 550 كوين eFootball" class="field-input" />
              </label>

              <label class="field-label">معرف الرابط (Slug)
                <input id="prodModalSlug" value="${adminProductModal.product?.slug || ''}" placeholder="يترك فارغاً للتوليد التلقائي" class="field-input font-mono" />
              </label>

              <label class="field-label">اللعبة
                <select id="prodModalGame" class="field-select">
                  ${Store.games.map(g => `<option value="${g.slug}" ${adminProductModal.product?.gameSlug === g.slug ? 'selected' : ''}>${g.name}</option>`).join('')}
                </select>
              </label>

              <label class="field-label">نوع المنتج
                <select id="prodModalType" class="field-select">
                  <option value="topup" ${adminProductModal.product?.type === 'topup' ? 'selected' : ''}>شحن فوري (Topup)</option>
                  <option value="digital" ${adminProductModal.product?.type === 'digital' ? 'selected' : ''}>منتج رقمي (Digital)</option>
                  <option value="account" ${adminProductModal.product?.type === 'account' ? 'selected' : ''}>حساب لعبة (Account)</option>
                </select>
              </label>

              <label class="field-label">السعر (EGP)
                <input id="prodModalPrice" required type="number" min="1" value="${adminProductModal.product?.price || 50}" class="field-input" />
              </label>

              <label class="field-label">سعر المقارنة قبل الخصم (اختياري)
                <input id="prodModalComparePrice" type="number" min="0" value="${adminProductModal.product?.compareAtPrice || ''}" placeholder="مثال: 75" class="field-input" />
              </label>

              <label class="field-label">نسبة الخصم (%)
                <input id="prodModalDiscount" type="number" min="0" max="100" value="${adminProductModal.product?.discountPercent || 0}" class="field-input" />
              </label>

              <label class="field-label">المخزون
                <input id="prodModalStock" type="number" min="0" value="${adminProductModal.product?.stock ?? 100}" class="field-input" />
              </label>

              <label class="field-label">مدة التسليم
                <input id="prodModalEta" value="${adminProductModal.product?.deliveryEta || 'خلال 5–20 دقيقة'}" class="field-input" />
              </label>

              <label class="field-label sm:col-span-2">رابط صورة المنتج
                <input id="prodModalImage" value="${adminProductModal.product?.imageUrl || ''}" placeholder="https://..." class="field-input font-mono text-xs" />
              </label>

              <label class="field-label sm:col-span-2">الوصف ومزايا الباقة
                <textarea id="prodModalDesc" class="field-input min-h-20">${adminProductModal.product?.description || 'شحن فوري وباقة مميزة بأفضل سعر.'}</textarea>
              </label>

              <label class="field-label sm:col-span-2">بيانات التسليم الحساسة أو أكواد الشحن المسبقة (تظهر للعميل بعد الشراء)
                <textarea id="prodModalSensitive" class="field-input min-h-20" placeholder="أكواد رقمية، بيانات حساب جاهز، أو تعليمات سرية...">${adminProductModal.product?.sensitiveDelivery || ''}</textarea>
              </label>

              <div class="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input id="prodModalFeatured" type="checkbox" ${adminProductModal.product?.featured ? 'checked' : ''} class="rounded border-white/20 bg-white/5 text-cyan-400" />
                  <span>منتج مميز (Featured)</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input id="prodModalPopular" type="checkbox" ${adminProductModal.product?.popular ? 'checked' : ''} class="rounded border-white/20 bg-white/5 text-cyan-400" />
                  <span>شائع (Popular)</span>
                </label>
              </div>

              <div class="sm:col-span-2 mt-4 flex gap-3 justify-end border-t border-white/[.08] pt-4">
                <button type="button" onclick="closeProductModal()" class="btn-secondary">إلغاء</button>
                <button type="submit" class="btn-primary">
                  <i data-lucide="save" class="h-4 w-4"></i>حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- 2. ORDER DELIVERY / NOTE MODAL -->
      ${adminDeliveryModal.isOpen ? `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-[#0b1728] p-6 sm:p-8 shadow-2xl text-slate-100">
            <div class="flex items-center justify-between border-b border-white/[.08] pb-4">
              <h3 class="font-black text-lg text-white">إرسال كود التسليم للطلب ${adminDeliveryModal.orderRef}</h3>
              <button onclick="adminDeliveryModal.isOpen = false; renderCurrentRoute();" class="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/[.05]">✕</button>
            </div>
            <form onsubmit="handleSaveDeliveryData(event)" class="mt-5 grid gap-4">
              <label class="field-label">أكواد الشحن أو بيانات الحساب المسلم
                <textarea id="deliveryDataInput" required class="field-input min-h-28" placeholder="اكتب كود البطاقة الرقمية، بيانات تسجيل الدخول، أو ملاحظة التسليم للعميل...">${adminDeliveryModal.deliveryNote || ''}</textarea>
              </label>
              <p class="text-xs text-slate-400">ستظهر هذه البيانات فوراً في حساب العميل تحت تفاصيل هذا الطلب وسيتغير حالة الطلب إلى «تم التسليم».</p>
              <div class="flex gap-3 justify-end pt-2">
                <button type="button" onclick="adminDeliveryModal.isOpen = false; renderCurrentRoute();" class="btn-secondary">إلغاء</button>
                <button type="submit" class="btn-primary">
                  <i data-lucide="send" class="h-4 w-4"></i>اعتماد وإرسال للعميل
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- 3. CUSTOMER WALLET ADJUST MODAL -->
      ${adminWalletAdjustModal.isOpen ? `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-[#0b1728] p-6 sm:p-8 shadow-2xl text-slate-100">
            <div class="flex items-center justify-between border-b border-white/[.08] pb-4">
              <div>
                <h3 class="font-black text-lg text-white">إدارة محفظة العميل</h3>
                <span class="text-xs text-slate-400">${adminWalletAdjustModal.customerName}</span>
              </div>
              <button onclick="adminWalletAdjustModal.isOpen = false; renderCurrentRoute();" class="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/[.05]">✕</button>
            </div>
            <div class="my-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-center">
              <span class="text-xs text-slate-400">الرصيد الحالي</span>
              <strong class="block text-xl text-cyan-200">${formatPrice(adminWalletAdjustModal.currentBalance)}</strong>
            </div>
            <form onsubmit="handleSaveWalletAdjustment(event)" class="grid gap-4">
              <label class="field-label">نوع العملية
                <select id="walletAdjustType" class="field-select">
                  <option value="credit">إيداع رصيد (+) للعميل</option>
                  <option value="debit">خصم رصيد (-) من العميل</option>
                </select>
              </label>
              <label class="field-label">المبلغ (EGP)
                <input id="walletAdjustAmount" required type="number" min="1" step="any" placeholder="مثال: 100" class="field-input" />
              </label>
              <label class="field-label">سبب العملية / ملاحظة الإدارة
                <input id="walletAdjustNote" required placeholder="مثال: شحن يدوي، تعويض، مكافأة..." class="field-input" />
              </label>
              <div class="flex gap-3 justify-end pt-2">
                <button type="button" onclick="adminWalletAdjustModal.isOpen = false; renderCurrentRoute();" class="btn-secondary">إلغاء</button>
                <button type="submit" class="btn-primary">
                  <i data-lucide="check" class="h-4 w-4"></i>تطبيق وحفظ الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Density Toggle Helper
function toggleAdminDensity() {
  adminDensity = adminDensity === 'compact' ? 'comfortable' : 'compact';
  localStorage.setItem('gp_admin_density', adminDensity);
  renderCurrentRoute();
}

// Product Modal Handlers
function openProductModal(productId = null) {
  if (productId) {
    const p = Store.products.find(item => item.id === productId);
    adminProductModal = { isOpen: true, isEdit: true, product: p || null };
  } else {
    adminProductModal = { isOpen: true, isEdit: false, product: null };
  }
  renderCurrentRoute();
}

function closeProductModal() {
  adminProductModal = { isOpen: false, isEdit: false, product: null };
  renderCurrentRoute();
}

function handleSaveProductModal(e) {
  e.preventDefault();
  const name = document.getElementById('prodModalName')?.value.trim();
  let slug = document.getElementById('prodModalSlug')?.value.trim();
  const gameSlug = document.getElementById('prodModalGame')?.value || 'efootball';
  const type = document.getElementById('prodModalType')?.value || 'topup';
  const price = Number(document.getElementById('prodModalPrice')?.value || 50);
  const compareAtPrice = Number(document.getElementById('prodModalComparePrice')?.value) || null;
  const discountPercent = Number(document.getElementById('prodModalDiscount')?.value || 0);
  const stock = Number(document.getElementById('prodModalStock')?.value ?? 100);
  const deliveryEta = document.getElementById('prodModalEta')?.value.trim() || 'خلال 5–20 دقيقة';
  const imageUrl = document.getElementById('prodModalImage')?.value.trim() || null;
  const description = document.getElementById('prodModalDesc')?.value.trim() || '';
  const sensitiveDelivery = document.getElementById('prodModalSensitive')?.value.trim() || '';
  const featured = document.getElementById('prodModalFeatured')?.checked ?? false;
  const popular = document.getElementById('prodModalPopular')?.checked ?? false;

  if (!slug) {
    slug = name.toLowerCase().replace(/[\s\W]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000);
  }

  if (adminProductModal.isEdit && adminProductModal.product) {
    const p = adminProductModal.product;
    Object.assign(p, { name, slug, gameSlug, type, price, compareAtPrice, discountPercent, stock, deliveryEta, imageUrl, description, sensitiveDelivery, featured, popular });
    Store.saveProducts();
    if (isFirebaseActive && db) {
      db.collection('products').doc(String(p.id)).set(p, { merge: true }).catch(console.error);
    }
    showToast('تم تحديث المنتج بنجاح!', 'success');
  } else {
    const newProduct = {
      id: Date.now(),
      slug,
      name,
      gameSlug,
      type,
      price,
      compareAtPrice,
      discountPercent,
      stock,
      deliveryEta,
      imageUrl,
      description,
      sensitiveDelivery,
      featured,
      popular,
      status: 'active'
    };
    Store.products.unshift(newProduct);
    Store.saveProducts();
    if (isFirebaseActive && db) {
      db.collection('products').doc(String(newProduct.id)).set(newProduct).catch(console.error);
    }
    showToast('تمت إضافة المنتج ونشره بنجاح!', 'success');
  }

  closeProductModal();
}

function deleteProduct(id) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر وFirestore؟')) {
    Store.products = Store.products.filter(item => item.id !== id);
    Store.saveProducts();
    if (isFirebaseActive && db) {
      db.collection('products').doc(String(id)).delete().catch(console.error);
    }
    showToast('تم حذف المنتج', 'success');
    renderCurrentRoute();
  }
}

// Order Management Handlers
function updateOrderStatus(ref, key, val) {
  const o = Store.orders.find(item => item.reference === ref);
  if (o) {
    o[key] = val;
    Store.saveOrders();
    if (isFirebaseActive && db) {
      db.collection('orders').doc(ref).set(o, { merge: true }).catch(console.error);
    }
    showToast('تم تحديث حالة الطلب', 'success');
    renderCurrentRoute();
  }
}

function openDeliveryModal(orderRef) {
  const o = Store.orders.find(item => item.reference === orderRef);
  adminDeliveryModal = { isOpen: true, orderRef, deliveryNote: o?.deliveryData || '' };
  renderCurrentRoute();
}

function handleSaveDeliveryData(e) {
  e.preventDefault();
  const note = document.getElementById('deliveryDataInput')?.value.trim();
  const ref = adminDeliveryModal.orderRef;
  const o = Store.orders.find(item => item.reference === ref);
  if (o) {
    o.deliveryData = note;
    o.fulfillmentStatus = 'delivered';
    Store.saveOrders();
    if (isFirebaseActive && db) {
      db.collection('orders').doc(ref).set({
        deliveryData: note,
        fulfillmentStatus: 'delivered',
        deliveredAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    }
    showToast('تم حفظ كود التسليم وتحديث الطلب إلى تم التسليم!', 'success');
  }
  adminDeliveryModal = { isOpen: false, orderRef: null, deliveryNote: '' };
  renderCurrentRoute();
}

function deleteOrder(ref) {
  if (confirm('هل تريد حذف هذا الطلب نهائياً؟')) {
    Store.orders = Store.orders.filter(item => item.reference !== ref);
    Store.saveOrders();
    if (isFirebaseActive && db) {
      db.collection('orders').doc(ref).delete().catch(console.error);
    }
    showToast('تم حذف الطلب', 'success');
    renderCurrentRoute();
  }
}

// Wallet Topup Approvals
function approveTopup(id) {
  const r = Store.topupRequests.find(item => item.id === id);
  if (r) {
    r.status = 'approved';
    Store.saveTopups();

    if (Store.user && Store.user.uid === r.customerId) {
      Store.wallet.balance += Number(r.amount);
      Store.wallet.transactions.unshift({
        id: Date.now(),
        customerId: r.customerId,
        type: 'topup',
        amount: Number(r.amount),
        reference: r.reference || '',
        createdAt: new Date().toISOString()
      });
      Store.saveWallet();
    }

    if (isFirebaseActive && db) {
      db.collection('wallet_topup_requests').doc(String(r.id)).set(r, { merge: true }).catch(console.error);

      // Increment customer's wallet balance in Firestore
      if (r.customerId) {
        const walletDocRef = db.collection('customer_wallets').doc(r.customerId);
        walletDocRef.get().then(docSnap => {
          const currentBal = docSnap.exists ? (Number(docSnap.data().balance) || 0) : 0;
          const newBal = currentBal + Number(r.amount);
          walletDocRef.set({
            customerId: r.customerId,
            balance: newBal,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          const txId = Date.now();
          db.collection('wallet_transactions').doc(String(txId)).set({
            id: txId,
            customerId: r.customerId,
            type: 'topup',
            amount: Number(r.amount),
            reference: r.reference || '',
            createdAt: new Date().toISOString()
          }).catch(console.error);
        }).catch(console.error);
      }
    }
    showToast('تم اعتماد طلب الشحن وإضافة الرصيد لمحفظة العميل!', 'success');
    renderCurrentRoute();
  }
}

function rejectTopup(id) {
  const reason = prompt('سبب الرفض (اختياري، يظهر للعميل):', 'لم يتم استلام المبلغ أو رقم التحويل غير مطابق');
  if (reason === null) return;
  const r = Store.topupRequests.find(item => item.id === id);
  if (r) {
    r.status = 'rejected';
    r.adminNote = reason;
    Store.saveTopups();
    if (isFirebaseActive && db) {
      db.collection('wallet_topup_requests').doc(String(r.id)).set(r, { merge: true }).catch(console.error);
    }
    showToast('تم رفض طلب الشحن', 'error');
    renderCurrentRoute();
  }
}

// Customer Wallet Manual Adjustments
function openWalletAdjustModal(customerId, customerName, currentBalance) {
  adminWalletAdjustModal = { isOpen: true, customerId, customerName, currentBalance };
  renderCurrentRoute();
}

function handleSaveWalletAdjustment(e) {
  e.preventDefault();
  const type = document.getElementById('walletAdjustType')?.value || 'credit';
  const amount = Number(document.getElementById('walletAdjustAmount')?.value || 0);
  const note = document.getElementById('walletAdjustNote')?.value.trim() || 'تعديل إداري';
  const customerId = adminWalletAdjustModal.customerId;

  if (!customerId || amount <= 0) return;

  const diff = type === 'credit' ? amount : -amount;

  if (isFirebaseActive && db) {
    const walletDocRef = db.collection('customer_wallets').doc(customerId);
    walletDocRef.get().then(docSnap => {
      const current = docSnap.exists ? (Number(docSnap.data().balance) || 0) : 0;
      const newBal = Math.max(0, current + diff);
      walletDocRef.set({
        customerId,
        balance: newBal,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const txId = Date.now();
      db.collection('wallet_transactions').doc(String(txId)).set({
        id: txId,
        customerId,
        type: type === 'credit' ? 'admin_credit' : 'admin_debit',
        amount,
        reference: note,
        createdAt: new Date().toISOString()
      }).catch(console.error);

      showToast(`تم ${type === 'credit' ? 'إيداع' : 'خصم'} ${formatPrice(amount)} لمحفظة العميل بنجاح!`, 'success');
    }).catch(err => {
      console.error(err);
      showToast('خطأ في تحديث الرصيد: ' + err.message, 'error');
    });
  } else {
    showToast('تم تحديث الرصيد محلياً', 'success');
  }

  adminWalletAdjustModal = { isOpen: false, customerId: null, customerName: '', currentBalance: 0 };
  renderCurrentRoute();
}

// Coupons Handlers
function handleCreateCoupon(e) {
  e.preventDefault();
  const code = (document.getElementById('newCouponCode')?.value || '').trim().toUpperCase();
  const discountType = document.getElementById('newCouponType')?.value || 'percent';
  const value = Number(document.getElementById('newCouponValue')?.value || 0);
  const maxUses = Number(document.getElementById('newCouponMaxUses')?.value) || null;

  if (!code || value <= 0) return;

  const newCoupon = {
    code,
    discountType,
    value,
    maxUses,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const existingIdx = Store.coupons.findIndex(c => c.code === code);
  if (existingIdx >= 0) {
    Store.coupons[existingIdx] = newCoupon;
  } else {
    Store.coupons.unshift(newCoupon);
  }
  Store.saveCoupons?.();

  if (isFirebaseActive && db) {
    db.collection('coupons').doc(code).set(newCoupon).catch(console.error);
  }

  showToast(`تم إنشاء الكوبون ${code} بنجاح!`, 'success');
  renderCurrentRoute();
}

function toggleCouponStatus(code) {
  const c = Store.coupons.find(item => item.code === code);
  if (c) {
    c.isActive = c.isActive === false ? true : false;
    Store.saveCoupons?.();
    if (isFirebaseActive && db) {
      db.collection('coupons').doc(code).set({ isActive: c.isActive }, { merge: true }).catch(console.error);
    }
    showToast(`تم ${c.isActive ? 'تفعيل' : 'تعطيل'} الكوبون`, 'success');
    renderCurrentRoute();
  }
}

function deleteCoupon(code) {
  if (confirm(`هل أنت متأكد من حذف الكوبون ${code}؟`)) {
    Store.coupons = Store.coupons.filter(c => c.code !== code);
    Store.saveCoupons?.();
    if (isFirebaseActive && db) {
      db.collection('coupons').doc(code).delete().catch(console.error);
    }
    showToast('تم حذف الكوبون', 'success');
    renderCurrentRoute();
  }
}

// Store Settings & CMS Handlers
function saveStoreSettings(e) {
  if (e && e.preventDefault) e.preventDefault();
  const eyebrow = document.getElementById('editHeroEyebrow')?.value || Store.homepage?.hero?.eyebrow;
  const title = document.getElementById('editHeroTitle')?.value || Store.homepage?.hero?.title;
  const accent = document.getElementById('editHeroAccent')?.value || Store.homepage?.hero?.accent;
  const desc = document.getElementById('editHeroDesc')?.value || Store.homepage?.hero?.description;
  const primaryLabel = document.getElementById('editHeroPrimaryLabel')?.value || Store.homepage?.hero?.primaryLabel;
  const bannerText = document.getElementById('settingBanner')?.value || Store.homepage?.bannerText;
  const whatsapp = document.getElementById('settingWhatsapp')?.value || Store.homepage?.contacts?.whatsapp;
  const telegram = document.getElementById('settingTelegram')?.value || Store.homepage?.contacts?.telegram;
  const vodafone = document.getElementById('settingVodafone')?.value || Store.homepage?.paymentMethods?.vodafone;
  const instapay = document.getElementById('settingInstapay')?.value || Store.homepage?.paymentMethods?.instapay;

  Store.homepage = {
    ...Store.homepage,
    hero: {
      ...Store.homepage.hero,
      eyebrow,
      title,
      accent,
      description: desc,
      primaryLabel: primaryLabel || 'تصفح العروض'
    },
    bannerText,
    contacts: {
      ...Store.homepage.contacts,
      whatsapp,
      telegram
    },
    paymentMethods: {
      ...Store.homepage.paymentMethods,
      vodafone,
      instapay
    }
  };

  Store.saveHomepage();
  if (isFirebaseActive && db) {
    db.collection('homepage_configs').doc('main').set(Store.homepage).catch(console.error);
  }
  showToast('تم حفظ ونشر إعدادات المتجر بنجاح!', 'success');
  renderCurrentRoute();
}

async function syncProductsToFirebase() {
  if (!isFirebaseActive || !db) {
    showToast('فايربيس غير متصل حالياً', 'error');
    return;
  }
  try {
    const batch = db.batch();
    Store.products.forEach(p => {
      const docRef = db.collection('products').doc(String(p.id));
      batch.set(docRef, p, { merge: true });
    });
    await batch.commit();
    showToast(`تمت مزامنة جميع المنتجات (${Store.products.length}) مع Firestore بنجاح!`, 'success');
  } catch (e) {
    console.warn('Sync products error:', e.message);
    if (adminAuthenticated) {
      showToast('خطأ في المزامنة: ' + e.message, 'error');
    }
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const pass = (document.getElementById('adminPass')?.value || '').trim();
  const email = (document.getElementById('adminEmail')?.value || '').trim();
  const spinner = document.getElementById('adminLoginSpinner');

  if (pass === 'admin123' || pass === 'admin@gamepay') {
    adminAuthenticated = true;
    localStorage.setItem('gp_admin_auth', 'true');
    loadAdminData();
    showToast('تم فتح لوحة التحكم الإدارية بنجاح!', 'success');
    renderCurrentRoute();
    return;
  }

  if (isFirebaseActive && auth && email && pass) {
    if (spinner) spinner.classList.remove('hidden');
    try {
      const cred = await auth.signInWithEmailAndPassword(email, pass);
      if (db) {
        await db.collection('admins').doc(cred.user.uid).set({
          uid: cred.user.uid,
          email: cred.user.email,
          role: 'admin',
          lastLogin: new Date().toISOString()
        }, { merge: true }).catch(console.warn);
      }
      adminAuthenticated = true;
      localStorage.setItem('gp_admin_auth', 'true');
      showToast('تم التحقق من حساب الإدارة والدخول بنجاح!', 'success');
      loadAdminData();
      renderCurrentRoute();
      return;
    } catch(err) {
      if (spinner) spinner.classList.add('hidden');
      console.warn('Firebase Admin Login Error:', err.message);
      showToast('خطأ في بيانات حساب المسؤول: ' + err.message, 'error');
      return;
    }
  }

  showToast('رمز المرور غير صحيح!', 'error');
}

function logoutAdmin() {
  adminAuthenticated = false;
  localStorage.removeItem('gp_admin_auth');
  detachAdminListeners();
  showToast('تم تسجيل خروج المسؤول', 'info');
  navigate('home');
}

let unsubscribeWallet = null;
let unsubscribeTransactions = null;
let unsubscribeOrders = null;
let unsubscribeTopups = null;

function detachUserListeners() {
  if (unsubscribeWallet) { try { unsubscribeWallet(); } catch(e){} unsubscribeWallet = null; }
  if (unsubscribeTransactions) { try { unsubscribeTransactions(); } catch(e){} unsubscribeTransactions = null; }
  if (unsubscribeOrders) { try { unsubscribeOrders(); } catch(e){} unsubscribeOrders = null; }
  if (unsubscribeTopups) { try { unsubscribeTopups(); } catch(e){} unsubscribeTopups = null; }
}

function attachUserListeners(uid) {
  detachUserListeners();
  if (!isFirebaseActive || !db || !uid) return;

  // 1. Listen to customer wallet in real-time
  const walletDocRef = db.collection('customer_wallets').doc(uid);
  unsubscribeWallet = walletDocRef.onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      Store.wallet.balance = Number(data.balance) || 0.00;
    } else {
      walletDocRef.set({ customerId: uid, balance: 0.00, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
      Store.wallet.balance = 0.00;
    }
    Store.saveWallet();
    updateHeaderUser();
    renderCurrentRoute();
  }, err => console.warn('Firestore wallet listener:', err.message));

  // 2. Listen to customer transactions in real-time
  unsubscribeTransactions = db.collection('wallet_transactions')
    .where('customerId', '==', uid)
    .limit(50)
    .onSnapshot(snapshot => {
      const txs = [];
      snapshot.forEach(doc => txs.push(doc.data()));
      txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      Store.wallet.transactions = txs;
      Store.saveWallet();
      renderCurrentRoute();
    }, err => console.warn('Firestore transactions listener:', err.message));

  // 3. Listen to customer orders in real-time
  unsubscribeOrders = db.collection('orders')
    .where('customerId', '==', uid)
    .limit(50)
    .onSnapshot(snapshot => {
      const ords = [];
      snapshot.forEach(doc => ords.push(doc.data()));
      ords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      Store.orders = ords;
      Store.saveOrders();
      renderCurrentRoute();
    }, err => console.warn('Firestore orders listener:', err.message));

  // 4. Listen to customer topup requests in real-time
  unsubscribeTopups = db.collection('wallet_topup_requests')
    .where('customerId', '==', uid)
    .limit(50)
    .onSnapshot(snapshot => {
      const reqs = [];
      snapshot.forEach(doc => reqs.push(doc.data()));
      reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      Store.topupRequests = reqs;
      Store.saveTopups();
      renderCurrentRoute();
    }, err => console.warn('Firestore topups listener:', err.message));
}

let adminOrdersUnsub = null;
let adminTopupsUnsub = null;
let adminCustomersUnsub = null;
let adminCouponsUnsub = null;

function detachAdminListeners() {
  if (adminOrdersUnsub) { try { adminOrdersUnsub(); } catch(e){} adminOrdersUnsub = null; }
  if (adminTopupsUnsub) { try { adminTopupsUnsub(); } catch(e){} adminTopupsUnsub = null; }
  if (adminCustomersUnsub) { try { adminCustomersUnsub(); } catch(e){} adminCustomersUnsub = null; }
  if (adminCouponsUnsub) { try { adminCouponsUnsub(); } catch(e){} adminCouponsUnsub = null; }
}

function loadAdminData() {
  if (!isFirebaseActive || !db) return;
  detachAdminListeners();

  // 1. Orders
  try {
    adminOrdersUnsub = db.collection('orders').orderBy('createdAt', 'desc').limit(100).onSnapshot(snapshot => {
      const remoteOrders = [];
      snapshot.forEach(doc => remoteOrders.push(doc.data()));
      Store.orders = remoteOrders;
      Store.saveOrders();
      if (adminTab === 'orders' || adminTab === 'overview') {
        renderCurrentRoute();
      }
    }, err => console.warn('Admin orders listener:', err.message));
  } catch(e) { console.warn(e); }

  // 2. Wallet Topup Requests
  try {
    adminTopupsUnsub = db.collection('wallet_topup_requests').orderBy('createdAt', 'desc').limit(100).onSnapshot(snapshot => {
      const reqs = [];
      snapshot.forEach(doc => reqs.push(doc.data()));
      Store.topupRequests = reqs;
      Store.saveTopups();
      if (adminTab === 'wallet' || adminTab === 'overview') {
        renderCurrentRoute();
      }
    }, err => console.warn('Admin topups listener:', err.message));
  } catch(e) { console.warn(e); }

  // 3. Customers (profiles & wallets)
  try {
    adminCustomersUnsub = db.collection('customers').limit(100).onSnapshot(async snapshot => {
      const custs = [];
      snapshot.forEach(doc => custs.push({ ...doc.data(), uid: doc.id }));
      // Fetch each customer's wallet balance
      try {
        const walletsSnap = await db.collection('customer_wallets').get();
        const walletMap = {};
        walletsSnap.forEach(wDoc => {
          walletMap[wDoc.id] = Number(wDoc.data().balance || 0);
        });
        custs.forEach(c => {
          c.balance = walletMap[c.uid] ?? 0;
        });
      } catch(e){}
      Store.adminCustomers = custs;
      if (adminTab === 'customers' || adminTab === 'overview') {
        renderCurrentRoute();
      }
    }, err => console.warn('Admin customers listener:', err.message));
  } catch(e) { console.warn(e); }

  // 4. Coupons
  try {
    adminCouponsUnsub = db.collection('coupons').onSnapshot(snapshot => {
      const cpns = [];
      snapshot.forEach(doc => cpns.push(doc.data()));
      if (cpns.length > 0) {
        Store.coupons = cpns;
        Store.saveCoupons?.();
        if (adminTab === 'coupons' || adminTab === 'overview') {
          renderCurrentRoute();
        }
      }
    }, err => console.warn('Admin coupons listener:', err.message));
  } catch(e) { console.warn(e); }
}

async function loadFirebaseData() {
  if (!isFirebaseActive || !db) return;
  try {
    // 1. Fetch products from Firestore
    const productsSnap = await db.collection('products').get();
    if (!productsSnap.empty) {
      const remoteProducts = [];
      productsSnap.forEach(doc => remoteProducts.push(doc.data()));
      if (remoteProducts.length > 0) {
        Store.products = remoteProducts;
        localStorage.setItem('gp_products', JSON.stringify(Store.products));
        renderCurrentRoute();
      }
    }

    // 2. Sync homepage config if exists
    const hpDoc = await db.collection('homepage_configs').doc('main').get();
    if (hpDoc.exists) {
      Store.homepage = hpDoc.data();
      localStorage.setItem('gp_homepage', JSON.stringify(Store.homepage));
      renderCurrentRoute();
    }

    // 3. Auth State Listener
    if (auth) {
      auth.onAuthStateChanged(user => {
        if (user) {
          Store.user = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          };
          localStorage.setItem('gp_user', JSON.stringify(Store.user));
          updateHeaderUser();
          attachUserListeners(user.uid);
        } else {
          detachUserListeners();
          Store.user = null;
          Store.saveUser();
          Store.wallet = { balance: 0.00, transactions: [] };
          Store.saveWallet();
          Store.orders = [];
          Store.saveOrders();
          Store.topupRequests = [];
          Store.saveTopups();
          updateHeaderUser();
          renderCurrentRoute();
        }
      });
    }
  } catch (err) {
    console.warn('[Firebase Load error]', err.message);
  }
}

// --- Main Layout Renderer ---
function renderCurrentRoute() {
  const app = document.getElementById('app');
  if (!app) return;
  const route = parseRoute();
  let content = '';

  if (route.path === 'home' || route.path === '') {
    content = viewHome();
  } else if (route.path === 'store') {
    content = viewCatalog(route.query);
  } else if (route.path.startsWith('product/')) {
    const slug = route.path.replace('product/', '');
    content = viewProductDetails(slug);
  } else if (route.path === 'cart') {
    content = viewCart();
  } else if (route.path === 'checkout') {
    content = viewCheckout();
  } else if (route.path.startsWith('order-success/')) {
    const ref = route.path.replace('order-success/', '');
    content = viewOrderSuccess(ref);
  } else if (route.path === 'orders') {
    content = viewOrders();
  } else if (route.path === 'account') {
    content = viewAccount();
  } else if (route.path === 'login') {
    content = viewAuth('login');
  } else if (route.path === 'register') {
    content = viewAuth('register');
  } else if (route.path === 'forgot-password') {
    content = viewAuth('forgot-password');
  } else if (route.path === 'admin') {
    if (adminAuthenticated) {
      loadAdminData();
    }
    content = viewAdmin();
  } else {
    content = viewHome();
  }

  // Header & Footer Wrap (unless auth page or admin)
  if (route.path === 'login' || route.path === 'register' || route.path === 'forgot-password' || route.path === 'admin') {
    app.innerHTML = content;
  } else {
    app.innerHTML = `
      <!-- HEADER -->
      <header class="sticky top-0 z-50 border-b border-white/[.07] bg-[#07111f]/85 backdrop-blur-xl">
        <div class="container flex h-[68px] items-center justify-between gap-2 sm:h-[72px] sm:gap-3">
          <!-- Brand Logo -->
          <a href="#home" onclick="navigate('home'); return false;" class="shrink-0" aria-label="العودة للرئيسية">
            <div class="flex items-center gap-2.5 select-none" aria-label="Game Pay">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-white shadow-[0_0_28px_rgba(136,70,208,.42)]">
                <i data-lucide="gamepad-2" class="h-5 w-5" stroke-width="2.6"></i>
              </div>
              <div class="leading-none">
                <strong class="block text-lg tracking-tight text-white">Game Pay</strong>
                <span class="mt-1 block text-[10px] font-bold tracking-[.28em] text-cyan-300">جيم باي</span>
              </div>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden items-center gap-1 lg:flex">
            <button onclick="navigate('home')" class="rounded-xl px-3 py-2 text-sm transition ${route.path === 'home' || route.path === '' ? 'bg-white/[.07] text-cyan-300' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}">الرئيسية</button>
            <button onclick="navigate('store')" class="rounded-xl px-3 py-2 text-sm transition ${route.path === 'store' && !route.query.type ? 'bg-white/[.07] text-cyan-300' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}">المتجر</button>
            <div class="relative group">
              <button onclick="navigate('store?type=topup')" class="flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition ${route.query.type === 'topup' ? 'bg-white/[.07] text-cyan-300' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}">
                شحن الألعاب <i data-lucide="chevron-down" class="h-3.5 w-3.5 transition group-hover:rotate-180"></i>
              </button>
              <div class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute right-0 top-11 z-[60] w-52 overflow-hidden rounded-xl border border-white/10 bg-[#101d2f] p-1 shadow-2xl">
                <button onclick="navigate('store?type=topup')" class="menu-action text-cyan-200">عرض كل الشحنات</button>
                <button onclick="navigate('store?type=topup&sort=discount')" class="menu-action">عروض الشحن</button>
              </div>
            </div>
            <button onclick="navigate('store?type=account')" class="rounded-xl px-3 py-2 text-sm transition ${route.query.type === 'account' ? 'bg-white/[.07] text-cyan-300' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}">الحسابات</button>
            <button onclick="navigate('store?sort=discount')" class="rounded-xl px-3 py-2 text-sm transition ${route.query.sort === 'discount' ? 'bg-white/[.07] text-cyan-300' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}">العروض</button>
          </nav>

          <!-- Header Actions -->
          <div class="flex items-center gap-1 sm:gap-1.5">
            <button onclick="navigate('store')" class="icon-button h-10 w-10 sm:h-9 sm:w-9" aria-label="بحث">
              <i data-lucide="search" class="h-5 w-5"></i>
            </button>
            <button onclick="navigate('cart')" class="icon-button relative h-10 w-10 sm:h-9 sm:w-9" aria-label="السلة">
              <i data-lucide="shopping-bag" class="h-5 w-5"></i>
              <span id="cartCountBadge" class="absolute -left-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950 hidden">0</span>
            </button>

            <!-- User Auth Block -->
            <div id="userHeaderArea" class="hidden md:block"></div>

            <!-- Mobile Hamburger Toggle -->
            <button onclick="toggleMobileMenu()" class="icon-button h-10 w-10 lg:hidden sm:h-9 sm:w-9" aria-label="القائمة">
              <i id="mobileMenuIcon" data-lucide="menu" class="h-5 w-5"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Drawer -->
        <nav id="mobileMenu" class="hidden border-t border-white/[.07] bg-[#0b1728] px-3 py-3 sm:px-4 lg:hidden">
          <button onclick="navigate('home'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">الرئيسية</button>
          <button onclick="navigate('store'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">المتجر</button>
          <button onclick="navigate('store?type=topup'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">شحن الألعاب</button>
          <button onclick="navigate('store?type=account'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">الحسابات</button>
          <button onclick="navigate('store?sort=discount'); toggleMobileMenu(false);" class="block w-full rounded-xl px-3 py-3 text-right text-sm text-slate-200 hover:bg-white/[.06]">العروض</button>
          <div id="mobileUserArea" class="pt-2 border-t border-white/[.07]"></div>
        </nav>
      </header>

      <!-- MAIN ROUTE BODY -->
      <main class="min-w-0">
        ${content}
      </main>

      <!-- FOOTER -->
      <footer class="mt-14 border-t border-white/[.08] bg-[#050c16] sm:mt-20">
        <div class="container grid gap-8 py-10 sm:gap-10 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div class="md:col-span-2 lg:col-span-1">
            <div class="flex items-center gap-2.5 select-none" aria-label="Game Pay">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-white shadow-[0_0_28px_rgba(136,70,208,.42)]">
                <i data-lucide="gamepad-2" class="h-5 w-5" stroke-width="2.6"></i>
              </div>
              <div class="leading-none">
                <strong class="block text-lg tracking-tight text-white">Game Pay</strong>
                <span class="mt-1 block text-[10px] font-bold tracking-[.28em] text-cyan-300">جيم باي</span>
              </div>
            </div>
            <p class="mt-4 max-w-sm text-sm leading-7 text-slate-400">متجرك الموثوق للمنتجات والخدمات الرقمية الخاصة بالألعاب، بتجربة شراء واضحة وتسليم رقمي سريع ومضمون.</p>
          </div>
          <div>
            <h3 class="font-bold text-white">روابط سريعة</h3>
            <div class="mt-4 grid gap-3 text-sm text-slate-400">
              <button onclick="navigate('store')" class="w-fit text-right hover:text-cyan-300">تصفح المتجر</button>
              <button onclick="navigate('orders')" class="w-fit text-right hover:text-cyan-300">تتبع الطلبات</button>
              <button onclick="navigate('account')" class="w-fit text-right hover:text-cyan-300">محفظة العميل</button>
              <button onclick="navigate('admin')" class="w-fit text-right hover:text-cyan-300">لوحة الإدارة</button>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white">سياسات المتجر</h3>
            <div class="mt-4 grid gap-3 text-sm text-slate-400">
              <span class="w-fit text-right text-slate-400">الخصوصية وحماية البيانات</span>
              <span class="w-fit text-right text-slate-400">الشروط والأحكام</span>
              <span class="w-fit text-right text-slate-400">تسليم المنتجات الرقمية</span>
            </div>
          </div>
        </div>
        <div class="border-t border-white/[.07]">
          <div class="container grid gap-2 py-5 text-center text-xs text-slate-500 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span class="sm:text-right">© Game Pay – جيم باي</span>
            <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 justify-self-center whitespace-nowrap text-slate-400">
              <span class="inline-flex items-center gap-1.5"><i data-lucide="thumbs-up" class="h-3.5 w-3.5 text-[#8b5cf6]"></i>Facebook</span>
              <span class="inline-flex items-center gap-1.5"><i data-lucide="send" class="h-3.5 w-3.5 text-cyan-300"></i>Telegram</span>
              <span class="inline-flex items-center gap-1.5"><i data-lucide="message-circle" class="h-3.5 w-3.5 text-emerald-300"></i>WhatsApp</span>
              <span class="inline-flex items-center gap-1.5"><i data-lucide="music-2" class="h-3.5 w-3.5 text-rose-300"></i>TikTok</span>
            </div>
            <span class="hidden sm:block" aria-hidden="true"></span>
          </div>
        </div>
      </footer>
    `;
  }

  updateHeaderBadges();
  updateHeaderUser();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Initial Run
window.addEventListener('DOMContentLoaded', () => {
  renderCurrentRoute();
  loadFirebaseData();
});
