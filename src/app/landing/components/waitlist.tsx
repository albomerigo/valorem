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
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  // Fetch subscriber count
  useEffect(() => {
    let active = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist-count");
        if (res.ok && active) {
          const data = await res.json();
          setTotalSubscribers(data.count || 0);
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
          Entra in lista per{" "}
          <span className="bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] bg-clip-text text-transparent font-medium animate-text-shimmer">
            Valorem Pro
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#8b8899] max-w-xl mx-auto leading-relaxed mb-8">
          L&apos;AI Coach, la modalità coppia e i report mensili automatici arrivano presto. Iscriviti adesso e ricevi 2 mesi gratis + 40% di sconto permanente quando uscirà.
        </p>

        {/* Real-time subscriber count badge */}
        {totalSubscribers > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#a88bfa]/5 to-[#60a5fa]/5 border border-[#a88bfa]/15 text-xs text-[#a88bfa] font-semibold mb-12 shadow-sm">
            <span>{totalSubscribers} persone già in lista anticipata</span>
          </div>
        )}

        {/* Benefit pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 text-left">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <span className="text-[#a88bfa] font-bold">✦</span>
            <span className="text-xs text-[#e8e6f0] font-medium">2 mesi gratis al lancio</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <span className="text-[#e879f9] font-bold">✦</span>
            <span className="text-xs text-[#e8e6f0] font-medium">40% sconto permanente</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#a88bfa]/[0.03] border border-[#a88bfa]/10 rounded-2xl">
            <span className="text-[#60a5fa] font-bold">✦</span>
            <span className="text-xs text-[#e8e6f0] font-medium">Accesso anticipato</span>
          </div>
        </div>

        {status === "success" ? (
          /* SUCCESS STATE */
          <div className="max-w-lg mx-auto py-6">
            <div className="p-6 rounded-2xl bg-[#10B981]/[0.08] border border-[#10B981]/25 text-[#10B981] flex flex-col items-center gap-4 relative z-10 shadow-lg">
              <Check className="w-8 h-8 text-[#10B981]" />
              <div className="flex flex-col text-center">
                <span className="text-base font-bold">✓ Sei in lista!</span>
                <span className="text-xs text-[#10B981]/90 mt-1 font-medium">
                  Ti avvisiamo per primi quando Pro sarà disponibile.
                </span>
              </div>
              <a
                href="/pricing"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 border border-[#10B981]/30 hover:border-[#10B981]/60 text-xs font-semibold text-[#10B981] bg-[#10B981]/[0.02] rounded-xl transition-all"
              >
                Inizia con Premium intanto →
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
                placeholder="La tua email per l'accesso anticipato..."
                className="flex-1 h-14 bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] focus:ring-1 focus:ring-[#a88bfa] outline-none rounded-2xl px-5 text-sm text-[#F0EEFF] transition-all disabled:opacity-50 font-medium"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#a88bfa] to-[#60a5fa] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(168,139,250,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-md"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registrazione...
                  </>
                ) : (
                  "Voglio l'accesso anticipato →"
                )}
              </button>
            </form>
            <p className="text-xs text-[#8b8899] mt-2">Zero spam. Solo una email quando Pro è disponibile.</p>
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
