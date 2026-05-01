"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";
import type { DashboardStats, Transaction } from "@/lib/finance";
import { isInvestment } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";

type BannerContext = {
  icon: React.ReactNode;
  tone: "warning" | "celebration" | "insight";
  title: string;
  message: string;
};

/**
 * Banner Coach contestuale: compare solo quando c'è una condizione rilevante.
 * Analizza transazioni e stats per generare un messaggio "giusto al momento giusto".
 */
export function CoachBanner({
  stats,
  transactions,
}: {
  stats: DashboardStats;
  transactions: Transaction[];
}) {
  const context = useMemo<BannerContext | null>(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayTxs = transactions.filter(
      (t) =>
        t.transaction_date === today &&
        t.type === "expense" &&
        !isInvestment(t.category)
    );
    const todaySpent = todayTxs.reduce((s, t) => s + Number(t.amount), 0);

    // CASO 1: giornata oltre il 150% del Safe-to-Spend
    if (
      stats.safeToSpendToday > 0 &&
      todaySpent > stats.safeToSpendToday * 1.5
    ) {
      const over = todaySpent - stats.safeToSpendToday;
      const overSplit = splitCurrency(over);
      return {
        icon: <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />,
        tone: "warning",
        title: "Stai uscendo dalla rotta",
        message: `Oggi hai speso ${overSplit.int}€ oltre il tuo Safe-to-Spend. Domani puoi recuperare riducendo.`,
      };
    }

    // CASO 2: fine mese con budget non consumato (>70% del mese passato, <50% speso)
    const monthFraction = stats.dayOfMonth / stats.daysInMonth;
    const budgetUsed =
      stats.monthlyFree > 0
        ? (stats.monthlyFree - stats.safeToSpendToday * stats.remainingDays) /
          stats.monthlyFree
        : 0;
    if (
      monthFraction > 0.7 &&
      budgetUsed < 0.5 &&
      stats.monthlyFree > 0 &&
      stats.remainingDays > 1
    ) {
      const saved = stats.monthlyFree * (1 - budgetUsed);
      const savedSplit = splitCurrency(saved);
      return {
        icon: <Trophy className="h-4 w-4" strokeWidth={1.8} />,
        tone: "celebration",
        title: "Mese da campione",
        message: `Hai preservato ${savedSplit.int}€ dal tuo budget. A fine mese potresti destinarli a un obiettivo.`,
      };
    }

    // CASO 3: hai almeno 3 transazioni della stessa categoria oggi
    const categoryCount: Record<string, number> = {};
    for (const t of todayTxs) {
      const cat = t.category || "Altro";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
    const topCategory = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= 3) {
      return {
        icon: <TrendingUp className="h-4 w-4" strokeWidth={1.8} />,
        tone: "insight",
        title: "Pattern di spesa rilevato",
        message: `Oggi ${topCategory[1]} transazioni in ${topCategory[0]}. Vale la pena chiedersi se è un pattern intenzionale.`,
      };
    }

    // CASO 4: tutto OK, con >50% del mese trascorso e rispetto budget — celebra silenziosamente
    if (
      monthFraction > 0.5 &&
      stats.safeToSpendToday > 0 &&
      todaySpent < stats.safeToSpendToday * 0.9
    ) {
      return {
        icon: <Sparkles className="h-4 w-4" strokeWidth={1.8} />,
        tone: "celebration",
        title: "Ritmo impeccabile",
        message: `Oggi hai consumato meno del tuo budget giornaliero. Ogni giornata così accelera i tuoi obiettivi.`,
      };
    }

    return null;
  }, [stats, transactions]);

  if (!context) return null;

  const styles = {
    warning: {
      border: "border-amber-400/25",
      bg: "bg-amber-400/[0.05]",
      iconColor: "text-amber-300",
    },
    celebration: {
      border: "border-emerald-300/25",
      bg: "bg-emerald-300/[0.04]",
      iconColor: "text-emerald-300",
    },
    insight: {
      border: "border-cyan-300/25",
      bg: "bg-cyan-300/[0.04]",
      iconColor: "text-cyan-300",
    },
  }[context.tone];

  return (
    <div
      className={`relative flex items-start gap-3 rounded-[14px] border px-4 py-3 animate-slide-up [animation-delay:0.35s] ${styles.border} ${styles.bg}`}
      style={{ animationFillMode: "both" }}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${styles.iconColor}`}
      >
        {context.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-primary">
          {context.title}
        </p>
        <p className="m-0 mt-0.5 text-[12px] leading-[1.55] text-ink-secondary">
          {context.message}
        </p>
      </div>
    </div>
  );
}