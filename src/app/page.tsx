import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import Stages from '@/components/landing/Stages';
import Features from '@/components/landing/Features';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-blackboard text-chalk flex flex-col font-arabic">
      
      {/* Top Banner Notice for Phase 01 */}
      <div className="bg-gradient-to-r from-blue-ink via-blackboard-dark to-blue-ink border-b border-brass-compass/20 py-2.5 px-4 text-center text-xs font-bold text-chalk flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-brass-compass animate-pulse" />
        <span>مرحباً بك في النسخة الأولية لمنصة المهندس التعليمية (Phase 01 Setup Complete)</span>
        <span className="px-2 py-0.5 rounded bg-brass-compass/20 text-brass-compass border border-brass-compass/30">
          م/ رضا خيرت
        </span>
      </div>

      <Navbar />

      <div className="flex-1">
        <Hero />
        <Stages />
        <Features />

        {/* Phase 01 Setup Verification Box */}
        <section className="py-12 bg-blackboard-dark border-t border-chalk/10">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass-compass/10 text-brass-compass text-xs font-extrabold border border-brass-compass/30">
              <ShieldCheck className="w-4 h-4" />
              <span>جاهزية البيئة الأساسية (Phase 01 Verified)</span>
            </div>

            <h3 className="text-2xl font-black text-chalk">
              تم بناء التأسيس البرمجي والتصميمي بنجاح
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-chalk/90">
              <div className="p-3 rounded-xl bg-blackboard border border-chalk/10 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brass-compass" />
                <span>Next.js 14+ App Router</span>
              </div>
              <div className="p-3 rounded-xl bg-blackboard border border-chalk/10 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brass-compass" />
                <span>RTL Layout + Cairo Font</span>
              </div>
              <div className="p-3 rounded-xl bg-blackboard border border-chalk/10 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brass-compass" />
                <span>Blackboard Palette</span>
              </div>
              <div className="p-3 rounded-xl bg-blackboard border border-chalk/10 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brass-compass" />
                <span>Environment Blueprint</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

    </main>
  );
}
