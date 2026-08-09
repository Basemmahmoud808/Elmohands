'use client';

import { Video, HelpCircle, KeyRound, TrendingUp, Lock, FileText, CheckCircle } from 'lucide-react';

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
    icon: KeyRound,
    title: 'تفعيل سريع بأكواد الشحن',
    description: 'نظام اشتراكات مباشر ومبسط باستخدام أكواد شحن سريعة بدون تعقيدات الدفع الإلكتروني.',
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
    <section id="features" className="py-20 bg-blackboard-pattern border-t border-chalk/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-ink/20 border border-blue-ink/40 text-chalk text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-brass-compass" />
            <span>لماذا تختار منصة المهندس؟</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-chalk tracking-tight">
            مميزات مصممة خصيصاً لتفوق الطالب
          </h2>

          <p className="text-chalk-muted text-base sm:text-lg">
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
                className="chalk-card rounded-2xl p-8 space-y-4 border border-chalk/10 hover:border-brass-compass/30"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-ink to-blackboard-light flex items-center justify-center text-brass-compass border border-chalk/10">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-chalk">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-chalk-muted leading-relaxed">
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
