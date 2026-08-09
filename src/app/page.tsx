import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import Stages from '@/components/landing/Stages';
import Features from '@/components/landing/Features';
import Footer from '@/components/layout/Footer';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';

export default function Home() {
  return (
    <DarkGradientBg>
      <main className="min-h-screen text-chalk flex flex-col font-arabic">
        <Navbar />
        <div className="flex-1">
          <Hero />
          <Stages />
          <Features />
        </div>
        <Footer />
      </main>
    </DarkGradientBg>
  );
}
