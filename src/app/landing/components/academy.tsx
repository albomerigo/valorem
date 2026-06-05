"use client";

import { useState } from "react";
import { useInView } from "../hooks/use-in-view";
import { BookOpen, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function Academy() {
  const { ref, inView } = useInView(0.1);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Inserisci un indirizzo email valido.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          setStatus("error");
          setErrorMessage(data.error);
        } else {
          setStatus("success");
          setEmail("");
        }
      } else {
        setStatus("error");
        setErrorMessage("Qualcosa è andato storto. Riprova.");
      }
    } catch (err) {
      console.error("Academy waitlist subscribe error:", err);
      setStatus("error");
      setErrorMessage("Errore di rete. Riprova.");
    }
  };

  const articles = [
    {
      category: "Psicologia del denaro",
      catColor: "bg-[#a88bfa]/10 text-[#a88bfa] border-[#a88bfa]/25",
      title: "Perché spendi troppo: la scienza degli acquisti impulsivi",
      readTime: "5 min"
    },
    {
      category: "Budgeting pratico",
      catColor: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25",
      title: "Come calcolare il tuo Safe-to-Spend reale",
      readTime: "4 min"
    },
    {
      category: "Obiettivi finanziari",
      catColor: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25",
      title: "Il metodo dei 30 giorni per resistere agli impulsi",
      readTime: "6 min"
    }
  ];

  return (
    <section id="academy" ref={ref} className="py-24 md:py-32 px-6 relative z-10 max-w-7xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a88bfa]/[0.03] border border-[#a88bfa]/15 backdrop-blur-md shadow-inner text-[11px] uppercase tracking-wider text-[#a88bfa] mb-6">
            <BookOpen className="w-3.5 h-3.5 text-[#e879f9]" />
            <span>Valorem Academy · In arrivo</span>
          </div>
          <h2 className="font-serif italic text-[48px] md:text-[56px] text-[#F0EEFF] leading-tight mb-6">
            Impara a gestire i soldi <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">davvero</span>.
          </h2>
          <p className="text-sm md:text-base text-[#8b8899] leading-relaxed max-w-2xl mx-auto">
            La Valorem Academy è la nostra biblioteca di conoscenza finanziaria. Guide scritte con il tono del Coach — empatiche, pratiche, basate su comportamenti reali. Non teoria: strumenti che puoi usare domani.
          </p>
        </div>

        {/* 3 pills explaining academy categories */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <span className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm">
            📖 Guide pratiche
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm">
            🧠 Psicologia del denaro
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm">
            🎯 Strategie concrete
          </span>
        </div>

        {/* 3 article preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className={`bg-[#0b0912] border border-white/[0.06] hover:border-[#a88bfa]/30 rounded-3xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group shadow-md min-h-[220px] hover:translate-y-[-4px] transition-all duration-300 fade-up ${inView ? "in-view" : ""}`}
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              {/* Blur background dot */}
              <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-[#a88bfa]/5 blur-xl group-hover:bg-[#a88bfa]/10 transition-colors" />

              {/* Course tag badge */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 border rounded-full ${art.catColor}`}>
                  {art.category}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 border border-[#a88bfa]/20 bg-[#a88bfa]/5 text-[#a88bfa] rounded-full">
                  In arrivo
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg md:text-xl text-[#F0EEFF] font-medium leading-snug mb-8 relative z-10 group-hover:text-[#a88bfa] transition-colors">
                {art.title}
              </h3>

              {/* Read Time Info */}
              <div className="text-[10px] text-[#8b8899] flex items-center gap-1 relative z-10">
                <Clock className="w-3.5 h-3.5" />
                Tempo di lettura: {art.readTime}
              </div>
            </div>
          ))}
        </div>

        {/* Inline waitlist signup form */}
        <div className="max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center shadow-inner relative overflow-hidden">
          <p className="text-xs md:text-sm text-[#F0EEFF] font-semibold mb-4">
            Vuoi essere avvisato quando uscirà il primo articolo?
          </p>

          {status === "success" ? (
            <div className="max-w-md mx-auto p-3 rounded-xl bg-[#10B981]/[0.08] border border-[#10B981]/25 text-[#10B981] flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in">
              <span className="w-4 h-4 flex-shrink-0">✓</span>
              <span>Ti avviseremo non appena pubblicheremo i primi contenuti!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                disabled={status === "loading"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="La tua email migliore..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] outline-none rounded-xl px-4 py-2.5 text-xs text-[#F0EEFF] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white text-xs font-bold hover:brightness-105 transition-all flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                {status === "loading" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Avvisami →"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <div className="text-[#F87171] text-[10px] mt-2 flex items-center justify-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errorMessage || "Qualcosa è andato storto."}</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
