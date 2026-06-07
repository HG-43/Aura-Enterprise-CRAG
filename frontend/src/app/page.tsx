import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="ambient-bg relative min-h-screen">
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
