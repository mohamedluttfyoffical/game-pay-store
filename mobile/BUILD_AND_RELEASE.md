# Game Pay Mobile Packaging

يحتوي هذا المشروع على غلاف Capacitor لتشغيل متجر **Game Pay** المنشور داخل تطبيق Android وiOS. يستخدم الغلاف الموقع المنشور عبر HTTPS، ولذلك تبقى المنتجات والحسابات والطلبات والمحتوى متزامنة مع نسخة الويب دون إنشاء مصدر بيانات منفصل.

## الإعدادات الأساسية

| الإعداد | القيمة الافتراضية | متى يجب تغييره؟ |
|---|---|---|
| عنوان المتجر | `https://gamepayshop-3m9w2yls.manus.space` | عند ربط نطاق إنتاج نهائي أو تغيير نطاق المتجر. |
| معرّف الحزمة | `com.gamepay.store` | قبل أول رفع، إذا كان المعرّف محجوزًا أو لا يطابق اسم نطاقك وكيانك التجاري. |
| اسم التطبيق | `Game Pay` | عند تغيير الاسم التجاري الظاهر في المتاجر. |

يمكن ضبط عنوان المتجر أو معرّف الحزمة أثناء مزامنة المشروع:

```bash
CAPACITOR_SERVER_URL="https://your-domain.example" \
CAPACITOR_APP_ID="com.yourcompany.gamepay" \
pnpm mobile:sync
```

## Android

بعد تثبيت Android Studio وAndroid SDK وربط مسار SDK، نفّذ الخطوات التالية من جذر المشروع:

```bash
pnpm build
pnpm mobile:sync
pnpm mobile:android:apk
pnpm mobile:android:aab
```

ينتج `assembleRelease` ملف APK للتثبيت أو التوزيع الداخلي، بينما ينتج `bundleRelease` ملف AAB المناسب لرفع إصدار Android إلى متجر Google Play. قبل رفع إصدار إنتاج، يجب إنشاء مفتاح توقيع Release وحفظه خارج المستودع ثم ضبطه في إعدادات Gradle المحلية أو في نظام CI الآمن.

تم التحقق في بيئة التطوير من نجاح بناء حزمة Android التجريبية غير الموقعة. يظهر الملف الناتج في:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

هذه الحزمة مناسبة للاختبار على جهاز Android فقط، وليست ملف رفع إنتاج إلى Google Play.

## iOS

يتطلب إخراج IPA بيئة macOS مع Xcode وحساب Apple Developer وشهادات التوقيع وملف Provisioning Profile. على جهاز macOS:

```bash
pnpm build
pnpm mobile:ios:open
```

افتح مشروع `ios/App/App.xcodeproj` في Xcode، واختر فريق Apple الصحيح ومعرّف الحزمة النهائي، ثم استخدم **Archive** لإنشاء الحزمة ورفعها إلى App Store Connect. لا يمكن إنشاء IPA موقّع من بيئة Linux الحالية لغياب Xcode وشهادات Apple.

## قائمة الجاهزية قبل الرفع

- تأكد أن عنوان المتجر النهائي يعمل عبر HTTPS وأن شاشة تسجيل الدخول والشراء تعملان على جهاز فعلي.
- استبدل أصول التطبيق الافتراضية بأيقونة Game Pay النهائية ومقاسات لقطات المتجر المطلوبة.
- اضبط سياسة الخصوصية ورابط الدعم والبريد الرسمي في بيانات Google Play وApp Store Connect.
- لا تحفظ مفاتيح Android أو شهادات Apple أو كلمات مرور التوقيع داخل المستودع أو ملفات المشروع.

## مراجع

[1]: https://capacitorjs.com/docs/basics/workflow "Capacitor Developer Workflow"
[2]: https://developer.android.com/studio/publish/app-signing "Android App Signing"
[3]: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/ "Upload builds to App Store Connect"
