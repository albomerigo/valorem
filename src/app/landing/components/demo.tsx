"use client";

import { useState, useEffect } from "react";
import { useInView } from "../hooks/use-in-view";
import { HelpCircle, AlertCircle, Clock, Calendar, CheckCircle2 } from "lucide-react";

export function Demo() {
  const { ref, inView } = useInView(0.1);

  const [incomeType, setIncomeType] = useState<"fixed" | "variable">("fixed");
  const [income, setIncome] = useState<number>(1800);
  const [fixedCosts, setFixedCosts] = useState<number>(850);
  const [savingsTarget, setSavingsTarget] = useState<number>(200);
  const [spent, setSpent] = useState<number>(320);

  const [daysLeft, setDaysLeft] = useState<number>(15);
  const [freeBudget, setFreeBudget] = useState<number>(0);
  const [perDay, setPerDay] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  // Run calculation whenever inputs change
  useEffect(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const calculatedDaysLeft = daysInMonth - today.getDate() + 1;
    setDaysLeft(calculatedDaysLeft);

    const calculatedFreeBudget = income - fixedCosts - savingsTarget;
    setFreeBudget(calculatedFreeBudget);

    const remaining = calculatedFreeBudget - spent;
    const calculatedPerDay = calculatedDaysLeft > 0 ? remaining / calculatedDaysLeft : 0;
    setPerDay(calculatedPerDay);

    const calculatedHourly = income > 0 ? income / 160 : 0;
    setHourlyRate(calculatedHourly);
  }, [income, fixedCosts, savingsTarget, spent]);

  return (
    <section id="demo" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto text-center">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
          Demo Interattiva
        </span>
        <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight mb-4">
          Calcola il tuo <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">Safe-to-Spend</span> adesso
        </h2>
        <p className="text-sm text-[#8b8899] max-w-md mx-auto mb-12">
          Nessuna registrazione richiesta. Vedi subito l'impatto di Valorem sulla tua quotidianità.
        </p>

        {/* Calculator Card */}
        <div className="max-w-xl mx-auto rounded-3xl p-6 md:p-10 bg-[#0b0912] border border-white/[0.06] shadow-xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-[#a88bfa]/5 blur-2xl pointer-events-none" />

          {/* Toggle buttons for income type */}
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-8">
            <button
              onClick={() => setIncomeType("fixed")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                incomeType === "fixed"
                  ? "bg-[#a88bfa]/15 text-[#a88bfa] border border-[#a88bfa]/20"
                  : "text-[#8b8899] hover:text-[#e8e6f0]"
              }`}
            >
              Stipendio fisso
            </button>
            <button
              onClick={() => setIncomeType("variable")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                incomeType === "variable"
                  ? "bg-[#a88bfa]/15 text-[#a88bfa] border border-[#a88bfa]/20"
                  : "text-[#8b8899] hover:text-[#e8e6f0]"
              }`}
            >
              Reddito variabile
            </button>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[#8b8899] font-semibold flex items-center gap-1">
                {incomeType === "fixed" ? "Stipendio netto mensile" : "Media entrate 3 mesi"} (€)
              </label>
              <input
                type="number"
                value={income || ""}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder="1800"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa]/50 outline-none rounded-xl p-3 text-sm text-[#F0EEFF] transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[#8b8899] font-semibold">
                Costi fissi mensili (€)
              </label>
              <input
                type="number"
                value={fixedCosts || ""}
                onChange={(e) => setFixedCosts(Number(e.target.value))}
                placeholder="850"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa]/50 outline-none rounded-xl p-3 text-sm text-[#F0EEFF] transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[#8b8899] font-semibold">
                Obiettivo risparmio (€)
              </label>
              <input
                type="number"
                value={savingsTarget || ""}
                onChange={(e) => setSavingsTarget(Number(e.target.value))}
                placeholder="200"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa]/50 outline-none rounded-xl p-3 text-sm text-[#F0EEFF] transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[#8b8899] font-semibold">
                Spese già fatte nel mese (€)
              </label>
              <input
                type="number"
                value={spent || ""}
                onChange={(e) => setSpent(Number(e.target.value))}
                placeholder="320"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa]/50 outline-none rounded-xl p-3 text-sm text-[#F0EEFF] transition-all font-mono"
              />
            </div>
          </div>

          {/* Results Box */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              perDay >= 0
                ? "bg-[#10B981]/[0.02] border-[#10B981]/20"
                : "bg-[#F87171]/[0.02] border-[#F87171]/20"
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#a88bfa] font-bold block mb-1">
              Safe-to-Spend oggi
            </span>
            <div
              className={`text-4xl md:text-5xl font-serif font-bold tracking-tight ${
                perDay >= 0 ? "text-[#F0EEFF]" : "text-[#F87171]"
              }`}
            >
              {perDay >= 0 ? "+" : ""}
              {perDay.toFixed(2).replace(".", ",")}€
            </div>
            
            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/[0.04] pt-4">
              {perDay >= 0 ? (
                <>
                  <p className="text-xs text-[#8b8899] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Puoi spendere questa cifra oggi senza compromettere i tuoi obiettivi.
                  </p>
                  {hourlyRate > 0 && (
                    <p className="text-xs text-[#a88bfa] italic font-serif flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      ≡ {(perDay / hourlyRate).toFixed(1)} ore del tuo lavoro disponibili oggi.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#8b8899] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#F87171]" />
                  Hai sforato il budget libero mensile. Riduci le spese o rivedi i costi fissi.
                </p>
              )}
            </div>
          </div>

          {/* Breakdowns Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-serif text-[#F0EEFF] font-medium">
                {freeBudget.toFixed(0)}€
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#8b8899] mt-1">
                Libero Mese
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-serif text-[#F87171] font-semibold">
                {spent.toFixed(0)}€
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#8b8899] mt-1">
                Già speso
              </span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-between">
              <span className="text-xs font-serif text-[#F0EEFF] font-medium">
                {daysLeft} gg
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#8b8899] mt-1">
                Giorni restanti
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-[#8b8899] mt-8">
            Vuoi questi calcoli calcolati in automatico ogni giorno?{" "}
            <a
              href="https://valorem-albomerigo-2081s-projects.vercel.app"
              className="text-[#a88bfa] hover:text-[#e879f9] transition-colors font-medium underline decoration-dotted underline-offset-4"
            >
              Crea un account gratuito →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
