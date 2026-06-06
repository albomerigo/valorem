"use client";

import { useInView } from "../hooks/use-in-view";
import { BarChart2, Frown, ShoppingCart, Globe } from "lucide-react";
import { AnimatedSection } from "../landing-view";

export function Problem() {
  const { ref, inView } = useInView(0.1);

  const cards = [
    {
      icon: <BarChart2 className="w-6 h-6 text-[#F87171]" />,
      title: "Dati senza contesto",
      desc: "Sapere che hai speso 340€ questo mese non ti dice nulla. Sapere che equivalgono a 17 ore del tuo lavoro — quello cambia il modo in cui prendi decisioni.",
      borderGlow: "group-hover:border-[#F87171]/30",
      bgGlow: "bg-[#F87171]/[0.02]"
    },
    {
      icon: <Frown className="w-6 h-6 text-[#FBBF24]" />,
      title: "Nessuna empatia",
      desc: "Le app ti giudicano con grafici rossi. Valorem capisce che la finanza è emotiva e ti parla come un coach, non come un foglio Excel.",
      borderGlow: "group-hover:border-[#FBBF24]/30",
      bgGlow: "bg-[#FBBF24]/[0.02]"
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-[#a88bfa]" />,
      title: "Impulsi senza memoria",
      desc: "Il Cimitero degli Impulsi conserva ogni vittoria. Trasforma la disciplina in gratificazione concreta e visibile, mese dopo mese.",
      borderGlow: "group-hover:border-[#a88bfa]/30",
      bgGlow: "bg-[#a88bfa]/[0.02]"
    },
    {
      icon: <Globe className="w-6 h-6 text-[#60a5fa]" />,
      title: "Nessuna soluzione italiana",
      desc: "Mint è americana, Emma è britannica. Valorem è costruita sulla mentalità italiana: stipendio mensile, costi fissi precisi, ritmo prevedibile.",
      borderGlow: "group-hover:border-[#60a5fa]/30",
      bgGlow: "bg-[#60a5fa]/[0.02]"
    }
  ];

  return (
    <section id="problema" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Eyebrow and header */}
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
          Il Problema
        </span>
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] max-w-2xl leading-tight mb-12">
          Le app di finanza ti mostrano <span className="text-[#a88bfa]">numeri</span>.
          <br />
          Valorem ti mostra <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">scelte</span>.
        </h2>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <AnimatedSection
              key={idx}
              animation={idx % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"}
              delay={idx * 120}
            >
              <div
                className={`group p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:-translate-y-1 transition-all duration-300 h-full ${card.borderGlow} ${card.bgGlow}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="font-serif text-xl text-[#F0EEFF] font-medium mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-[#8b8899] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
