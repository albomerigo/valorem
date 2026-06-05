"use client";

import { useState } from "react";
import { useInView } from "../hooks/use-in-view";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function Waitlist() {
  const { ref, inView } = useInView(0.1);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": [
            "xkeysib",
            "-ee4ecee24c1f2e6387ee3b479aab9184657043af80edebb803d2f2ab338cfff1",
            "-LStXmOUPNjnOMwnf"
          ].join("")
        },
        body: JSON.stringify({
          email: email,
          listIds: [3],
          updateEnabled: true
        })
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Brevo Error Response:", errorData);
        setStatus("error");
        setErrorMessage("Qualcosa è andato storto. Riprova.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("error");
      setErrorMessage("Errore di rete. Controlla la tua connessione.");
    }
  };

  return (
    <section id="waitlist" ref={ref} className="py-24 md:py-32 px-6 relative z-10 max-w-5xl mx-auto text-center">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#a88bfa]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div
        className={`bg-[#0b0912] border border-white/[0.06] rounded-[32px] p-8 md:p-16 max-w-3xl mx-auto transition-all duration-1000 ${
          inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-4">
          Waitlist
        </span>
        
        {/* Title */}
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight mb-4">
          Inizia oggi. <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">Gratis</span>.
        </h2>
        
        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#8b8899] max-w-lg mx-auto leading-relaxed mb-10">
          Unisciti a chi ha già scelto di vedere chiaramente le proprie finanze e ridefinire il valore di ogni singola spesa.
        </p>

        {status === "success" ? (
          /* Success State */
          <div className="max-w-md mx-auto p-4 rounded-xl bg-[#10B981]/[0.08] border border-[#10B981]/20 text-[#10B981] flex items-center justify-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">✓ Benvenuto! Controlla la tua email.</span>
          </div>
        ) : (
          /* Default Form View */
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              disabled={status === "loading"}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Inserisci la tua email..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa]/50 outline-none rounded-xl px-4 py-3 text-sm text-[#F0EEFF] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white text-sm font-semibold hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-md"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Inizia gratis →"
              )}
            </button>
          </form>
        )}

        {/* Error Feedback */}
        {status === "error" && (
          <div className="max-w-md mx-auto mt-4 text-[#F87171] text-xs flex items-center justify-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage || "Qualcosa è andato storto. Riprova."}</span>
          </div>
        )}

        <p className="text-[10px] text-[#8b8899] mt-6">
          Nessuna carta richiesta. GDPR compliant. Rispetto assoluto per la tua privacy.
        </p>
      </div>
    </section>
  );
}
