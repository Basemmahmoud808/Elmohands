import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import Stages from '@/components/landing/Stages';
import Features from '@/components/landing/Features';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-blackboard text-chalk flex flex-col font-arabic">
      <Navbar />

      <div className="flex-1">
        <Hero />
        <Stages />
        <Features />
      </div>

      <Footer />
    </main>
  );
}
