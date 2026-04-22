"use client";

import { useState, useMemo, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { Modal } from "./modal";
import { createTransaction } from "@/app/actions/transactions";
import { declineSimulation } from "@/app/actions/declined";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import type { DashboardStats } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";

const CATEGORIES = [
  "Ristorazione",
  "Shopping",
  "Svago",
  "Trasporti",
  "Salute",
  "Casa",
  "Altro",
];

type Verdict = "serene" | "sustainable" | "tighten" | "planned" | "risky";

type Analysis = {
  currentSafe: number;
  newSafeToSpend: number;
  timeLabel: string;
  verdict: Verdict;
  verdictTitle: string;
  verdictSubtitle: string;
  coachInsight: string;
  monthsOfSaving: number | null;
  overBudgetAmount: number;
};

type VerdictStyle = {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
};

function getVerdictStyle(verdict: Verdict): VerdictStyle {
  if (verdict === "serene" || verdict === "sustainable") {
    return {
      icon: <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />,
      color: "text-emerald-300",
      bg: "bg-emerald-500/[0.08]",
      border: "border-emerald-500/30",
    };
  }
  if (verdict === "tighten") {
    return {
      icon: <Sparkles className="h-4 w-4" strokeWidth={1.8} />,
      color: "text-amber-300",
      bg: "bg-amber-500/[0.08]",
      border: "border-amber-500/30",
    };
  }
  if (verdict === "planned") {
    return {
      icon: <Calendar className="h-4 w-4" strokeWidth={1.8} />,
      color: "text-sky-300",
      bg: "bg-sky-500/[0.08]",
      border: "border-sky-500/30",
    };
  }
  return {
    icon: <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />,
    color: "text-red-300",
    bg: "bg-red-500/[0.08]",
    border: "border-red-500/30",
  };
}

export function SimulatorModal({
  open,
  onClose,
  stats,
}: {
  open: boolean;
  onClose: () => void;
  stats: DashboardStats;
}) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Shopping");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const analysis = useMemo<Analysis | null>(() => {
    if (amount <= 0) return null;

    const currentSafe = stats.safeToSpendToday;
    const daysLeft = Math.max(1, stats.remainingDays);
    const monthlyFree = stats.monthlyFree;
    const remainingBudget = currentSafe * daysLeft;

    const impactPerDay = amount / daysLeft;
    const newSafeToSpend = currentSafe - impactPerDay;
    const overBudgetAmount = Math.max(0, amount - remainingBudget);

    const monthsOfSaving =
      overBudgetAmount > 0 && monthlyFree > 0
        ? Math.ceil(amount / monthlyFree)
        : null;

    const timeLabel = amountToTimeLabel(amount, stats);
    const smallPurchase = amount < currentSafe * 0.15;

    let verdict: Verdict;
    let verdictTitle: string;
    let verdictSubtitle: string;
    let coachInsight: string;

    if (smallPurchase) {
      verdict = "serene";
      verdictTitle = "Sereno";
      verdictSubtitle = "Spesa insignificante sul tuo ritmo";
      coachInsight = `Un acquisto così piccolo non cambia il tuo piano. Il Safe-to-Spend resta praticamente uguale.`;
    } else if (newSafeToSpend >= currentSafe * 0.6) {
      verdict = "sustainable";
      verdictTitle = "Sostenibile";
      verdictSubtitle = "Rientra comodamente nel tuo mese";
      coachInsight = `Puoi procedere. Il tuo Safe-to-Spend scende leggermente ma resti in zona verde per i prossimi ${daysLeft} giorni.`;
    } else if (newSafeToSpend > 0 && overBudgetAmount === 0) {
      verdict = "tighten";
      verdictTitle = "Richiede attenzione";
      verdictSubtitle = "Puoi farlo, ma dovrai stringere";
      const newSafeFormatted = newSafeToSpend.toFixed(2).replace(".", ",");
      coachInsight = `Potrai permettertelo, ma vivrai i prossimi ${daysLeft} giorni con ${newSafeFormatted}€ al giorno. Valuta se vale la riduzione.`;
    } else if (overBudgetAmount > 0 && monthsOfSaving !== null) {
      verdict = "planned";
      verdictTitle = "Da pianificare";
      verdictSubtitle = "Serve un progetto multi-mese";
      const overFormatted = overBudgetAmount.toFixed(0);
      const mesi = monthsOfSaving === 1 ? "mese" : "mesi";
      coachInsight = `Sfora il budget libero di ${overFormatted}€. Per sostenerlo senza stress ti servono ~${monthsOfSaving} ${mesi} di risparmio dedicato, oppure attingere ai tuoi accantonamenti.`;
    } else {
      verdict = "risky";
      verdictTitle = "Intacca la sicurezza";
      verdictSubtitle = "Metterebbe a rischio il piano";
      coachInsight = `Questo acquisto supera ciò che puoi sostenere questo mese senza intaccare l'obiettivo di risparmio o andare in rosso. Rimanda o ridimensiona.`;
    }

    return {
      currentSafe,
      newSafeToSpend,
      timeLabel,
      verdict,
      verdictTitle,
      verdictSubtitle,
      coachInsight,
      monthsOfSaving,
      overBudgetAmount,
    };
  }, [amount, stats]);

  function resetForm() {
    setMerchant("");
    setAmount(0);
    setCategory("Shopping");
    setError(null);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await createTransaction({
        merchant: merchant || "Acquisto simulato",
        amount,
        category,
        type: "expense",
        transactionDate: new Date().toISOString().split("T")[0],
        recurring: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      onClose();
    });
  }
  function handleDecline() {
    if (amount <= 0) return;
    setError(null);
    startTransition(async () => {
      const result = await declineSimulation({
        merchant: merchant || "Acquisto rifiutato",
        amount,
        category,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Posso permettermelo?"
      subtitle="Scopri l'impatto prima di comprare"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <FieldLabel>Cosa</FieldLabel>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Un Apple Watch…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
            />
          </div>
          <div className="w-[130px]">
            <FieldLabel>Quanto</FieldLabel>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-8 font-mono-tabular text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
                autoFocus
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
                €
              </span>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Categoria</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition-all duration-[250ms] ${
                  category === cat
                    ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.08] text-ink-primary"
                    : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25 hover:text-iri-pale"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {analysis && <AnalysisCard analysis={analysis} stats={stats} />}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        {analysis && analysis.verdict !== "risky" && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending || amount <= 0}
              onClick={handleDecline}
              className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-secondary transition-all duration-[300ms] hover:border-iri-violet/30 hover:bg-iri-violet/[0.06] hover:text-iri-pale disabled:opacity-50"
            >
              {isPending ? "…" : "No, rinuncio"}
            </button>
            <button
              type="button"
              disabled={isPending || amount <= 0}
              onClick={handleConfirm}
              className="relative flex-[1.3] overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isPending ? "Registrazione…" : "Sì, conferma la spesa"}
            </button>
          </div>
        )}

        {analysis && analysis.verdict === "risky" && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isPending || amount <= 0}
              onClick={handleDecline}
              className="rounded-xl border border-iri-violet/30 bg-gradient-to-br from-iri-violet/[0.1] to-iri-magenta/[0.05] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-iri-pale transition-all duration-[300ms] hover:border-iri-violet/50 hover:from-iri-violet/[0.2] hover:text-ink-primary disabled:opacity-50"
            >
              {isPending ? "Registrazione…" : "Lo salvo nel Cimitero degli Impulsi"}
            </button>
            <p className="text-center text-[10px] text-ink-secondary">
              Per tutelare il tuo piano, questa spesa non può essere confermata
              direttamente.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AnalysisCard({
  analysis,
  stats,
}: {
  analysis: Analysis;
  stats: DashboardStats;
}) {
  const {
    currentSafe,
    newSafeToSpend,
    timeLabel,
    verdict,
    verdictTitle,
    verdictSubtitle,
    coachInsight,
    monthsOfSaving,
  } = analysis;

  const cfg = getVerdictStyle(verdict);
  const newSafeSplit = splitCurrency(Math.max(0, newSafeToSpend));
  const currentSafeSplit = splitCurrency(currentSafe);
  const suffix = getTimeMetricSuffix(stats.timeMetric);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-4`}
    >
      <div className={`flex items-start gap-2.5 ${cfg.color}`}>
        <div className="mt-0.5">{cfg.icon}</div>
        <div>
          <p className="m-0 text-[12px] font-medium uppercase tracking-[0.08em]">
            {verdictTitle}
          </p>
          <p className="m-0 mt-0.5 text-[11px] opacity-80">{verdictSubtitle}</p>
        </div>
      </div>

      <p className="m-0 font-serif text-[12px] italic leading-[1.65] text-ink-primary/90">
        {coachInsight}
      </p>

      {verdict !== "planned" && verdict !== "risky" && (
        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
          <div>
            <p className="m-0 text-[9px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
              Safe-to-Spend prima
            </p>
            <p className="m-0 mt-1 font-mono-tabular text-[16px] font-medium text-ink-primary">
              {currentSafeSplit.int}
              <span className="text-[10px] text-ink-primary/70">
                ,{currentSafeSplit.dec}
              </span>
              <span className="text-[10px] text-ink-muted">€/g</span>
            </p>
          </div>
          <div>
            <p className="m-0 text-[9px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
              Safe-to-Spend dopo
            </p>
            <p
              className={`m-0 mt-1 font-mono-tabular text-[16px] font-medium ${
                newSafeToSpend <= 0
                  ? "text-red-300"
                  : newSafeToSpend < currentSafe * 0.5
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}
            >
              {newSafeSplit.int}
              <span className="text-[10px] opacity-70">,{newSafeSplit.dec}</span>
              <span className="text-[10px] opacity-60">€/g</span>
            </p>
          </div>
        </div>
      )}

      {verdict === "planned" && monthsOfSaving !== null && (
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <TrendingDown className="h-3.5 w-3.5 text-sky-300" strokeWidth={1.8} />
          <p className="m-0 text-[11px] text-ink-secondary">
            Mesi di risparmio per coprirlo:{" "}
            <span className="iri-text font-medium">
              ~{monthsOfSaving} {monthsOfSaving === 1 ? "mese" : "mesi"}
            </span>
          </p>
        </div>
      )}

      <div className="border-t border-white/[0.06] pt-3">
        <p className="m-0 text-[11px] text-ink-secondary">
          Equivale a{" "}
          <span className="iri-text font-medium">{timeLabel}</span> {suffix}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
      {children}
    </p>
  );
}