"use client";

import { useState } from "react";
import { useInView } from "../hooks/use-in-view";
import { Sparkles, Clock, Music, Trash2, Smartphone, DollarSign, TrendingUp } from "lucide-react";

export function Features() {
  const { ref: headerRef, inView: headerInView } = useInView(0.1);
  const { ref: f1Ref, inView: f1InView } = useInView(0.15);
  const { ref: f2Ref, inView: f2InView } = useInView(0.15);
  const { ref: f3Ref, inView: f3InView } = useInView(0.15);
  const { ref: f4Ref, inView: f4InView } = useInView(0.15);
  const { ref: f5Ref, inView: f5InView } = useInView(0.15);

  // Feature 1: Interactive Slider States
  const [stipendio, setStipendio] = useState(1800);
  const [costiFissi, setCostiFissi] = useState(850);
  const [risparmio, setRisparmio] = useState(200);
  const safeToSpend = Math.max(0, (stipendio - costiFissi - risparmio) / 30);

  // Feature 2: Time Translator Animation State
  const [showTime, setShowTime] = useState(false);

  return (
    <section id="features" className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <div
        ref={headerRef}
        className={`mb-20 transition-all duration-700 ${
          headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
          Funzionalità
        </span>
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight">
          Tutto quello che ti serve, <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">niente di troppo</span>.
        </h2>
      </div>

      <div className="flex flex-col gap-24 md:gap-36">
        {/* Feature 1: Safe-to-Spend Slider */}
        <div
          ref={f1Ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            f1InView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#a88bfa]/10 border border-[#a88bfa]/20 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-[#a88bfa]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0EEFF] font-medium mb-4">
              Safe-to-Spend
            </h3>
            <p className="text-sm text-[#8b8899] leading-relaxed mb-6">
              Il numero che cambia tutto. Ogni mattina sai esattamente quanto puoi spendere oggi in modo sicuro — calcolato su reddito, costi fissi e obiettivi di risparmio. Non un budget statico, ma un compagno che si adatta a te in tempo reale.
            </p>
          </div>
          <div className="bg-[#0b0912] border border-white/[0.06] rounded-3xl p-6 md:p-8 relative shadow-lg">
            <h4 className="text-xs uppercase tracking-wider text-[#a88bfa] font-bold mb-6">
              Simula il tuo budget giornaliero
            </h4>
            <div className="flex flex-col gap-5 mb-6">
              {/* Stipendio Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b8899]">Stipendio netto:</span>
                  <span className="text-[#F0EEFF] font-mono">{stipendio.toLocaleString()}€</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4000"
                  step="100"
                  value={stipendio}
                  onChange={(e) => setStipendio(Number(e.target.value))}
                  className="w-full accent-[#a88bfa] cursor-pointer"
                />
              </div>

              {/* Costi Fissi Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b8899]">Costi fissi (affitto, bollette):</span>
                  <span className="text-[#FBBF24] font-mono">{costiFissi.toLocaleString()}€</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={costiFissi}
                  onChange={(e) => setCostiFissi(Number(e.target.value))}
                  className="w-full accent-[#a88bfa] cursor-pointer"
                />
              </div>

              {/* Risparmio Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b8899]">Obiettivo risparmio:</span>
                  <span className="text-[#60a5fa] font-mono">{risparmio.toLocaleString()}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={risparmio}
                  onChange={(e) => setRisparmio(Number(e.target.value))}
                  className="w-full accent-[#a88bfa] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Result */}
            <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-[#8b8899]">Safe-to-Spend oggi:</span>
              <span className="text-2xl font-serif text-[#a88bfa] font-bold">
                {safeToSpend.toFixed(2).replace(".", ",")}€
              </span>
            </div>
          </div>
        </div>

        {/* Feature 2: Time Translator */}
        <div
          ref={f2Ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            f2InView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="md:order-2 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-[#60a5fa]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0EEFF] font-medium mb-4">
              Traduttore € → Tempo
            </h3>
            <p className="text-sm text-[#8b8899] leading-relaxed mb-6">
              120€ di scarpe non sono solo 120€ — sono 6 ore del tuo lunedì di lavoro. Vedere ogni spesa tradotta in ore di vita cambia radicalmente la tua prospettiva d'acquisto e allinea la spesa alle tue reali energie.
            </p>
          </div>
          <div className="md:order-1 bg-[#0b0912] border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg relative min-h-[220px]">
            <span className="text-xs text-[#8b8899] mb-4">Clicca per convertire la spesa</span>
            
            {/* Toggle Card */}
            <div
              onClick={() => setShowTime(!showTime)}
              className="w-64 h-28 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#60a5fa]/30 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-md select-none"
            >
              {!showTime ? (
                <div className="text-center animate-fade-in">
                  <div className="text-xs text-[#8b8899] uppercase tracking-wider mb-1">Costo Scarpe</div>
                  <div className="text-3xl font-serif text-[#F0EEFF]">120,00€</div>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="text-xs text-[#60a5fa] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Tempo Equivalente
                  </div>
                  <div className="text-3xl font-serif text-[#60a5fa] font-bold">
                    6 ore
                  </div>
                  <div className="text-[10px] text-[#8b8899] mt-0.5">di lavoro (netto 20€/ora)</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature 3: Spotify Wrapped-style Recap */}
        <div
          ref={f3Ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            f3InView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#e879f9]/10 border border-[#e879f9]/20 flex items-center justify-center mb-6">
              <Music className="w-6 h-6 text-[#e879f9]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0EEFF] font-medium mb-4">
              Recap narrativo mensile
            </h3>
            <p className="text-sm text-[#8b8899] leading-relaxed mb-6">
              A fine mese non ti presentiamo aride tabelle Excel o grafici a torta intimidatori. Ricevi una storia scritta appositamente sui tuoi dati finanziari, i tuoi picchi di spesa, e un'analisi comportamentale empatica ed onesta.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1535] to-[#0a0812] border border-[#e879f9]/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative vinyl/circle gradient */}
            <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-[#e879f9]/10 blur-2xl" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase tracking-wider text-[#e879f9] bg-[#e879f9]/10 px-2.5 py-1 rounded-full font-bold">
                Maggio 2026
              </span>
              <Music className="w-4 h-4 text-[#e879f9] animate-pulse" />
            </div>
            
            <h4 className="font-serif italic text-2xl text-[#F0EEFF] mb-4">
              "Il mese del costruttore"
            </h4>
            
            <p className="text-sm text-[#c0b8d0] leading-relaxed mb-4">
              Questo mese hai investito l'equivalente di 12 ore del tuo tempo. Le tue spese extra sono scese del 14%, lasciandoti con un Safe-to-Spend finale più rilassato. La tua abitudine migliore? I pranzi fatti in casa.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-xs text-[#8b8899]">Obiettivo Risparmio: Raggiunto al 105%</span>
            </div>
          </div>
        </div>

        {/* Feature 4: Cimitero degli Impulsi */}
        <div
          ref={f4Ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            f4InView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="md:order-2 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#a88bfa]/10 border border-[#a88bfa]/20 flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6 text-[#a88bfa]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0EEFF] font-medium mb-4">
              Cimitero degli impulsi
            </h3>
            <p className="text-sm text-[#8b8899] leading-relaxed mb-6">
              Ogni volta che resisti a una spesa impulsiva, seppelliscila nel Cimitero degli Impulsi scrivendo l'importo e il motivo. A fine mese, guarda la cifra esatta che hai salvato. La rinuncia si trasforma in orgoglio visibile.
            </p>
          </div>
          <div className="md:order-1 bg-[#0b0912] border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-lg">
            <h4 className="text-xs uppercase tracking-wider text-[#a88bfa] font-bold pb-2 border-b border-white/[0.04]">
              Buried Impulses
            </h4>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex flex-col">
                <span className="text-xs text-[#F0EEFF] font-medium">Abbonamento palestra annuale</span>
                <span className="text-[10px] text-[#8b8899]">"Ci andrei solo due volte"</span>
              </div>
              <span className="text-sm font-mono text-[#10B981] font-semibold">+ 420,00€</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex flex-col">
                <span className="text-xs text-[#F0EEFF] font-medium">Giubbotto firmato</span>
                <span className="text-[10px] text-[#8b8899]">"Ne ho già tre simili"</span>
              </div>
              <span className="text-sm font-mono text-[#10B981] font-semibold">+ 180,00€</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex flex-col">
                <span className="text-xs text-[#F0EEFF] font-medium">Cena delivery pigra</span>
                <span className="text-[10px] text-[#8b8899]">"Ho cucinato pasta e fagioli"</span>
              </div>
              <span className="text-sm font-mono text-[#10B981] font-semibold">+ 28,50€</span>
            </div>
          </div>
        </div>

        {/* Feature 5: PWA Mobile */}
        <div
          ref={f5Ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            f5InView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center mb-6">
              <Smartphone className="w-6 h-6 text-[#60a5fa]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0EEFF] font-medium mb-4">
              PWA mobile installabile
            </h3>
            <p className="text-sm text-[#8b8899] leading-relaxed mb-6">
              Valorem è una Progressive Web App. Funziona fluida come un'applicazione nativa su iOS e Android, ma senza le frizioni dell'App Store. Installala sulla tua home screen in un secondo e portala sempre con te.
            </p>
            <ul className="flex flex-col gap-2.5 text-xs text-[#8b8899]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Installazione immediata da Safari o Chrome
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Layout e aree di tocco ottimizzati per cellulari
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Design responsive che si adatta alle aree notch
              </li>
            </ul>
          </div>
          
          {/* Phone Mockup Frame */}
          <div className="flex justify-center relative">
            <div className="absolute w-64 h-64 bg-[#60a5fa]/5 rounded-full blur-3xl -z-10" />
            <div className="w-64 bg-[#0b0912] border border-[#60a5fa]/25 rounded-[36px] p-4 shadow-2xl relative transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              {/* Phone Notch */}
              <div className="w-24 h-5 bg-[#060508] rounded-b-2xl mx-auto mb-4 flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-8 h-1 rounded-full bg-white/10" />
              </div>
              
              {/* Screen Mockup */}
              <div className="bg-[#060508] rounded-[24px] p-4 border border-white/[0.04] text-left">
                <span className="text-[8px] uppercase tracking-wider text-[#8b8899] block mb-2">Dashboard</span>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <span className="text-[7px] text-[#8b8899] block">Safe-to-Spend</span>
                    <span className="text-xs font-serif text-[#a88bfa] font-bold">47,30€</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <span className="text-[7px] text-[#8b8899] block">Speso oggi</span>
                    <span className="text-xs font-serif text-[#e879f9] font-bold">12,80€</span>
                  </div>
                </div>

                <div className="h-10 bg-white/[0.01] border border-white/[0.03] rounded-lg mb-3 relative overflow-hidden flex items-end">
                  {/* Miniature Sparkline path */}
                  <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,25 Q25,10 50,20 T100,15 L100,30 L0,30 Z" fill="rgba(168, 139, 250, 0.08)" />
                    <path d="M0,25 Q25,10 50,20 T100,15" fill="none" stroke="#a88bfa" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[8px] p-2 bg-white/[0.01] border border-white/[0.03] rounded-md">
                    <span className="text-[#F0EEFF]">☕ Caffè Centrale</span>
                    <span className="text-[#e879f9] font-serif font-semibold">−2,50€</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] p-2 bg-white/[0.01] border border-white/[0.03] rounded-md">
                    <span className="text-[#F0EEFF]">🛒 Esselunga</span>
                    <span className="text-[#e879f9] font-serif font-semibold">−34,20€</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] p-2 bg-[#10B981]/[0.03] border border-[#10B981]/[0.1] rounded-md">
                    <span className="text-[#F0EEFF]">📈 PAC Fineco</span>
                    <span className="text-[#10B981] font-semibold">investito</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
