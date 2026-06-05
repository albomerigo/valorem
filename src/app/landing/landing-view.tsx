"use client";

import { useInView } from "./hooks/use-in-view";
import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Problem } from "./components/problem";
import { HowItWorks } from "./components/how-it-works";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";
import { Demo } from "./components/demo";
import { Pricing } from "./components/pricing";
import { Testimonials } from "./components/testimonials";
import { Academy } from "./components/academy";
import { FAQ } from "./components/faq";
import { Waitlist } from "./components/waitlist";
import { Footer } from "./components/footer";

// Reusable wrapper to trigger fade-up scroll animations on each section
function SectionWrapper({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`fade-up ${inView ? "in-view" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingView() {
  return (
    <div className="bg-[#060508] text-[#e8e6f0] min-h-screen relative overflow-hidden selection:bg-[#a88bfa]/20 selection:text-[#a88bfa]">
      
      {/* 2. PURE CSS LIGHT FLOATING PARTICLE SYSTEM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => {
          const size = 1.5 + (i % 3); // 1.5px, 2.5px, 3.5px
          const left = (i * 7 + 13) % 100;
          const top = (i * 9 + 7) % 100;
          const delay = -(i * 1.5) % 8;
          const duration = 12 + (i % 5) * 4; // 12s, 16s, 20s, 24s, 28s
          
          return (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-float-slow"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* Navbar */}
      <Nav />

      {/* Main Content Sections */}
      <main className="relative z-10 flex flex-col">
        {/* Hero handles its own staggered entrance animations */}
        <Hero />
        
        <SectionWrapper>
          <Problem />
        </SectionWrapper>

        <SectionWrapper>
          <HowItWorks />
        </SectionWrapper>

        <SectionWrapper>
          <Features />
        </SectionWrapper>

        <SectionWrapper>
          <Comparison />
        </SectionWrapper>

        <SectionWrapper>
          <Demo />
        </SectionWrapper>

        <SectionWrapper>
          <Pricing />
        </SectionWrapper>

        <SectionWrapper>
          <Testimonials />
        </SectionWrapper>

        <SectionWrapper>
          <Academy />
        </SectionWrapper>

        <SectionWrapper>
          <FAQ />
        </SectionWrapper>

        <SectionWrapper>
          <Waitlist />
        </SectionWrapper>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
