"use client";

import { useState } from "react";
import { useInView } from "../hooks/use-in-view";
import { Plus } from "lucide-react";

export function FAQ() {
  const { ref, inView } = useInView(0.1);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  const list = [
    {
      q: "I miei dati sono al sicuro? Dove vengono salvati?",
      a: "Tutti i dati sono salvati su Supabase (infrastruttura PostgreSQL europea, GDPR-compliant) con Row Level Security. Solo tu puoi vedere i tuoi dati. Valorem non vende dati, non mostra pubblicità. Puoi esportare o cancellare tutto in qualsiasi momento."
    },
    {
      q: "Devo collegare il mio conto bancario?",
      a: "No. Valorem è volutamente manuale — aggiungi tu le transazioni in 5 secondi. Questo ti rende più consapevole di ogni spesa. La sincronizzazione bancaria è in roadmap per il piano Pro, ma rimarrà sempre opzionale."
    },
    {
      q: "Funziona su iPhone e Android?",
      a: "Sì. Valorem è una Progressive Web App (PWA) — funziona su qualsiasi browser. Su iOS Safari clicca 'Aggiungi a schermata Home', su Android Chrome 'Installa app'. Nessun App Store richiesto."
    },
    {
      q: "Posso cancellare l'account e tutti i miei dati?",
      a: "Sì, sempre. Impostazioni → cancella account. Tutti i dati vengono eliminati entro 24 ore. Puoi esportare tutto prima in CSV o JSON. Diritto garantito dal GDPR, rispettato senza eccezioni."
    },
    {
      q: "Cosa succede quando finisce il piano Free?",
      a: "Nulla di brusco. Il piano Free è gratuito per sempre con limiti. I tuoi dati non spariscono — puoi continuare a leggerli, ma non aggiungerne di nuovi finché non liberi spazio o aggiorni il piano."
    },
    {
      q: "Il Coach narrativo è personalizzato o preimpostato?",
      a: "Il Coach analizza il tuo mese specifico — top categorie, giorni di picco, trend vs mese precedente — e genera un testo personalizzato sui tuoi numeri reali. Il piano Pro includerà AI Coach con Claude per analisi conversazionali avanzate."
    }
  ];

  return (
    <section id="faq" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-3xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
            FAQ
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight">
            Domande <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">frequenti</span>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-4">
          {list.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`bg-[#0b0912] border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-[#a88bfa]/30 shadow-lg" : "border-white/[0.06]"
                }`}
              >
                {/* Question Trigger */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 text-sm md:text-base font-semibold text-[#F0EEFF] hover:text-[#a88bfa] transition-colors focus:outline-none"
                >
                  <span>{item.q}</span>
                  <div
                    className={`w-6 h-6 rounded-full border border-white/[0.1] flex items-center justify-center text-[#a88bfa] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-[135deg] bg-[#a88bfa]/10" : ""
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Animated Grid Height Content */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 md:px-6 md:pb-6 text-xs md:text-sm text-[#8b8899] leading-relaxed border-t border-white/[0.02] pt-4">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
