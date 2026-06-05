"use client";

import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Problem } from "./components/problem";
import { HowItWorks } from "./components/how-it-works";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";
import { Demo } from "./components/demo";
import { Pricing } from "./components/pricing";
import { Testimonials } from "./components/testimonials";
import { FAQ } from "./components/faq";
import { Waitlist } from "./components/waitlist";
import { Footer } from "./components/footer";

export function LandingView() {
  return (
    <div className="bg-[#060508] text-[#e8e6f0] min-h-screen relative overflow-hidden selection:bg-[#a88bfa]/20 selection:text-[#a88bfa]">
      {/* Navbar */}
      <Nav />

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Comparison />
        <Demo />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Waitlist />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
