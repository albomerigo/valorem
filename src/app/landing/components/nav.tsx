"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setDrawerOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 border-b border-white/[0.06] backdrop-blur-xl ${
          scrolled ? "bg-[#060508]/90 py-3 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, "hero")}
            className="font-serif italic text-2xl font-semibold text-[#F0EEFF] flex items-center gap-2 tracking-tight cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#a88bfa] to-[#e879f9] animate-pulse" />
            valorem
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#come-funziona"
              onClick={(e) => handleLinkClick(e, "come-funziona")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Come funziona
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#features"
              onClick={(e) => handleLinkClick(e, "features")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Funzionalità
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#confronto"
              onClick={(e) => handleLinkClick(e, "comparison")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Confronto
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleLinkClick(e, "pricing")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Prezzi
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#academy"
              onClick={(e) => handleLinkClick(e, "academy")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Academy
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleLinkClick(e, "testimonials")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              Testimonianze
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
            <a
              href="#faq"
              onClick={(e) => handleLinkClick(e, "faq")}
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors relative group py-1"
            >
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] transition-all group-hover:w-full" />
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app/signin"
              className="text-sm text-[#8b8899] hover:text-[#e8e6f0] transition-colors font-medium px-4 py-2"
            >
              Accedi
            </a>
            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app/pricing"
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white font-medium text-sm px-5 py-2.5 shadow-md transition-transform hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
            >
              Inizia gratis →
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 text-[#e8e6f0] hover:text-white transition-colors"
            aria-label="Apri menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Slides from bottom) */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#0a0812] border-t border-white/[0.08] p-6 pb-10 transition-transform duration-300 transform ${
            drawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-serif italic text-xl text-[#F0EEFF] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#a88bfa] to-[#e879f9]" />
              valorem
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-[#8b8899] hover:text-white transition-colors"
              aria-label="Chiudi menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex flex-col gap-6 text-center mb-8">
            <a
              href="#come-funziona"
              onClick={(e) => handleLinkClick(e, "come-funziona")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Come funziona
            </a>
            <a
              href="#features"
              onClick={(e) => handleLinkClick(e, "features")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Funzionalità
            </a>
            <a
              href="#confronto"
              onClick={(e) => handleLinkClick(e, "comparison")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Confronto
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleLinkClick(e, "pricing")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Prezzi
            </a>
            <a
              href="#academy"
              onClick={(e) => handleLinkClick(e, "academy")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Academy
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleLinkClick(e, "testimonials")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              Testimonianze
            </a>
            <a
              href="#faq"
              onClick={(e) => handleLinkClick(e, "faq")}
              className="text-lg text-[#8b8899] hover:text-[#e8e6f0] transition-colors py-2"
            >
              FAQ
            </a>
          </div>

          {/* Drawer CTAs */}
          <div className="flex flex-col gap-4">
            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app/signin"
              className="w-full text-center py-3 text-base text-[#8b8899] hover:text-[#e8e6f0] transition-colors font-medium border border-white/[0.08] rounded-xl bg-white/[0.02]"
            >
              Accedi
            </a>
            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app/pricing"
              className="w-full text-center py-3 text-base text-white font-medium rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] shadow-md"
            >
              Inizia gratis →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
