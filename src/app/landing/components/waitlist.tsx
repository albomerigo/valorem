"use client";

import { useState, useEffect } from "react";
import { useInView } from "../hooks/use-in-view";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function Waitlist() {
  const { ref, inView } = useInView(0.1);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Real-time counter states
  const [totalSubscribers, setTotalSubscribers] = useState(23);
  const [animatedSubscribers, setAnimatedSubscribers] = useState(0);

  // Fetch subscriber count
  useEffect(() => {
    let active = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist-count");
        if (res.ok && active) {
          const data = await res.json();
          setTotalSubscribers(data.count || 23);
        }
      } catch (err) {
        console.error("Error fetching waitlist count for waitlist component:", err);
      }
    }
    fetchCount();
    return () => {
      active = false;
    };
  }, []);

  // Count-up animation
  useEffect(() => {
    let start = 0;
    const end = totalSubscribers;
    if (end === 0) return;

    const duration = 1500; // 1.5s
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedSubscribers(end);
        clearInterval(timer);
      } else {
        setAnimatedSubscribers(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [totalSubscribers]);

  const handleSubmit = async (e: React.FormEvent) => {
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
          // Increment the client counters immediately for visual feedback
          setTotalSubscribers((prev) => prev + 1);
        }
      } else {
        setStatus("error");
        setErrorMessage("Qualcosa è andato storto. Riprova.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("error");
      setErrorMessage("Errore di rete. Controlla la tua connessione.");
    }
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="waitlist"
      ref={ref}
      className="py-32 px-6 relative z-10 overflow-hidden text-center bg-gradient-to-b from-transparent via-[#0f091c]/40 to-transparent"
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#a88bfa]/10 blur-[140px] animate-orb-pulse" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#e879f9]/8 blur-[140px] animate-orb-pulse" style={{ animationDelay: "-2s" }} />
      </div>

      <div
        className={`max-w-4xl mx-auto bg-gradient-to-br from-[#0c0a18]/95 to-[#05030d]/98 border border-[#a88bfa]/15 rounded-[40px] p-8 md:p-20 relative z-10 transition-all duration-1000 shadow-[0_30px_70px_rgba(0,0,0,0.7)] ${
          inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Glow corner line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#a88bfa]/30 to-transparent" />

        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-4">
          Waitlist
        </span>

        {/* Title */}
        <h2 className="font-serif italic text-4xl md:text-6xl text-[#F0EEFF] leading-tight mb-4">
          Inizia oggi.{" "}
          <span className="bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] bg-clip-text text-transparent font-medium animate-text-shimmer">
            Gratis
          </span>.
        </h2>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#8b8899] max-w-xl mx-auto leading-relaxed mb-8">
          Unisciti a chi ha scelto di vedere chiaramente le proprie finanze. Nessuna carta di credito. Nessuna sorpresa. Cancelli quando vuoi.
        </p>

        {/* Real-time subscriber count badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-[#a88bfa] font-semibold mb-12 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#e879f9] animate-pulse" />
          <span>🔥 {animatedSubscribers} persone già iscritte in lista</span>
        </div>

        {/* Benefit pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 text-left">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
            <span className="text-xs text-[#e8e6f0] font-medium">Gratis per sempre nel piano base</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <Zap className="w-4 h-4 text-[#e879f9] flex-shrink-0" />
            <span className="text-xs text-[#e8e6f0] font-medium">Setup completo in 2 minuti</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-[#60a5fa] flex-shrink-0" />
            <span className="text-xs text-[#e8e6f0] font-medium">Dati sicuri e GDPR compliant</span>
          </div>
        </div>

        {status === "success" ? (
          /* SUCCESS STATE — WITH CONFETTI SYSTEM */
          <div className="max-w-lg mx-auto relative py-6">
            
            {/* Confetti Explosion (20 CSS particles) */}
            <div className="absolute inset-0 overflow-visible pointer-events-none z-0">
              {Array.from({ length: 20 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 1.5;
                const duration = 2.5 + Math.random() * 1.5;
                const colors = ["#a88bfa", "#e879f9", "#60a5fa", "#67e8f9", "#10B981", "#FBBF24"];
                const color = colors[i % colors.length];
                
                return (
                  <div
                    key={i}
                    className="absolute top-0 w-2 h-4 rounded-sm animate-fall"
                    style={{
                      left: `${left}%`,
                      backgroundColor: color,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                    }}
                  />
                );
              })}
            </div>

            <div className="p-6 rounded-2xl bg-[#10B981]/[0.08] border border-[#10B981]/25 text-[#10B981] flex flex-col items-center gap-4 relative z-10 shadow-lg">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
              <div className="flex flex-col text-center">
                <span className="text-base font-bold">🎉 Benvenuto in Valorem!</span>
                <span className="text-xs text-[#10B981]/90 mt-1">
                  Abbiamo registrato la tua email. Controlla la tua inbox per completare l'accesso.
                </span>
              </div>
              <a
                href="https://valorem-albomerigo-2081s-projects.vercel.app/signin"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-black font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Apri l'app ora →
              </a>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                disabled={status === "loading"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Inserisci la tua email migliore..."
                className="flex-1 h-14 bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] focus:ring-1 focus:ring-[#a88bfa] outline-none rounded-2xl px-5 text-sm text-[#F0EEFF] transition-all disabled:opacity-50 font-medium"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(168,139,250,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-md"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registrazione...
                  </>
                ) : (
                  "Inizia gratis ora →"
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-3 text-xs text-[#8b8899] mt-3">
              <span>Oppure</span>
              <button
                onClick={(e) => handleScrollToSection(e, "pricing")}
                className="text-xs font-semibold text-[#a88bfa] hover:text-[#e879f9] transition-colors border border-[#a88bfa]/20 hover:border-[#a88bfa]/40 rounded-xl px-4 py-2 bg-[#a88bfa]/[0.02]"
              >
                Inizia con Premium (offerta lancio)
              </button>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {status === "error" && (
          <div className="max-w-md mx-auto mt-4 text-[#F87171] text-xs flex items-center justify-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage || "Qualcosa è andato storto. Riprova."}</span>
          </div>
        )}
      </div>
    </section>
  );
}
