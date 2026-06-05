"use client";

import { useState, useEffect } from "react";
import { useInView } from "../hooks/use-in-view";
import {
  Check,
  X,
  Infinity as InfinityIcon,
  History,
  Download,
  Upload,
  Tag,
  BookOpen,
  Sparkles,
  Star,
  Bell,
  Brain,
  Flame,
  Award,
  Search
} from "lucide-react";

export function Pricing() {
  const { ref, inView } = useInView(0.1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [remainingSeats, setRemainingSeats] = useState(77);

  const isAnnual = billingPeriod === "annual";

  // Fetch Brevo waitlist subscriber count on mount
  useEffect(() => {
    let active = true;
    async function fetchRemaining() {
      try {
        const res = await fetch("/api/waitlist-count");
        if (res.ok && active) {
          const data = await res.json();
          setRemainingSeats(data.remaining !== undefined ? data.remaining : 77);
        }
      } catch (err) {
        console.error("Error fetching waitlist count for pricing:", err);
      }
    }
    fetchRemaining();
    return () => {
      active = false;
    };
  }, []);

  const handleScrollToWaitlist = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const waitlistSec = document.getElementById("waitlist");
    if (waitlistSec) {
      waitlistSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine urgency color
  const getUrgencyClass = () => {
    if (remainingSeats < 20) {
      return "text-[#F87171] font-bold";
    }
    if (remainingSeats <= 50) {
      return "text-[#FBBF24] font-semibold";
    }
    return "text-[#a88bfa] font-semibold";
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

        {/* 1. BANNER OFFERTA redesign elegante */}
        <div className="inline-flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 rounded-2xl bg-[#a88bfa]/[0.08] border border-[#a88bfa]/20 shadow-md text-xs md:text-sm font-medium text-[#F0EEFF] mb-12 max-w-3xl mx-auto w-full">
          <span>✦ Offerta lancio · Primi 100 utenti: 3 mesi a €1,99 poi €4,99</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className={`${getUrgencyClass()} font-mono`}>🔥 {remainingSeats} posti rimasti</span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto text-left">
          
          {/* Plan 1: Free Card */}
          <div className="bg-white/[0.01] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative shadow-inner">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#8b8899] font-bold block mb-3">
                Free
              </span>
              <div className="text-4xl font-serif text-[#F0EEFF] font-medium mb-4">
                0€<span className="text-sm text-[#8b8899] font-sans">/mese</span>
              </div>
              <p className="text-xs text-[#8b8899] leading-relaxed mb-8 border-b border-white/[0.04] pb-6">
                Per tracciare l'essenziale e iniziare a familiarizzare con le tue spese quotidiane.
              </p>

              <ul className="flex flex-col gap-4 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span>25 transazioni/mese</span>
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
                  <span>Esportazione CSV/Excel</span>
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

          {/* Plan 2: Premium */}
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-b from-[#a88bfa] via-[#e879f9] to-[#60a5fa] relative flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 md:scale-[1.04] shadow-[0_20px_60px_rgba(168,139,250,0.25)] overflow-hidden z-20">
            {/* Animated border backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] opacity-25 blur-xl pointer-events-none" />

            <div className="bg-[#0b0914] rounded-[22px] p-8 md:p-10 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#a88bfa] font-bold">
                    Premium
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white font-extrabold bg-gradient-to-r from-[#a88bfa] to-[#e879f9] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    ✦ Più popolare
                  </span>
                </div>
                
                <div className="text-4xl font-serif text-[#F0EEFF] font-medium flex items-baseline gap-2 mb-1">
                  <span className="text-base text-[#8b8899] line-through font-sans">
                    5,99€
                  </span>
                  <span>{isAnnual ? "3,99€" : "4,99€"}</span>
                  <span className="text-sm text-[#8b8899] font-sans">/mese</span>
                </div>
                
                <p className="text-[10px] text-[#10B981] font-semibold h-4 mb-4">
                  {isAnnual ? "→ 47,88€/anno · risparmi 24€" : "Prima di €5,99 · Offerta lancio"}
                </p>
                
                <p className="text-xs text-[#8b8899] leading-relaxed mb-6 border-b border-[#a88bfa]/10 pb-6">
                  Tutto illimitato. Per riprendere il controllo totale della tua vita finanziaria.
                </p>

                {/* Detailed Features List with Custom Icons */}
                <ul className="flex flex-col gap-3.5 mb-8">
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <InfinityIcon className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Transazioni illimitate</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <History className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Storico completo a vita</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Download className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Export CSV/Excel</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Upload className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Bulk import transazioni</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Tag className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Categorie personalizzate (max 10)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <BookOpen className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Recap mensile narrativo</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Star className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Valorem Score</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Bell className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Notifiche proattive</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Search className="w-4 h-4 text-[#a88bfa] flex-shrink-0" />
                    <span>Ricerca globale avanzata</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://valorem-albomerigo-2081s-projects.vercel.app/pricing"
                className="w-full text-center py-3.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white shadow-md hover:shadow-[0_0_20px_rgba(168,139,250,0.4)] hover:brightness-110 transition-all duration-300"
              >
                Inizia Premium ora →
              </a>
            </div>
          </div>

          {/* Plan 3: Pro Card (Enhanced visuals) */}
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-r from-[#60a5fa] via-[#67e8f9] to-[#60a5fa] animate-border-flow relative flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-[0_20px_60px_rgba(96,165,250,0.15)] overflow-hidden z-20">
            {/* Animated blue border glow backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] via-[#67e8f9] to-[#60a5fa] opacity-25 blur-xl pointer-events-none" />

            <div className="bg-[#0b0914] rounded-[22px] p-8 md:p-10 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#60a5fa] font-bold">
                    Pro
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#060508] font-bold bg-[#60a5fa] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    🚀 Prossimamente · Early Adopter
                  </span>
                </div>
                <div className="text-4xl font-serif text-[#F0EEFF]/60 font-medium mb-1">
                  {isAnnual ? "7,99€" : "8,99€"}
                  <span className="text-sm text-[#8b8899] font-sans">/mese</span>
                </div>
                <p className="text-[10px] text-[#8b8899] h-4 mb-4">
                  {isAnnual ? "→ 95,88€/anno · risparmi 24€" : ""}
                </p>
                
                <div className="bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-xl p-3 mb-6 text-[10px] text-[#93c5fd] leading-relaxed">
                  🎁 <strong>Early Adopter Offer:</strong> 2 mesi gratis + 40% sconto permanente
                </div>

                <ul className="flex flex-col gap-3.5 mb-8 border-t border-white/[0.04] pt-6">
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Tutto di Premium</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Brain className="w-4 h-4 text-[#60a5fa] flex-shrink-0" />
                    <span>AI Coach con Claude (esclusivo)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>DNA Finanziario avanzato</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Valorem Academy accesso anticipato</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Modalità coppia 💑</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Report mensile via email</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Confronto con coetanei</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Supporto prioritario</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#e8e6f0]">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span>Accesso beta feature</span>
                  </li>
                </ul>
              </div>

              <a
                href="#waitlist"
                onClick={handleScrollToWaitlist}
                className="w-full text-center py-3 text-xs font-semibold rounded-xl border border-[#60a5fa]/30 hover:border-[#60a5fa]/50 text-[#60a5fa] hover:text-[#93c5fd] bg-white/[0.01] hover:bg-[#60a5fa]/5 transition-all mt-auto"
              >
                Entra in lista anticipata →
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
