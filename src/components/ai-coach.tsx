"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { DashboardStats, UserProfile, Transaction } from "@/lib/finance";
import Link from "next/link";

type PromptType =
  | "analyze_month"
  | "save_more"
  | "top_category"
  | "goals_check"
  | "monthly_trend";

const BUTTONS: { id: PromptType; label: string }[] = [
  { id: "analyze_month", label: "📊 Analizza questo mese" },
  { id: "save_more", label: "💰 Come risparmio di più?" },
  { id: "top_category", label: "🏆 Categoria principale" },
  { id: "goals_check", label: "🎯 Sono in linea con gli obiettivi?" },
  { id: "monthly_trend", label: "📈 Il mio andamento" },
];

function buildContext(
  promptType: PromptType,
  stats: DashboardStats,
  profile: UserProfile | null,
  transactions: Transaction[]
) {
  const name = profile?.name || "amico";
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const monthTx = transactions.filter(
    (t) => t.type === "expense" && t.transaction_date.startsWith(currentMonth)
  );
  const totalSpent = monthTx.reduce((s, t) => s + Number(t.amount), 0);

  // Top category
  const byCat: Record<string, number> = {};
  for (const t of monthTx) {
    const c = t.category || "Altro";
    byCat[c] = (byCat[c] || 0) + Number(t.amount);
  }
  const topCatEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCatEntry?.[0] ?? "—";
  const topCategoryAmount = Math.round(topCatEntry?.[1] ?? 0);
  const topCategoryPercent =
    totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  const categories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => `${cat} €${Math.round(amt)}`)
    .join(", ");

  // Prev month estimate from trendVsLastMonth
  const trendPercent = Math.round(stats.trendVsLastMonth ?? 0);
  const prevMonthSpent =
    trendPercent !== 0
      ? Math.round(totalSpent / (1 + trendPercent / 100))
      : Math.round(totalSpent);

  return {
    name,
    totalSpent: Math.round(totalSpent),
    transactionCount: monthTx.length,
    topCategory,
    topCategoryAmount,
    topCategoryPercent,
    categories,
    monthlyFree: Math.round(stats.monthlyFree),
    safeToSpend: Math.round(stats.safeToSpendToday),
    daysLeft: stats.remainingDays,
    goalsCount: 0, // passed from parent if needed, default safe
    prevMonthSpent,
    trendPercent,
  };
}

export function AiCoach({
  stats,
  profile,
  transactions,
  plan,
}: {
  stats: DashboardStats;
  profile: UserProfile | null;
  transactions: Transaction[];
  plan: string;
}) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<PromptType | null>(null);

  async function handlePrompt(promptType: PromptType) {
    setActivePrompt(promptType);
    setLoading(true);
    setResponse(null);

    const context = buildContext(promptType, stats, profile, transactions);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptType, context }),
      });
      const data = await res.json();
      setResponse(data.message || "Il Coach non è disponibile al momento.");
    } catch {
      setResponse("Errore nella comunicazione con il Coach. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const isPro = plan === "pro";

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-[1px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(168,139,250,0.6) 0%, rgba(232,121,249,0.4) 50%, rgba(96,165,250,0.5) 100%)",
      }}
    >
      <div
        className="relative rounded-[19px] px-5 py-5"
        style={{ background: "#0D0A1E" }}
      >
        {/* Glow ambience */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[19px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,139,250,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-iri-violet/20 to-iri-magenta/10 border border-iri-violet/30">
              <Sparkles
                className="h-4 w-4 text-iri-pale animate-pulse"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="m-0 text-[13px] font-medium text-ink-primary">
                  Il tuo Coach personale
                </p>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    background: "rgba(168,139,250,0.15)",
                    border: "1px solid rgba(168,139,250,0.4)",
                    color: "#C4B5FD",
                  }}
                >
                  <span>✦</span> AI Coach Pro
                </span>
              </div>
              <p className="m-0 mt-0.5 text-[11px] text-ink-muted">
                Analisi personalizzata basata sui tuoi dati reali
              </p>
            </div>
          </div>
        </div>

        {/* Buttons grid */}
        <div className="relative grid grid-cols-2 gap-2 mb-3">
          {BUTTONS.slice(0, 4).map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => handlePrompt(btn.id)}
              disabled={loading || !isPro}
              className="flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 text-[13px] text-ink-secondary transition-all duration-[250ms] text-left"
              style={{
                background: "rgba(255,255,255,0.03)",
                border:
                  activePrompt === btn.id && (loading || response)
                    ? "1px solid rgba(168,139,250,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                if (isPro)
                  e.currentTarget.style.border =
                    "1px solid rgba(168,139,250,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border =
                  activePrompt === btn.id && (loading || !!response)
                    ? "1px solid rgba(168,139,250,0.5)"
                    : "1px solid rgba(255,255,255,0.07)";
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center mb-3">
          <button
            key={BUTTONS[4].id}
            type="button"
            onClick={() => handlePrompt(BUTTONS[4].id)}
            disabled={loading || !isPro}
            className="flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 text-[13px] text-ink-secondary transition-all duration-[250ms] text-left"
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                activePrompt === BUTTONS[4].id && (loading || response)
                  ? "1px solid rgba(168,139,250,0.5)"
                  : "1px solid rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
              if (isPro)
                e.currentTarget.style.border =
                  "1px solid rgba(168,139,250,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border =
                activePrompt === BUTTONS[4].id && (loading || !!response)
                  ? "1px solid rgba(168,139,250,0.5)"
                  : "1px solid rgba(255,255,255,0.07)";
            }}
          >
            {BUTTONS[4].label}
          </button>
        </div>

        {/* Response area */}
        {(loading || response) && (
          <div
            className="relative mt-1 rounded-[14px] px-4 py-4"
            style={{
              background: "rgba(168,139,250,0.06)",
              border: "1px solid rgba(168,139,250,0.15)",
            }}
          >
            {!loading && response && (
              <button
                type="button"
                onClick={() => {
                  setResponse(null);
                  setActivePrompt(null);
                }}
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {loading ? (
              <div className="flex flex-col gap-2 pr-4">
                <div
                  className="h-3 w-3/4 rounded-full animate-pulse"
                  style={{ background: "rgba(168,139,250,0.15)" }}
                />
                <div
                  className="h-3 w-full rounded-full animate-pulse"
                  style={{
                    background: "rgba(168,139,250,0.10)",
                    animationDelay: "150ms",
                  }}
                />
                <div
                  className="h-3 w-5/6 rounded-full animate-pulse"
                  style={{
                    background: "rgba(168,139,250,0.08)",
                    animationDelay: "300ms",
                  }}
                />
              </div>
            ) : (
              <p className="m-0 pr-6 font-serif text-[15px] italic leading-[1.65] text-ink-primary">
                {response}
              </p>
            )}
          </div>
        )}

        {/* Pro overlay */}
        {!isPro && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[19px] px-6 text-center"
            style={{ background: "rgba(10,8,18,0.82)", backdropFilter: "blur(6px)" }}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-iri-violet/20 to-iri-magenta/10 border border-iri-violet/30">
              <Sparkles className="h-5 w-5 text-iri-pale" strokeWidth={1.8} />
            </div>
            <p className="m-0 text-[14px] font-medium text-ink-primary">
              Funzione disponibile con Piano Pro
            </p>
            <p className="m-0 mt-1 text-[12px] text-ink-secondary">
              Ottieni analisi AI personalizzate basate sui tuoi dati reali.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_6px_20px_-6px_rgba(168,139,250,0.6)] transition-all [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
            >
              Scopri Pro →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
