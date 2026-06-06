"use client";

import { useInView } from "../hooks/use-in-view";
import { AnimatedSection } from "../landing-view";

export function HowItWorks() {
  const { ref, inView } = useInView(0.1);

  const steps = [
    {
      num: "01",
      title: "Inserisci le spese",
      desc: "In 5 secondi con il pulsante iridescente. Nessun CSV, nessuna sincronizzazione complicata."
    },
    {
      num: "02",
      title: "Valorem elabora",
      desc: "Ogni euro diventa minuti di vita. Safe-to-Spend aggiornato istantaneamente. Il Coach osserva pattern nel tempo."
    },
    {
      num: "03",
      title: "Il Coach ti racconta",
      desc: 'A fine mese leggi una storia sui tuoi dati. "Aprile — il mese del costruttore." Analisi comportamentale personalizzata.'
    }
  ];

  return (
    <section
      id="come-funziona"
      ref={ref}
      className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto text-center"
    >
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Eyebrow and Header */}
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
          Come funziona
        </span>
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight mb-16">
          Tre passi verso la <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">chiarezza</span>
        </h2>

        {/* Steps container */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[54px] left-[15%] right-[15%] h-[1.5px] bg-gradient-to-r from-transparent via-[#a88bfa]/30 to-transparent pointer-events-none" />

          {steps.map((step, idx) => (
            <AnimatedSection
              key={idx}
              animation="animate-bounce-in"
              delay={idx * 200}
            >
              <div
                className="flex flex-col items-center group relative z-10 h-full"
              >
                {/* Number Circle */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex items-center justify-center font-serif text-3xl italic text-[#a88bfa] mb-6 group-hover:scale-105 group-hover:border-[#a88bfa]/40 group-hover:shadow-[0_0_20px_rgba(168,139,250,0.15)] transition-all duration-300 relative">
                  {/* Inner accent ring */}
                  <div className="absolute inset-1 rounded-full border border-white/[0.02]" />
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="font-serif text-xl text-[#F0EEFF] font-medium mb-3">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-[#8b8899] leading-relaxed max-w-[260px]">
                  {step.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
