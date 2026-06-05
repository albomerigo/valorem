"use client";

import { useState } from "react";
import { useInView } from "../hooks/use-in-view";
import { Check, X, Sparkles, Zap, Star } from "lucide-react";

export function Pricing() {
  const { ref, inView } = useInView(0.1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const isAnnual = billingPeriod === "annual";

  const handleScrollToWaitlist = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const waitlistSec = document.getElementById("waitlist");
    if (waitlistSec) {
      waitlistSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto text-center">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
          Piani
        </span>
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight mb-8">
          Semplice. <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">Trasparente</span>. Senza sorprese.
        </h2>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span
            className={`text-sm cursor-pointer transition-colors ${
              !isAnnual ? "text-[#F0EEFF] font-semibold" : "text-[#8b8899]"
            }`}
            onClick={() => setBillingPeriod("monthly")}
          >
            Mensile
          </span>
          
          <button
            onClick={() => setBillingPeriod(isAnnual ? "monthly" : "annual")}
            className="w-12 h-6 rounded-full bg-white/[0.06] border border-white/[0.1] relative flex items-center p-0.5 transition-colors focus:outline-none"
            aria-label="Toggle fatturazione"
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-r from-[#a88bfa] to-[#e879f9] shadow-md transform transition-transform duration-300 ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          
          <span
            className={`text-sm cursor-pointer transition-colors flex items-center gap-2 ${
              isAnnual ? "text-[#F0EEFF] font-semibold" : "text-[#8b8899]"
            }`}
            onClick={() => setBillingPeriod("annual")}
          >
            Annuale
            <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-full px-2 py-0.5 uppercase tracking-wide font-bold">
              Risparmia 2 mesi
            </span>
          </span>
        </div>

        {/* Launch Offer Banner */}
        <div className="max-w-3xl mx-auto mb-12 p-0.5 rounded-2xl bg-gradient-to-r from-[#FBBF24]/30 via-[#FBBF24]/10 to-[#FBBF24]/30 relative overflow-hidden">
          <div className="bg-[#1e1704]/90 backdrop-blur-md p-4 rounded-[14px] flex items-center justify-center gap-3 border border-[#FBBF24]/10">
            <span className="text-xl">🎁</span>
            <p className="text-xs md:text-sm text-[#FDE68A] text-left leading-relaxed">
              <strong>Offerta lancio:</strong> I primi 100 utenti Premium ricevono il primo mese a <strong>€1,99</strong>. Nessun codice richiesto — applicato automaticamente in cassa.
            </p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto text-left">
          {/* Plan 1: Free */}
          <div className="bg-[#0b0912] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8b8899] font-bold block mb-2">
                Free
              </span>
              <div className="text-4xl font-serif text-[#F0EEFF] font-medium mb-1">
                0€<span className="text-sm text-[#8b8899] font-sans">/mese</span>
              </div>
              <p className="text-xs text-[#8b8899] h-4 mb-4"></p>
              <p className="text-xs text-[#8b8899] leading-relaxed mb-6">
                Per tracciare l'essenziale e iniziare a familiarizzare con le tue spese.
              </p>

              <ul className="flex flex-col gap-3.5 mb-8 border-t border-white/[0.04] pt-6">
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>15 transazioni/mese</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>1 obiettivo attivo</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Solo mese corrente</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Dashboard e KPI</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Cimitero degli impulsi</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-white/20">
                  <X className="w-4 h-4 text-white/10 flex-shrink-0" />
                  <span>Storico completo a vita</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-white/20">
                  <X className="w-4 h-4 text-white/10 flex-shrink-0" />
                  <span>Esportazione dati</span>
                </li>
              </ul>
            </div>

            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app"
              className="w-full text-center py-3 text-xs font-semibold rounded-xl border border-white/[0.08] hover:border-white/20 text-[#e8e6f0] hover:text-white bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
              Inizia gratis
            </a>
          </div>

          {/* Plan 2: Premium (Featured with animated border) */}
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-b from-[#a88bfa] via-[#e879f9] to-[#60a5fa] relative flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 shadow-[0_20px_50px_rgba(168,139,250,0.15)] overflow-hidden">
            {/* Animated border helper block */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] opacity-20 blur-xl pointer-events-none" />

            <div className="bg-[#0c0a15] rounded-[22px] p-8 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#a88bfa] font-bold">
                    Premium
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white font-extrabold bg-gradient-to-r from-[#a88bfa] to-[#e879f9] px-2.5 py-1 rounded-full shadow-sm">
                    Più popolare
                  </span>
                </div>
                <div className="text-4xl font-serif text-[#F0EEFF] font-medium mb-1">
                  {isAnnual ? "3,99€" : "4,99€"}
                  <span className="text-sm text-[#8b8899] font-sans">/mese</span>
                </div>
                <p className="text-xs text-[#10B981] h-4 mb-4 font-medium">
                  {isAnnual ? "→ 47,88€/anno · risparmi 12€" : ""}
                </p>
                <p className="text-xs text-[#8b8899] leading-relaxed mb-6">
                  Tutto illimitato. Per riprendere il controllo totale della tua vita finanziaria.
                </p>

                <ul className="flex flex-col gap-3.5 mb-8 border-t border-white/[0.04] pt-6">
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Transazioni illimitate</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Obiettivi illimitati</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Storico completo a vita</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Esportazione CSV/Excel</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Importazione massiva</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>AI Coach di base</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://valorem-albomerigo-2081s-projects.vercel.app/pricing"
                className="w-full text-center py-3 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all"
              >
                Inizia Premium →
              </a>
            </div>
          </div>

          {/* Plan 3: Pro */}
          <div className="bg-[#0b0912] border border-[#60a5fa]/25 rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#60a5fa] font-bold">
                  Pro
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#060508] font-bold bg-[#60a5fa] px-2.5 py-1 rounded-full">
                  🚀 Prossimamente
                </span>
              </div>
              <div className="text-4xl font-serif text-[#F0EEFF]/60 font-medium mb-1">
                {isAnnual ? "7,99€" : "8,99€"}
                <span className="text-sm text-[#8b8899] font-sans">/mese</span>
              </div>
              <p className="text-xs text-[#10B981] h-4 mb-4 font-medium">
                {isAnnual ? "→ 95,88€/anno · risparmi 24€" : ""}
              </p>
              
              <div className="bg-[#60a5fa]/5 border border-[#60a5fa]/10 rounded-xl p-3 mb-6 text-xs text-[#93c5fd] leading-relaxed">
                🎁 <strong>Early adopter:</strong> I primi 100 iscritti in lista ricevono 2 mesi gratuiti + sconto del 30% permanente.
              </div>

              <ul className="flex flex-col gap-3.5 mb-8 border-t border-white/[0.04] pt-6">
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Tutto di Premium</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>AI Coach avanzato (Claude API)</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Modalità Coppia 💑</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Report mensili automatici</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>Sync bancario automatico</span>
                </li>
              </ul>
            </div>

            <a
              href="#waitlist"
              onClick={handleScrollToWaitlist}
              className="w-full text-center py-3 text-xs font-semibold rounded-xl border border-[#60a5fa]/30 hover:border-[#60a5fa]/50 text-[#60a5fa] hover:text-[#93c5fd] bg-white/[0.01] hover:bg-[#60a5fa]/5 transition-all"
            >
              Entra in lista →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
