"use client";

import { useInView } from "../hooks/use-in-view";
import { Star } from "lucide-react";

export function Testimonials() {
  const { ref, inView } = useInView(0.1);

  const list = [
    {
      stars: 5,
      quote: "Finalmente capisco dove vanno i miei soldi. Il Safe-to-Spend mi ha cambiato le abitudini in due settimane.",
      author: "M.T.",
      role: "Freelance",
      location: "Milano",
      avatarGrad: "from-[#a88bfa] to-[#e879f9]"
    },
    {
      stars: 5,
      quote: "Il recap mensile è come uno specchio. Onesto, empatico, utile. Non pensavo che un'app potesse farmi riflettere così.",
      author: "S.B.",
      role: "Impiegata",
      location: "Roma",
      avatarGrad: "from-[#60a5fa] to-[#67e8f9]"
    },
    {
      stars: 5,
      quote: "Tradurre le spese in ore di lavoro è la cosa più intelligente che abbia visto in un'app di finanza.",
      author: "L.R.",
      role: "Sviluppatore",
      location: "Torino",
      avatarGrad: "from-[#e879f9] to-[#a88bfa]"
    }
  ];

  return (
    <section id="recensioni" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
            Recensioni
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight">
            Chi l'ha provato, <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">non torna indietro</span>.
          </h2>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0b0912] border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-md group"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {/* Top quotes decorative element */}
              <div className="absolute top-4 right-6 font-serif text-8xl text-[#a88bfa]/5 pointer-events-none select-none">
                “
              </div>

              <div>
                {/* Gold Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(item.stars)].map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm font-serif italic text-[#e8e6f0] leading-relaxed mb-8 relative z-10">
                  "{item.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-3.5 mt-auto">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.avatarGrad} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                >
                  {item.author}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#F0EEFF]">
                    {item.author === "M.T." ? "Marco T." : item.author === "S.B." ? "Sara B." : "Luca R."}
                  </span>
                  <span className="text-[10px] text-[#8b8899]">
                    {item.role}, {item.author === "M.T." ? "28" : item.author === "S.B." ? "31" : "26"} anni · {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
