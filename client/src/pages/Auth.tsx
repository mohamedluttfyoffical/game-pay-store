import { useAuth } from "@/_core/hooks/useAuth";
import { GameMark } from "@/components/GameMark";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const creating = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gp_remember_login");
    if (saved) {
      setIdentifier(saved);
      setEmail(saved);
    }
  }, []);

  const register = trpc.customerAuth.register.useMutation({
    onSuccess: async customer => {
      utils.customerAuth.me.setData(undefined, customer);
      await utils.customerAuth.me.invalidate();
      setLocation("/account");
      toast.success("تم إنشاء حسابك بنجاح");
    },
    onError: error => toast.error(error.message)
  });

  const login = trpc.customerAuth.login.useMutation({
    onSuccess: async customer => {
      const loginId = identifier.trim() || email.trim();
      if (rememberMe && loginId) {
        localStorage.setItem("gp_remember_login", loginId);
      } else {
        localStorage.removeItem("gp_remember_login");
      }
      utils.customerAuth.me.setData(undefined, customer);
      await utils.customerAuth.me.invalidate();
      setLocation("/account");
      toast.success("أهلًا بعودتك");
    },
    onError: error => toast.error(error.message)
  });

  useEffect(() => {
    if (!loading && user) setLocation("/account");
  }, [loading, user, setLocation]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (creating) {
      if (password !== confirmPassword) return toast.error("كلمة المرور وتأكيدها غير متطابقين.");
      if (!termsAccepted) return toast.error("يرجى الموافقة على شروط وسياسة المنصة للمتابعة.");
      register.mutate({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
    } else {
      const loginId = identifier.trim() || email.trim();
      if (!loginId) return toast.error("يرجى إدخال البريد الإلكتروني أو رقم الهاتف.");
      login.mutate({ identifier: loginId, email: loginId, password, rememberMe });
    }
  };

  const pending = register.isPending || login.isPending;

  return (
    <main dir="rtl" className="min-h-screen bg-[#07111f] p-4 text-slate-100 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/[.08] bg-[#0b1728] lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,.2),transparent_25%),linear-gradient(145deg,#0d2744,#07111f)] p-12 lg:flex lg:flex-col lg:justify-between">
          <GameMark />
          <div>
            <span className="eyebrow">حساب Game Pay</span>
            <h1 className="mt-6 text-5xl font-black leading-tight text-white">
              ألعابك، طلباتك،<br />
              <span className="text-gradient">وحسابك في مكان واحد.</span>
            </h1>
            <p className="mt-6 max-w-md leading-8 text-slate-300">
              سجّل بحساب خاص بالمتجر لتتابع الشحن والمنتجات الرقمية وتتحكم ببياناتك بخصوصية.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-cyan-300/15 bg-[#07111f]/30 p-4 text-sm leading-7 text-cyan-50">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
            كلمات المرور تُشفّر ولا تظهر لأحد، وجلساتك خاصة بحساب Game Pay.
          </div>
        </aside>

        <section className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
          <button onClick={() => setLocation("/")} className="mb-10 self-start lg:hidden">
            <GameMark />
          </button>
          <span className="eyebrow">{creating ? "حساب جديد" : "تسجيل الدخول"}</span>
          <h2 className="mt-4 text-3xl font-black text-white">{creating ? "أنشئ حسابك" : "مرحبًا بعودتك"}</h2>

          <form onSubmit={submit} className="mt-8 grid gap-4">
            {creating && (
              <label className="field-label">
                الاسم الكامل
                <div className="relative">
                  <UserRound className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: أحمد محمد"
                    className="field-input pr-10"
                  />
                </div>
              </label>
            )}

            {creating ? (
              <label className="field-label">
                البريد الإلكتروني
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="field-input pr-10"
                  />
                </div>
              </label>
            ) : (
              <label className="field-label">
                البريد الإلكتروني أو رقم الهاتف
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={e => {
                      setIdentifier(e.target.value);
                      setEmail(e.target.value);
                    }}
                    placeholder="name@example.com أو 01xxxxxxxxx"
                    className="field-input pr-10"
                  />
                </div>
              </label>
            )}

            {creating && (
              <label className="field-label">
                رقم الهاتف
                <div className="relative">
                  <Phone className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="field-input pr-10"
                  />
                </div>
              </label>
            )}

            <label className="field-label">
              كلمة المرور
              <div className="relative">
                <LockKeyhole className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete={creating ? "new-password" : "current-password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل مع رقم"
                  className="field-input px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {!creating && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
                  />
                  <span>تذكرني</span>
                </label>
              </div>
            )}

            {creating && (
              <label className="field-label">
                تأكيد كلمة المرور
                <div className="relative">
                  <LockKeyhole className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className="field-input pr-10"
                  />
                </div>
              </label>
            )}

            {creating && (
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none mt-1">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 cursor-pointer"
                />
                <span>
                  أوافق على <span className="text-cyan-300 underline underline-offset-2">شروط الاستخدام</span> و <span className="text-cyan-300 underline underline-offset-2">سياسة الخصوصية</span> الخاصة بمنصة Game Pay.
                </span>
              </label>
            )}

            <button
              disabled={pending}
              type="submit"
              className="btn-primary mt-2 w-full py-3.5 disabled:opacity-80 relative flex items-center justify-center gap-2"
            >
              {pending && (
                <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              <span>
                {pending
                  ? (creating ? "جارٍ إنشاء الحساب..." : "جارٍ تسجيل الدخول...")
                  : (creating ? "إنشاء الحساب" : "تسجيل الدخول")}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {creating ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
            <button
              onClick={() => setLocation(creating ? "/login" : "/register")}
              className="font-bold text-cyan-300"
            >
              {creating ? "سجّل الدخول" : "أنشئ حسابًا"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
