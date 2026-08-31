'use client';

import { Video, HelpCircle, CreditCard, TrendingUp, Lock, FileText, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Video,
    title: 'فيديوهات شرح عالية الدقة',
    description: 'مشاهدة مبسطة ومقسمة لكل الأفكار والقوانين مع إمكانية التقديم والتأخير والتحكم بالسرعة.',
  },
  {
    icon: HelpCircle,
    title: 'اختبارات تفاعلية MCQ',
    description: 'تقييم كفاءة ومستوى فهم الطالب بعد كل درس فوراً مع تصحيح تلقائي وعرض نموذج الإجابة.',
  },
  {
    icon: CreditCard,
    title: 'اشتراك وتفعيل مباشر وسهل',
    description: 'تحويل مرن عبر فودافون كاش وإنستاباي وتفعيل فوري لحساب الطالب دون تعقيد.',
  },
  {
    icon: TrendingUp,
    title: 'متابعة نسبة التقدم (%)',
    description: 'لوحة تحكم للطالب لعرض الدروس المكتملة، متوسط الدرجات، والاشتراك النشط.',
  },
  {
    icon: FileText,
    title: 'مذكرات وحلول PDF',
    description: 'رفع وتحميل مذكرات الشرح والتمارين المحلولة لكل درس بجودة طباعة ممتازة.',
  },
  {
    icon: Lock,
    title: 'حماية وأمان المحتوى',
    description: 'حماية مقاطع الفيديو بروابط مؤقتة مخصصة وعلامات مائية لحفظ حقوق المحتوى.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-transparent border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold shadow-cyan-glow">
            <CheckCircle className="w-4 h-4 text-cyan-electric" />
            <span>لماذا تختار منصة المهندس؟</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-chalk tracking-tight">
            مميزات مصممة خصيصاً لتفوق الطالب
          </h2>

          <p className="text-slate-600 dark:text-chalk-muted text-base sm:text-lg">
            كل ما يحتاجه طالب الرياضيات في مكان واحد، لتسهيل الفهم والتدريب والوصول للدرجة النهائية.
          </p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="chalk-card rounded-2xl p-8 space-y-4 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black font-extrabold shadow-cyan-glow">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-chalk">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-chalk-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
