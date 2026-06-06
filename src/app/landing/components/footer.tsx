"use client";

import { Heart } from "lucide-react";

export function Footer() {
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-white/[0.04] bg-[#060508] relative z-10 px-6 py-16">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Four columns grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4 text-left">
            <span className="font-serif italic text-2xl font-semibold text-[#F0EEFF] tracking-tight">
              valorem
            </span>
            <p className="text-xs text-[#8b8899] leading-relaxed max-w-[240px]">
              Finance coach comportamentale italiano. Non una banca — un compagno che ti aiuta a vedere chiaramente le tue scelte finanziarie.
            </p>
            <div className="text-xs text-[#8b8899] flex items-center gap-1.5 mt-2">
              Made with <Heart className="w-3.5 h-3.5 text-[#e879f9] fill-[#e879f9] animate-pulse" /> in Italy
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-[10px] uppercase tracking-wider text-[#a88bfa] font-bold">
              Prodotto
            </span>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollToSection(e, "features")}
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Funzionalità
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleScrollToSection(e, "pricing")}
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Prezzi
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  onClick={(e) => handleScrollToSection(e, "demo")}
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Demo
                </a>
              </li>
              <li>
                <a
                  href="#confronto"
                  onClick={(e) => handleScrollToSection(e, "comparison")}
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Confronto
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-[10px] uppercase tracking-wider text-[#a88bfa] font-bold">
              Legale
            </span>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="/privacy"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/termini"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Termini di Servizio
                </a>
              </li>
              <li>
                <a
                  href="/cookie"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleScrollToSection(e, "faq")}
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  GDPR FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: App */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-[10px] uppercase tracking-wider text-[#a88bfa] font-bold">
              App
            </span>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="https://valorem-albomerigo-2081s-projects.vercel.app"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Apri l'app
                </a>
              </li>
              <li>
                <a
                  href="https://valorem-albomerigo-2081s-projects.vercel.app/signin"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Accedi
                </a>
              </li>
              <li>
                <a
                  href="https://valorem-albomerigo-2081s-projects.vercel.app"
                  className="text-[#8b8899] hover:text-[#F0EEFF] transition-colors"
                >
                  Registrati gratis
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8b8899]">
          <span>© 2026 Valorem · Tutti i diritti riservati</span>
          <div className="flex gap-4">
            <span>Next.js · Supabase · Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
