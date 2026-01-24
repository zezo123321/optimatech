# خطوات رفع المشروع على Cloudflare Pages

## 📋 الملفات الموجودة
```
optimatech/
├── index.html              # الصفحة الرئيسية
└── functions/
    └── api/
        └── contact.js      # Function لمعالجة الفورم
```

## 🚀 خطوات النشر

### 1️⃣ رفع الملفات على Cloudflare Pages

**عبر Cloudflare Dashboard:**
1. اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com)
2. اختر **Pages** من القائمة الجانبية
3. اضغط **Create a project**
4. اختر **Upload assets**
5. ارفع المجلد الكامل (index.html + functions/)

**أو عبر Git:**
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

ثم في Cloudflare Pages:
- Connect to Git repository
- اختار الريبو
- Build settings: اتركها فاضية (static site)
- Deploy!

---

### 2️⃣ إعداد Resend API

1. **سجل في [Resend](https://resend.com)**
   - مجاني للـ 100 إيميل/يوم
   - مش محتاج كريدت كارد

2. **احصل على API Key:**
   - من Dashboard → API Keys
   - Create API Key
   - احفظ الـ Key (هتظهر مرة واحدة فقط!)

3. **تأكد من الدومين:**
   - في Resend Dashboard → Domains
   - ضيف دومينك أو استخدم `onboarding@resend.dev` للتجربة
   - لو عاوز تستخدم دومينك، هتحتاج تضيف DNS records

---

### 3️⃣ إضافة Secrets في Cloudflare Pages

1. في Cloudflare Dashboard → Pages
2. اختار مشروعك
3. اذهب إلى **Settings** → **Environment variables**
4. ضيف المتغيرات دي:

| Variable Name | Example Value | ملاحظات |
|--------------|---------------|----------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` | من Resend Dashboard |
| `MAIL_FROM` | `"OptimaTech <[email protected]>"` | اسم المرسل + إيميل Resend |
| `MAIL_TO` | `[email protected]` | إيميلك اللي هتستقبل عليه |

⚠️ **هام:** ضيف الـ variables دي في **Production** و **Preview** environments

5. اضغط **Save**
6. **Redeploy** المشروع عشان التعديلات تاخد مفعول

---

## ✅ اختبار الفورم

### محليًا (اختياري):
```bash
npm install -g wrangler
cd "optimatech"

# ضيف الـ secrets
echo "RESEND_API_KEY=re_your_key" >> .dev.vars
echo "MAIL_FROM=\"OptimaTech <[email protected]>\"" >> .dev.vars
echo "MAIL_TO=your-email@example.com" >> .dev.vars

# شغل السيرفر المحلي
npx wrangler pages dev . --port 8080
```

ثم افتح: http://localhost:8080

### على الإنترنت:
1. افتح موقعك المنشور: `https://your-project.pages.dev`
2. املا الفورم
3. اضغط "ابعت طلب تواصل"
4. لو نجح، هتشوف صفحة تأكيد
5. شيك على إيميلك (اللي حددته في `MAIL_TO`)

---

## 🔍 Troubleshooting

**لو الإيميل مش واصل:**
1. شيك Cloudflare Pages Logs:
   - Project → Deployments → Latest deployment → Functions
2. تأكد من `RESEND_API_KEY` صح
3. تأكد من `MAIL_FROM` domain معتمد في Resend
4. شيك Resend Dashboard → Logs

**لو الفورم مش بيشتغل:**
1. شيك الـ F12 Console في المتصفح
2. تأكد من الـ Function اتعملها deploy صح
3. جرب Redeploy من Cloudflare Dashboard

---

## 📚 مصادر إضافية

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/platform/functions/)
- [Resend API Docs](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudflare + Resend Tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)

---

## 🎉 خلاص!

دلوقتي لما حد يملا الفورم:
1. ✅ البيانات تروح لـ `/api/contact`
2. ✅ الـ Function تبعت إيميل عبر Resend
3. ✅ الزائر يشوف صفحة تأكيد
4. ✅ أنت تستقبل إيميل فيه التفاصيل

**محتاج أي مساعدة تانية؟** 🚀
