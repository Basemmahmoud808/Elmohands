import Link from 'next/link';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/70 backdrop-blur-md border-t border-chalk/10 pt-16 pb-8 text-chalk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-chalk/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brass-compass flex items-center justify-center text-blackboard font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-chalk">
                المهندس — منصة الرياضيات
              </span>
            </Link>
            <p className="text-sm text-chalk-muted leading-relaxed max-w-md">
              منصة تعليمية متخصصة تحت إشراف م/ رضا خيرت، لتبسيط مناهج الرياضيات للمرحلة الإعدادية والصف الأول الثانوي بأحدث الوسائل التفاعلية.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-brass-compass uppercase tracking-wider">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-sm text-chalk-muted font-medium">
              <li>
                <Link href="#stages" className="hover:text-chalk transition-colors">
                  المراحل الدراسية
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-chalk transition-colors">
                  مميزات المنصة
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-chalk transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-chalk transition-colors">
                  إنشاء حساب طالب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-brass-compass uppercase tracking-wider">
              تواصل مع المدرس
            </h4>
            <ul className="space-y-2.5 text-sm text-chalk-muted font-medium">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brass-compass" />
                <span dir="ltr">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brass-compass" />
                <span>support@almohands-math.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brass-compass" />
                <span>جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 text-center text-xs text-chalk-muted font-medium">
          <p>© {new Date().getFullYear()} منصة المهندس — جميع الحقوق محفوظة م/ رضا خيرت.</p>
        </div>

      </div>
    </footer>
  );
}
