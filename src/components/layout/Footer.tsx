import Link from 'next/link';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100/80 dark:bg-black/80 backdrop-blur-2xl border-t border-slate-200 dark:border-cyan-electric/20 pt-16 pb-8 text-slate-800 dark:text-chalk transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-300 dark:border-slate-800/80">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-electric flex items-center justify-center text-black font-extrabold shadow-cyan-glow">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 dark:text-chalk">
                المهندس
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-chalk-muted leading-relaxed max-w-md">
              منصتك الأولى لتعلم وفهم الرياضيات تحت إشراف م/ رضا خيرت، لتبسيط المناهج للمرحلة الإعدادية والصف الأول الثانوي بأحدث الوسائل التفاعلية.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-cyan-electric uppercase tracking-wider">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-chalk-muted font-medium">
              <li>
                <Link href="#stages" className="hover:text-cyan-electric transition-colors">
                  المراحل الدراسية
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-electric transition-colors">
                  مميزات المنصة
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-cyan-electric transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-cyan-electric transition-colors">
                  إنشاء حساب طالب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-cyan-electric uppercase tracking-wider">
              تواصل مع المدرس
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-chalk-muted font-medium">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-electric" />
                <a href="https://wa.me/201008901896" target="_blank" rel="noopener noreferrer" dir="ltr" className="hover:text-cyan-electric transition-colors">
                  01008901896
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-electric" />
                <a href="mailto:Khyratreda@gmail.com" className="hover:text-cyan-electric transition-colors">
                  Khyratreda@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-electric" />
                <span>الدقهلية - منية النصر - النزل</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-chalk-muted font-medium">
          <p>© {new Date().getFullYear()} منصة المهندس — جميع الحقوق محفوظة م/ رضا خيرت.</p>
          <p className="flex items-center gap-1">
            <span>صنع بواسطة</span>
            <a
              href="https://www.facebook.com/share/17rn8UEngV/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-electric font-black hover:underline transition-all inline-flex items-center gap-1"
            >
              باسم
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
