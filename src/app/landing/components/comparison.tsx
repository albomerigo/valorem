"use client";

import { useInView } from "../hooks/use-in-view";
import { Check, X } from "lucide-react";

export function Comparison() {
  const { ref, inView } = useInView(0.1);

  const rows = [
    {
      feature: "Traduzione spese in ore di lavoro",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Recap narrativo mensile",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "AI Coach personalizzato",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Valorem Score (salute finanziaria)",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "DNA Finanziario",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Notifiche comportamentali",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Safe-to-Spend dinamico",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <span className="text-xs text-[#a88bfa] font-medium mx-auto">Parziale</span>,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Cimitero degli Impulsi",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <X className="w-5 h-5 text-white/10 mx-auto" />
    },
    {
      feature: "Investimenti separati dal budget",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <span className="text-xs text-[#a88bfa] font-medium mx-auto">Parziale</span>,
      excel: <span className="text-xs text-white/40 font-medium mx-auto">Manuale</span>
    },
    {
      feature: "In italiano, pensato per l'Italia",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <X className="w-5 h-5 text-white/10 mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <Check className="w-5 h-5 text-[#10B981] mx-auto" />
    },
    {
      feature: "Gratis per iniziare",
      valorem: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      mint: <Check className="w-5 h-5 text-[#10B981] mx-auto" />,
      ynab: <X className="w-5 h-5 text-white/10 mx-auto" />,
      excel: <Check className="w-5 h-5 text-[#10B981] mx-auto" />
    }
  ];

  return (
    <section id="confronto" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
            Confronto
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight">
            Perché <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">Valorem</span> e non le alternative?
          </h2>
        </div>

        {/* Scrollable grid wrapper for mobile support */}
        <div className="w-full overflow-x-auto rounded-3xl border border-white/[0.06] bg-[#0b0912]/80 backdrop-blur-md shadow-xl">
          <div className="min-w-[750px] w-full">
            {/* Grid Header Row */}
            <div className="grid grid-cols-[2fr_1.1fr_1fr_1fr_1fr] items-stretch border-b border-white/[0.06] bg-white/[0.01]">
              <div className="p-5 text-xs font-semibold uppercase tracking-wider text-[#8b8899] flex items-center">
                Funzionalità
              </div>
              
              {/* Highlighted Valorem Header Column */}
              <div className="p-5 text-xs font-bold uppercase tracking-wider text-[#a88bfa] text-center bg-[#a88bfa]/10 border-x-2 border-t-2 border-[#a88bfa] rounded-t-2xl flex flex-col justify-center items-center gap-1.5 relative">
                <span className="text-[8px] bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white px-2 py-0.5 rounded-full font-extrabold tracking-widest shadow-sm">
                  ✦ MIGLIORE SCELTA
                </span>
                <span>Valorem</span>
              </div>
              
              <div className="p-5 text-xs font-semibold uppercase tracking-wider text-[#8b8899] text-center flex items-center justify-center">
                Mint
              </div>
              <div className="p-5 text-xs font-semibold uppercase tracking-wider text-[#8b8899] text-center flex items-center justify-center">
                YNAB
              </div>
              <div className="p-5 text-xs font-semibold uppercase tracking-wider text-[#8b8899] text-center flex items-center justify-center">
                Excel
              </div>
            </div>

            {/* Grid Data Rows */}
            <div className="flex flex-col">
              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[2fr_1.1fr_1fr_1fr_1fr] items-stretch border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="p-5 text-sm text-[#F0EEFF] font-medium flex items-center">
                      {row.feature}
                    </div>
                    
                    {/* Highlighted Valorem Data Column Cell */}
                    <div className={`p-5 text-center bg-[#a88bfa]/[0.05] border-x-2 border-[#a88bfa] font-semibold flex items-center justify-center ${
                      isLast ? "border-b-2 rounded-b-2xl" : ""
                    }`}>
                      {row.valorem}
                    </div>
                    
                    <div className="p-5 text-center flex items-center justify-center">
                      {row.mint}
                    </div>
                    <div className="p-5 text-center flex items-center justify-center text-sm font-medium">
                      {row.ynab}
                    </div>
                    <div className="p-5 text-center flex items-center justify-center text-sm font-medium">
                      {row.excel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
