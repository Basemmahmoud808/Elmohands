# Almohands – منصة المهندس التعليمية
### م/ رضا خيرت — تعليم الرياضيات (إعدادي + أولى ثانوي)

منصة تعليمية متخصصة في شرح ومتابعة مناهج الرياضيات للمرحلة الإعدادية والصف الأول الثانوي في مصر، مصممة بهوية السبورة المصرية التقليدية وبرامجيًا بالكامل باستخدام أحدث تقنيات الويب.

---

## 🎨 الهوية البصرية (Visual Identity)

- **أخضر السبورة (`#22322A`):** اللون الرئيسي للسبورة التعليمية.
- **الطباشير (`#E7E2D3`):** لون النصوص والرؤوس الفاتحة.
- **حبر أزرق (`#1F3A5F`):** للأزرار الرئيسية والتفاعلية.
- **قلم أحمر (`#A3402F`):** للتنبيهات والدرجات والإشارات الهامة.
- **نحاس البرجل (`#AD8A4E`):** لتمييز المعادلات والرموز الهندسية والرياضية.
- **ورق الكشكول (`#E9E1C8`):** للبطاقات والخلفيات الثانوية الفاتحة.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Custom JWT + Refresh Token Rotation + bcrypt (Secure password hashing in Supabase PostgreSQL)
- **Database & Storage:** Supabase PostgreSQL + Row Level Security (RLS) + Supabase Storage
- **Security:** Anti-DDoS rate limiting, HTTP-only SameSite cookies, Server-side role RBAC, Short-lived tokens
- **Math Rendering:** KaTeX

---

## 🚀 تشغيل المشروع محلياً (Getting Started)

1. **تثبيت التبعيات:**
   ```bash
   npm install
   ```

2. **تهيئة ملف البيئة:**
   قم بنسخ `.env.local.example` إلى `.env.local` وتحديث القيم المطلوبة.

3. **تشغيل الخادم المحلي:**
   ```bash
   npm run dev
   ```
   افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

---

## 📂 هيكل المجلدات (Folder Structure)

```
d:\Almohands\
├── src/
│   ├── app/              # Next.js App Router (Pages, Layouts, APIs)
│   ├── components/       # UI Components (Blackboard Header, Prep Cards, UI Primitives)
│   ├── lib/              # Utility functions, Supabase & Clerk clients
│   └── types/            # TypeScript interface definitions
├── public/               # Static assets & images
├── .env.local.example    # Environment variables blueprint
├── PROGRESS.md           # Master roadmap & Phase checklist
└── README.md             # Project documentation
```
