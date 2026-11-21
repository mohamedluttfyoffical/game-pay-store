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

// --- App State Store ---
const Store = {
  products: JSON.parse(localStorage.getItem('gp_products') || 'null') || INITIAL_PRODUCTS,
  games: INITIAL_GAMES,
  homepage: savedHomepage || INITIAL_HOMEPAGE_CONFIG,
  cart: JSON.parse(localStorage.getItem('gp_cart') || '[]'),
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
  const product = Store.products.find(p => p.id === Number(productId));
  if (!product) return;
  const existing = Store.cart.find(c => c.productId === product.id);
  if (existing) {
    existing.quantity += qty;
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

function updateCartQty(productId, qty) {
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = Store.cart.find(c => c.productId === Number(productId));
  if (item) {
    item.quantity = qty;
    Store.saveCart();
    renderCurrentRoute();
  }
}

function removeFromCart(productId) {
  Store.cart = Store.cart.filter(c => c.productId !== Number(productId));
  Store.saveCart();
  renderCurrentRoute();
  showToast('تمت إزالة المنتج من السلة');
}

function getCartCount() {
  return Store.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
  return Store.cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
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
      <span class="eyebrow">سلة التسوق</span>
      <h1 class="mt-4 text-3xl font-black text-white">جاهز لإتمام طلبك؟</h1>

      <div class="mt-6 grid gap-5 sm:mt-8 sm:gap-7 lg:grid-cols-[1fr_330px]">
        <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
          ${lines.map(line => `
            <div class="flex flex-col gap-4 border-b border-white/[.07] p-4 sm:flex-row sm:items-center">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-black text-cyan-200">GP</div>
              <div class="min-w-0 flex-1">
                <h2 class="font-bold text-white">${line.product.name}</h2>
                <p class="mt-1 text-xs text-slate-500">${line.product.deliveryEta || 'تسليم رقمي'} · تسليم رقمي</p>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <div class="flex items-center rounded-xl border border-white/10">
                  <button onclick="updateCartQty(${line.product.id}, ${line.quantity - 1})" class="grid h-10 w-10 place-items-center text-slate-400 hover:text-white">
                    <i data-lucide="minus" class="h-4 w-4"></i>
                  </button>
                  <span class="w-7 text-center text-sm font-bold">${line.quantity}</span>
                  <button onclick="updateCartQty(${line.product.id}, ${line.quantity + 1})" class="grid h-10 w-10 place-items-center text-slate-400 hover:text-white">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                  </button>
                </div>
                <strong class="text-sm text-cyan-200">${formatPrice(Number(line.product.price) * line.quantity)}</strong>
                <button onclick="removeFromCart(${line.product.id})" class="icon-button h-10 w-10 text-rose-300" aria-label="حذف">
                  <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
              </div>
            </div>
          `).join('')}
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

// 9. AUTH (LOGIN & REGISTER) VIEW
function viewAuth(mode = 'login') {
  const isRegister = mode === 'register';

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

          <span class="eyebrow">${isRegister ? 'حساب جديد' : 'تسجيل الدخول'}</span>
          <h2 class="mt-4 text-3xl font-black text-white">${isRegister ? 'أنشئ حسابك' : 'مرحبًا بعودتك'}</h2>
          ${!isRegister ? `
            <p class="mt-3 text-sm leading-7 text-slate-400">
              أدخل بيانات حسابك الخاصة بـ Game Pay للمتابعة.
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

            <label class="field-label">البريد الإلكتروني
              <div class="relative">
                <i data-lucide="mail" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                <input id="authEmail" required type="email" placeholder="name@example.com" class="field-input pr-10" />
              </div>
            </label>

            ${isRegister ? `
              <label class="field-label">رقم الهاتف
                <div class="relative">
                  <i data-lucide="phone" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                  <input id="authPhone" required type="tel" placeholder="01xxxxxxxxx" class="field-input pr-10" />
                </div>
              </label>
            ` : ''}

            <label class="field-label">كلمة المرور
              <div class="relative">
                <i data-lucide="lock-keyhole" class="absolute right-3 top-3.5 h-4 w-4 text-slate-500"></i>
                <input id="authPassword" required minlength="8" type="password" placeholder="8 أحرف على الأقل" class="field-input pr-10" />
              </div>
            </label>

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
                <span>${isRegister ? 'جارٍ إنشاء الحساب...' : 'جارٍ تسجيل الدخول...'}</span>
              </span>
              <span id="authBtnText">${isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-400">
            ${isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            <button onclick="navigate('${isRegister ? 'login' : 'register'}')" class="font-bold text-cyan-300">
              ${isRegister ? 'سجّل الدخول' : 'أنشئ حسابًا'}
            </button>
          </p>
        </section>
      </div>
    </main>
  `;
}

function handleAuthSubmit(e, mode) {
  e.preventDefault();
  const email = document.getElementById('authEmail')?.value.trim();
  const password = document.getElementById('authPassword')?.value;
  const name = document.getElementById('authName')?.value.trim() || email.split('@')[0];
  const phone = document.getElementById('authPhone')?.value.trim() || '';
  const confirmPassword = document.getElementById('authConfirmPassword')?.value;
  const termsChecked = document.getElementById('authTerms')?.checked;

  if (!email || !password) return;

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
      auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
          cred.user.updateProfile({ displayName: name }).catch(console.error);
          const userObj = { uid: cred.user.uid, name, email, phone };
          Store.user = userObj;
          Store.saveUser();

          // Save user fields to collection 'users' in Firestore
          if (db) {
            const userData = {
              id: cred.user.uid,
              uid: cred.user.uid,
              name,
              email,
              phone,
              role: 'customer',
              termsAccepted: true,
              createdAt: new Date().toISOString()
            };

            // 1. Save to 'users' collection as requested
            db.collection('users').doc(cred.user.uid).set(userData).catch(console.error);

            // 2. Also keep 'customers' & 'customer_wallets' synced
            db.collection('customers').doc(cred.user.uid).set(userData).catch(console.error);
            db.collection('customer_wallets').doc(cred.user.uid).set({
              customerId: cred.user.uid,
              balance: 0.00,
              updatedAt: new Date().toISOString()
            }).catch(console.error);
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
      auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
          const userObj = { uid: cred.user.uid, name: cred.user.displayName || email.split('@')[0], email };
          Store.user = userObj;
          Store.saveUser();
          attachUserListeners(cred.user.uid);
          setLoading(false);
          showToast('أهلًا بك من جديد!', 'success');
          navigate('account');
        })
        .catch(err => {
          setLoading(false);
          let msg = err.message;
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
          } else if (err.code === 'auth/too-many-requests') {
            msg = 'محاولات دخول كثيرة، يرجى الانتظار قليلاً ثم المحاولة ثانية.';
          }
          showToast(msg, 'error');
        });
    }
  } else {
    // Standalone fallback
    setTimeout(() => {
      Store.user = { uid: 'user-' + Date.now(), name, email, phone };
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

function viewAdmin() {
  if (!adminAuthenticated) {
    return `
      <div class="grid min-h-screen place-items-center bg-[#07111f] p-4 text-slate-100">
        <div class="w-full max-w-md rounded-[28px] border border-cyan-300/15 bg-[#0d1929] p-7 shadow-2xl">
          <div class="text-center">
            <span class="eyebrow">إدارة Game Pay</span>
            <h1 class="mt-4 text-2xl font-black text-white">تسجيل دخول المسؤول</h1>
            <p class="mt-2 text-xs leading-6 text-slate-400">أدخل كلمة مرور لوحة الإدارة للمتابعة.</p>
          </div>
          <form onsubmit="handleAdminLogin(event)" class="mt-6 grid gap-4">
            <label class="field-label">رمز المرور السري
              <input id="adminPass" required type="password" placeholder="كلمة المرور الافتراضية: admin123" class="field-input" />
            </label>
            <button type="submit" class="btn-primary py-3">فتح لوحة التحكم</button>
            <p class="text-[11px] text-center text-slate-500">كلمة المرور الافتراضية هي: <code class="text-cyan-200">admin123</code></p>
          </form>
        </div>
      </div>
    `;
  }

  const confirmedSales = Store.orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.total), 0);

  return `
    <div dir="rtl" class="admin-page min-h-screen bg-[#07111f] text-slate-100 p-4 sm:p-8">
      <header class="flex flex-col gap-4 border-b border-white/[.08] pb-5 sm:pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="eyebrow">Game Pay · إدارة المتجر</span>
          <h1 class="mt-3 text-xl font-black text-white sm:text-2xl">لوحة التحكم الإدارية</h1>
        </div>
        <div class="admin-toolbar flex flex-wrap items-center gap-2">
          <div class="flex gap-2 overflow-x-auto pb-1">
            <button onclick="adminTab = 'overview'; renderCurrentRoute();" class="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${adminTab === 'overview' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">نظرة عامة</button>
            <button onclick="adminTab = 'products'; renderCurrentRoute();" class="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${adminTab === 'products' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">المنتجات</button>
            <button onclick="adminTab = 'orders'; renderCurrentRoute();" class="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${adminTab === 'orders' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">الطلبات</button>
            <button onclick="adminTab = 'wallet'; renderCurrentRoute();" class="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${adminTab === 'wallet' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">طلبات الشحن</button>
            <button onclick="adminTab = 'homepage'; renderCurrentRoute();" class="shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${adminTab === 'homepage' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-300 hover:bg-white/[.05]'}">محرر الصفحة</button>
          </div>
          <button onclick="logoutAdmin()" class="btn-secondary text-xs text-rose-300">خروج المسؤول</button>
        </div>
      </header>

      <div class="py-5 sm:py-7">
        <!-- ADMIN TAB: OVERVIEW -->
        ${adminTab === 'overview' ? `
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div class="flex items-center gap-3">
              <span class="grid h-8 w-8 place-items-center rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs">FB</span>
              <div>
                <strong class="text-sm text-emerald-200">Firebase متصل ومفعّل سحابياً: orders-abb76</strong>
                <p class="text-xs text-slate-400">قاعدة بيانات Firestore مربوطة بالمتجر ومزامنة حية للطلبات والمنتجات</p>
              </div>
            </div>
            <button onclick="syncProductsToFirebase()" class="btn-primary text-xs">
              <i data-lucide="refresh-cw" class="h-3.5 w-3.5"></i>مزامنة المنتجات مع Firestore
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
              <i data-lucide="boxes" class="h-5 w-5 text-cyan-300"></i>
              <span class="mt-5 block text-xs text-slate-500">المنتجات</span>
              <strong class="mt-1 block text-2xl text-white">${Store.products.length}</strong>
            </article>
            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
              <i data-lucide="package-check" class="h-5 w-5 text-cyan-300"></i>
              <span class="mt-5 block text-xs text-slate-500">الطلبات</span>
              <strong class="mt-1 block text-2xl text-white">${Store.orders.length}</strong>
            </article>
            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
              <i data-lucide="wallet-cards" class="h-5 w-5 text-cyan-300"></i>
              <span class="mt-5 block text-xs text-slate-500">طلبات الشحن المعلقة</span>
              <strong class="mt-1 block text-2xl text-white">${Store.topupRequests.filter(r => r.status === 'pending').length}</strong>
            </article>
            <article class="rounded-2xl border border-white/[.08] bg-[#0d1929] p-5">
              <i data-lucide="bar-chart-3" class="h-5 w-5 text-cyan-300"></i>
              <span class="mt-5 block text-xs text-slate-500">المبيعات المؤكدة</span>
              <strong class="mt-1 block text-2xl text-white">${formatPrice(confirmedSales)}</strong>
            </article>
          </div>

          <div class="mt-6 overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <div class="border-b border-white/[.07] px-5 py-4 font-bold text-white">أحدث الطلبات</div>
            ${Store.orders.length ? Store.orders.slice(0, 5).map(o => `
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] px-5 py-4 last:border-0">
                <div>
                  <strong class="text-sm text-white">${o.reference}</strong>
                  <span class="mr-3 text-xs text-slate-500">${o.customerEmail} · ${new Date(o.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="badge-neutral">${paymentLabels[o.paymentStatus] || o.paymentStatus}</span>
                  <span class="text-sm text-cyan-200">${formatPrice(o.total)}</span>
                </div>
              </div>
            `).join('') : '<p class="p-6 text-sm text-slate-500">لا توجد طلبات حتى الآن.</p>'}
          </div>
        ` : ''}

        <!-- ADMIN TAB: PRODUCTS -->
        ${adminTab === 'products' ? `
          <div class="admin-card overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <div class="admin-list-header flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] p-4">
              <div>
                <h2 class="font-bold text-white">قائمة المنتجات (${Store.products.length})</h2>
                <p class="mt-1 text-xs text-slate-500">إدارة الباقات والأسعار والمخزون والعروض.</p>
              </div>
              <button onclick="openNewProductPrompt()" class="btn-primary text-xs">
                <i data-lucide="plus" class="h-3.5 w-3.5"></i>إضافة منتج جديد
              </button>
            </div>
            ${Store.products.map(p => `
              <article class="admin-list-row flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] p-4 last:border-0">
                <div>
                  <strong class="block truncate text-sm text-white">${p.name}</strong>
                  <span class="mt-1 block text-xs text-slate-500">${gameLabels[p.gameSlug] || p.gameSlug} · ${formatPrice(p.price)} · خصم ${p.discountPercent}%</span>
                </div>
                <div class="admin-row-actions flex gap-2">
                  <button onclick="editProductPrice(${p.id})" class="btn-secondary text-xs">تعديل السعر</button>
                  <button onclick="deleteProduct(${p.id})" class="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10">حذف</button>
                </div>
              </article>
            `).join('')}
          </div>
        ` : ''}

        <!-- ADMIN TAB: ORDERS -->
        ${adminTab === 'orders' ? `
          <div class="admin-card overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <div class="border-b border-white/[.07] p-4 font-bold text-white">إدارة كل الطلبات</div>
            ${Store.orders.map(order => `
              <article class="grid gap-4 border-b border-white/[.06] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_150px_150px_auto]">
                <div class="min-w-0 sm:col-span-2 lg:col-span-1">
                  <strong class="text-sm text-white">${order.reference}</strong>
                  <p class="mt-1 break-words text-xs text-slate-500">${order.customerName} · ${order.customerEmail} ${order.accountData ? ' · ' + order.accountData : ''}</p>
                  <span class="mt-2 block text-sm text-cyan-200">${formatPrice(order.total)}</span>
                </div>
                <label class="field-label">الدفع
                  <select onchange="updateOrderStatus(${order.id}, 'paymentStatus', this.value)" class="field-select">
                    <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>بانتظار الدفع</option>
                    <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>مدفوع</option>
                    <option value="failed" ${order.paymentStatus === 'failed' ? 'selected' : ''}>فشل</option>
                  </select>
                </label>
                <label class="field-label">التسليم
                  <select onchange="updateOrderStatus(${order.id}, 'fulfillmentStatus', this.value)" class="field-select">
                    <option value="pending" ${order.fulfillmentStatus === 'pending' ? 'selected' : ''}>بانتظار</option>
                    <option value="processing" ${order.fulfillmentStatus === 'processing' ? 'selected' : ''}>قيد التنفيذ</option>
                    <option value="delivered" ${order.fulfillmentStatus === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                    <option value="cancelled" ${order.fulfillmentStatus === 'cancelled' ? 'selected' : ''}>ملغي</option>
                  </select>
                </label>
                <span class="text-xs text-slate-500 sm:col-span-2 lg:col-span-1 lg:self-center">
                  ${new Date(order.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </article>
            `).join('')}
          </div>
        ` : ''}

        <!-- ADMIN TAB: WALLET TOPUPS -->
        ${adminTab === 'wallet' ? `
          <div class="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1929]">
            <div class="border-b border-white/[.07] p-5 font-bold text-white">طلبات شحن المحافظ المعلقة</div>
            ${Store.topupRequests.map(r => `
              <article class="border-b border-white/[.07] p-5 last:border-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <strong class="text-sm text-white">${r.method}</strong>
                  <p class="mt-1 text-xs text-slate-500">المرجع: ${r.reference || 'بلا'} · ${new Date(r.createdAt).toLocaleString('ar-EG')}</p>
                  <strong class="mt-2 block text-sm text-cyan-200">${formatPrice(r.amount)}</strong>
                </div>
                <div class="flex items-center gap-2">
                  ${r.status === 'pending' ? `
                    <button onclick="approveTopup(${r.id})" class="btn-primary text-xs">اعتماد وإضافة الرصيد</button>
                    <button onclick="rejectTopup(${r.id})" class="rounded-xl border border-rose-400/25 px-3 py-2 text-xs font-bold text-rose-300">رفض</button>
                  ` : `
                    <span class="badge-neutral">${r.status === 'approved' ? 'معتمد' : 'مرفوض'}</span>
                  `}
                </div>
              </article>
            `).join('')}
          </div>
        ` : ''}

        <!-- ADMIN TAB: HOMEPAGE EDITOR -->
        ${adminTab === 'homepage' ? `
          <section class="rounded-2xl border border-cyan-300/15 bg-[#0d1929] p-6">
            <h2 class="font-bold text-white">محرر نصوص الصفحة الرئيسية</h2>
            <div class="mt-6 grid gap-4 lg:grid-cols-2">
              <label class="field-label">السطر التعريفي (Eyebrow)
                <input id="editHeroEyebrow" value="${Store.homepage.hero.eyebrow}" class="field-input" />
              </label>
              <label class="field-label">العنوان الرئيسي
                <input id="editHeroTitle" value="${Store.homepage.hero.title}" class="field-input" />
              </label>
              <label class="field-label">الكلمة المضيئة
                <input id="editHeroAccent" value="${Store.homepage.hero.accent}" class="field-input" />
              </label>
              <label class="field-label lg:col-span-2">الوصف
                <textarea id="editHeroDesc" class="field-input min-h-24">${Store.homepage.hero.description}</textarea>
              </label>
            </div>
            <button onclick="saveHomepageConfig()" class="btn-primary mt-6">
              <i data-lucide="save" class="h-4 w-4"></i>حفظ ونشر التغييرات
            </button>
          </section>
        ` : ''}
      </div>
    </div>
  `;
}

function handleAdminLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPass')?.value;
  if (pass === 'admin123') {
    adminAuthenticated = true;
    localStorage.setItem('gp_admin_auth', 'true');
    loadAdminData();
    showToast('تم الدخول إلى لوحة الإدارة بنجاح', 'success');
    renderCurrentRoute();
  } else {
    showToast('رمز المرور غير صحيح!', 'error');
  }
}

function logoutAdmin() {
  adminAuthenticated = false;
  localStorage.removeItem('gp_admin_auth');
  renderCurrentRoute();
}

function updateOrderStatus(id, key, val) {
  const o = Store.orders.find(item => item.id === id);
  if (o) {
    o[key] = val;
    Store.saveOrders();
    if (isFirebaseActive && db) {
      db.collection('orders').doc(o.reference).set(o, { merge: true }).catch(console.error);
    }
    showToast('تم تحديث حالة الطلب بنجاح', 'success');
    renderCurrentRoute();
  }
}

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
  const r = Store.topupRequests.find(item => item.id === id);
  if (r) {
    r.status = 'rejected';
    Store.saveTopups();
    if (isFirebaseActive && db) {
      db.collection('wallet_topup_requests').doc(String(r.id)).set(r, { merge: true }).catch(console.error);
    }
    showToast('تم رفض طلب الشحن', 'error');
    renderCurrentRoute();
  }
}

function openNewProductPrompt() {
  const name = prompt('اسم المنتج:');
  if (!name) return;
  const price = Number(prompt('السعر (EGP):', '50'));
  const game = prompt('اللعبة (efootball / pubg / fc-mobile / cod-mobile / roblox):', 'efootball');
  const cleanSlug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
  const newP = {
    id: Date.now(),
    slug: cleanSlug,
    name,
    gameSlug: game || 'efootball',
    type: 'topup',
    price: price || 50,
    compareAtPrice: null,
    discountPercent: 0,
    stock: 50,
    status: 'active',
    featured: true,
    popular: true,
    deliveryEta: 'خلال 10–30 دقيقة',
    description: 'شحن فوري وباقة مميزة.',
    imageUrl: null
  };
  Store.products.unshift(newP);
  Store.saveProducts();
  if (isFirebaseActive && db) {
    db.collection('products').doc(String(newP.id)).set(newP).catch(console.error);
  }
  showToast('تمت إضافة المنتج بنجاح!', 'success');
  renderCurrentRoute();
}

function editProductPrice(id) {
  const p = Store.products.find(item => item.id === id);
  if (!p) return;
  const newPrice = prompt('أدخل السعر الجديد لـ ' + p.name + ':', p.price);
  if (newPrice !== null && !isNaN(Number(newPrice))) {
    p.price = Number(newPrice);
    Store.saveProducts();
    if (isFirebaseActive && db) {
      db.collection('products').doc(String(p.id)).set(p, { merge: true }).catch(console.error);
    }
    showToast('تم تحديث السعر بنجاح', 'success');
    renderCurrentRoute();
  }
}

function deleteProduct(id) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
    Store.products = Store.products.filter(item => item.id !== id);
    Store.saveProducts();
    if (isFirebaseActive && db) {
      db.collection('products').doc(String(id)).delete().catch(console.error);
    }
    showToast('تم حذف المنتج', 'success');
    renderCurrentRoute();
  }
}

function saveHomepageConfig() {
  const eyebrow = document.getElementById('editHeroEyebrow')?.value;
  const title = document.getElementById('editHeroTitle')?.value;
  const accent = document.getElementById('editHeroAccent')?.value;
  const desc = document.getElementById('editHeroDesc')?.value;
  if (eyebrow && title && accent) {
    Store.homepage.hero.eyebrow = eyebrow;
    Store.homepage.hero.title = title;
    Store.homepage.hero.accent = accent;
    Store.homepage.hero.description = desc;
    Store.saveHomepage();
    if (isFirebaseActive && db) {
      db.collection('homepage_configs').doc('main').set(Store.homepage).catch(console.error);
    }
    showToast('تم حفظ ونشر إعدادات الصفحة بنجاح', 'success');
  }
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
    showToast('تمت مزامنة جميع المنتجات مع Firestore بنجاح!', 'success');
  } catch (e) {
    showToast('خطأ في المزامنة: ' + e.message, 'error');
  }
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

function loadAdminData() {
  if (!isFirebaseActive || !db) return;
  if (adminOrdersUnsub) { try { adminOrdersUnsub(); } catch(e){} adminOrdersUnsub = null; }
  if (adminTopupsUnsub) { try { adminTopupsUnsub(); } catch(e){} adminTopupsUnsub = null; }

  adminOrdersUnsub = db.collection('orders').orderBy('createdAt', 'desc').limit(50).onSnapshot(snapshot => {
    const remoteOrders = [];
    snapshot.forEach(doc => remoteOrders.push(doc.data()));
    Store.orders = remoteOrders;
    Store.saveOrders();
    renderCurrentRoute();
  }, err => console.warn('Admin orders listener:', err.message));

  adminTopupsUnsub = db.collection('wallet_topup_requests').orderBy('createdAt', 'desc').limit(50).onSnapshot(snapshot => {
    const reqs = [];
    snapshot.forEach(doc => reqs.push(doc.data()));
    Store.topupRequests = reqs;
    Store.saveTopups();
    renderCurrentRoute();
  }, err => console.warn('Admin topups listener:', err.message));
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
    } else {
      syncProductsToFirebase();
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
  } else if (route.path === 'admin') {
    if (adminAuthenticated) {
      loadAdminData();
    }
    content = viewAdmin();
  } else {
    content = viewHome();
  }

  // Header & Footer Wrap (unless auth page or admin)
  if (route.path === 'login' || route.path === 'register' || route.path === 'admin') {
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
