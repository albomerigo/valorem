"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/finance";
import type { MonthEntry } from "./page";
import { splitCurrency } from "@/lib/utils";

// ─────────────────────────────────────────
//  CATEGORY EMOJI MAP
// ─────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  Alimentari: "🛒",
  Ristorazione: "🍕",
  Trasporti: "🚗",
  Abbonamento: "🔄",
  Svago: "🎮",
  Salute: "💊",
  Casa: "🏠",
  Shopping: "🛍️",
  Investimenti: "📈",
  Altro: "📌",
};

// ─────────────────────────────────────────
//  MAIN VIEW
// ─────────────────────────────────────────

export function StoricoView({
  profile,
  recaps,
}: {
  profile: UserProfile;
  recaps: MonthEntry[];
}) {
  const router = useRouter();

  // Aggregate stats
  const agg = useMemo(() => {
    if (recaps.length === 0) return null;

    const totalSpent = recaps.reduce((s, e) => s + e.recap.totalSpent, 0);
    const totalTransactions = recaps.reduce(
      (s, e) => s + e.recap.transactionCount,
      0
    );
    const totalSaved = recaps.reduce(
      (s, e) => s + Math.max(0, e.recap.netValue),
      0
    );
    const avgMonthlySpent = totalSpent / recaps.length;

    // Best month = highest netValue
    const bestEntry = [...recaps].sort(
      (a, b) => b.recap.netValue - a.recap.netValue
    )[0];

    // General trend: compare oldest to most recent
    // recaps is sorted desc (most recent first)
    const sorted = [...recaps].reverse(); // oldest first
    const firstRecap = sorted[0].recap;
    const lastRecap = sorted[sorted.length - 1].recap;
    const generalTrend =
      firstRecap.totalSpent > 0
        ? ((lastRecap.totalSpent - firstRecap.totalSpent) /
            firstRecap.totalSpent) *
          100
        : null;

    // Top category overall
    const catTotals: Record<string, number> = {};
    for (const { recap } of recaps) {
      for (const cat of recap.categoryBreakdown) {
        catTotals[cat.name] = (catTotals[cat.name] || 0) + cat.amount;
      }
    }
    const topCatEntry = Object.entries(catTotals).sort(
      ([, a], [, b]) => b - a
    )[0] as [string, number] | undefined;

    return {
      totalSpent,
      totalTransactions,
      totalSaved,
      avgMonthlySpent,
      bestEntry,
      generalTrend,
      topCatEntry,
      sortedAsc: sorted,
    };
  }, [recaps]);

  // Dynamic header subtitle
  const headerSubtitle = agg
    ? `Hai tracciato ${agg.totalTransactions} transazion${agg.totalTransactions === 1 ? "e" : "i"} e risparmiato ${splitCurrency(agg.totalSaved).int}€ in totale`
    : "Nessuna transazione ancora";

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Storico" />

          {/* ── TASK 3: HEADER MIGLIORATO ─────────────────── */}
          <header className="mb-8 mt-8">
            <p className="eyebrow-accent mb-2 text-[10px]">
              La tua storia finanziaria
            </p>
            <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
              {recaps.length}{" "}
              {recaps.length === 1 ? "mese" : "mesi"} di crescita
            </h1>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
              {headerSubtitle}
            </p>
            {recaps.length > 3 && (
              <p className="mt-3 font-serif text-[15px] italic leading-[1.5] text-iri-pale/80">
                Ogni mese che passa, la tua consapevolezza cresce.
              </p>
            )}
          </header>

          {recaps.length === 0 ? (
            <EmptyStorico />
          ) : (
            <>
              {/* ── TASK 1: LA TUA CRESCITA ──────────────────── */}
              {agg && (
                <section className="mb-8">
                  <p className="eyebrow mb-4 text-[10px]">La tua crescita</p>

                  {/* 1a — KPI aggregate */}
                  <AggregateKPIs agg={agg} recaps={recaps} />

                  {/* 1b — Grafico trend */}
                  {recaps.length > 1 && (
                    <div className="mt-4">
                      <TrendChart recaps={recaps} avgMonthlySpent={agg.avgMonthlySpent} />
                    </div>
                  )}

                  {/* 1c — Analisi Coach */}
                  {recaps.length > 1 && (
                    <div className="mt-4">
                      <CoachAnalysis agg={agg} recaps={recaps} />
                    </div>
                  )}
                </section>
              )}

              {/* ── TASK 2: LISTA MESI MIGLIORATA ─────────────── */}
              <p className="eyebrow mb-4 text-[10px]">Mesi</p>
              <div className="flex flex-col gap-3">
                {recaps.map((entry, i) => (
                  <MonthCard
                    key={entry.slug}
                    entry={entry}
                    onClick={() => router.push(`/recap/${entry.slug}`)}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <FabButton />
      <BottomBar />
    </div>
  );
}

// ─────────────────────────────────────────
//  TASK 1a — KPI AGGREGATE
// ─────────────────────────────────────────

type AggData = {
  totalSpent: number;
  totalTransactions: number;
  totalSaved: number;
  avgMonthlySpent: number;
  bestEntry: MonthEntry;
  generalTrend: number | null;
  topCatEntry: [string, number] | undefined;
  sortedAsc: MonthEntry[];
};

function AggregateKPIs({
  agg,
  recaps,
}: {
  agg: AggData;
  recaps: MonthEntry[];
}) {
  const spentSplit = splitCurrency(agg.totalSpent);
  const avgSplit = splitCurrency(agg.avgMonthlySpent);

  const [bestYear, bestMonth] = agg.bestEntry.slug.split("-").map(Number);
  const bestMonthName = new Date(bestYear, bestMonth - 1, 1).toLocaleDateString(
    "it-IT",
    { month: "long" }
  );

  const trendText =
    agg.generalTrend === null
      ? "—"
      : agg.generalTrend < 0
      ? `↓ ${Math.abs(agg.generalTrend).toFixed(0)}% più virtuoso`
      : `↑ +${agg.generalTrend.toFixed(0)}% più spese`;

  const trendColor =
    agg.generalTrend === null
      ? "text-ink-secondary"
      : agg.generalTrend < 0
      ? "text-emerald-300"
      : "text-red-300";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Totale speso"
        value={spentSplit.int}
        dec={spentSplit.dec}
        suffix="€"
        tone="expense"
      />
      <KpiCard
        label="Media mensile"
        value={avgSplit.int}
        dec={avgSplit.dec}
        suffix="€"
      />
      <div className="glass-panel rounded-[12px] px-4 py-3">
        <p className="eyebrow text-[9px]">Mese migliore</p>
        <p className="m-0 mt-1.5 text-[16px] font-medium capitalize text-emerald-300">
          {bestMonthName}
        </p>
        <p className="m-0 mt-0.5 font-mono-tabular text-[10px] text-ink-secondary">
          +{splitCurrency(Math.max(0, agg.bestEntry.recap.netValue)).int}€
          bilancio
        </p>
      </div>
      <div className="glass-panel rounded-[12px] px-4 py-3">
        <p className="eyebrow text-[9px]">Trend generale</p>
        {recaps.length > 1 ? (
          <p className={`m-0 mt-1.5 text-[13px] font-medium ${trendColor}`}>
            {trendText}
          </p>
        ) : (
          <p className="m-0 mt-1.5 text-[13px] text-ink-muted">
            Aggiungi più mesi
          </p>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  dec,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  dec: string;
  suffix: string;
  tone?: "expense" | "income";
}) {
  const color =
    tone === "expense"
      ? "text-red-200"
      : tone === "income"
      ? "text-emerald-200"
      : "text-ink-primary";

  return (
    <div className="glass-panel rounded-[12px] px-4 py-3">
      <p className="eyebrow text-[9px]">{label}</p>
      <p className="m-0 mt-1.5 font-mono-tabular font-medium">
        <span className={`text-[20px] ${color} [letter-spacing:-0.02em]`}>
          {value}
        </span>
        <span className="text-[12px] text-ink-primary/60">,{dec}</span>
        <span className="ml-0.5 text-[11px] text-ink-muted">{suffix}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
//  TASK 1b — GRAFICO TREND MENSILE (SVG)
// ─────────────────────────────────────────

function TrendChart({
  recaps,
  avgMonthlySpent,
}: {
  recaps: MonthEntry[];
  avgMonthlySpent: number;
}) {
  // recaps is desc; reverse for chronological order
  const chronological = useMemo(() => [...recaps].reverse(), [recaps]);

  const maxSpent = Math.max(...chronological.map((e) => e.recap.totalSpent), 1);
  const n = chronological.length;

  const BAR_W = 28;
  const GAP = 8;
  const MAX_BAR_H = 80;
  const LABEL_H = 20;
  const CHART_H = MAX_BAR_H + LABEL_H + 4;
  const TOTAL_W = n * BAR_W + (n - 1) * GAP;

  return (
    <div className="glass-panel overflow-hidden rounded-[14px] p-4">
      <p className="eyebrow mb-3 text-[9px]">Spese mensili</p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${TOTAL_W} ${CHART_H}`}
          width={TOTAL_W}
          height={CHART_H}
          style={{ minWidth: "100%", display: "block" }}
        >
          {chronological.map((entry, i) => {
            const spent = entry.recap.totalSpent;
            const barH = spent > 0 ? (spent / maxSpent) * MAX_BAR_H : 2;
            const x = i * (BAR_W + GAP);
            const y = MAX_BAR_H - barH;
            const isAboveAvg = spent > avgMonthlySpent;
            const fill = isAboveAvg
              ? "rgba(248,113,113,0.75)"
              : "rgba(168,139,250,0.75)";

            const [yr, mo] = entry.slug.split("-").map(Number);
            const monthAbbr = new Date(yr, mo - 1, 1)
              .toLocaleDateString("it-IT", { month: "short" })
              .replace(".", "")
              .slice(0, 3);

            return (
              <g key={entry.slug}>
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={barH}
                  rx={4}
                  fill={fill}
                />
                <text
                  x={x + BAR_W / 2}
                  y={MAX_BAR_H + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="rgba(255,255,255,0.35)"
                  fontFamily="system-ui, sans-serif"
                >
                  {monthAbbr}
                </text>
              </g>
            );
          })}
          {/* Linea media */}
          {avgMonthlySpent > 0 && (
            <line
              x1={0}
              y1={MAX_BAR_H - (avgMonthlySpent / maxSpent) * MAX_BAR_H}
              x2={TOTAL_W}
              y2={MAX_BAR_H - (avgMonthlySpent / maxSpent) * MAX_BAR_H}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400/75" />
          <span className="text-[10px] text-ink-muted">Sopra la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-iri-violet/75" />
          <span className="text-[10px] text-ink-muted">Sotto la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-[1px] w-4"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 3px, transparent 3px, transparent 6px)",
            }}
          />
          <span className="text-[10px] text-ink-muted">Media</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  TASK 1c — ANALISI COACH COMPARATIVA
// ─────────────────────────────────────────

function CoachAnalysis({
  agg,
  recaps,
}: {
  agg: AggData;
  recaps: MonthEntry[];
}) {
  const { generalTrend, topCatEntry, bestEntry, sortedAsc } = agg;

  const [bestYear, bestMonth] = bestEntry.slug.split("-").map(Number);
  const bestMonthName = new Date(bestYear, bestMonth - 1, 1).toLocaleDateString(
    "it-IT",
    { month: "long", year: "numeric" }
  );

  const trendLine = (() => {
    if (generalTrend === null || sortedAsc.length < 2) return null;
    if (generalTrend < -2)
      return `Stai migliorando — le tue spese sono calate del ${Math.abs(generalTrend).toFixed(0)}% dall'inizio. Ogni mese che passa, il tuo equilibrio si fa più solido.`;
    if (generalTrend > 5)
      return `Le tue spese sono cresciute del ${generalTrend.toFixed(0)}% dall'inizio. Ogni dato è un'opportunità di scegliere diversamente — il fatto che tu stia misurando è già metà del lavoro.`;
    return `Le tue spese si sono mantenute stabili nel tempo. La stabilità è un punto di partenza: ora puoi scegliere se ottimizzare o lasciare così.`;
  })();

  const catLine = topCatEntry
    ? `La categoria su cui investi di più in media è ${topCatEntry[0]} — ${splitCurrency(topCatEntry[1]).int}€ complessivi. È una priorità reale nella tua vita finanziaria.`
    : null;

  const bestLine = `Il tuo mese più virtuoso è stato ${bestMonthName}, con un bilancio di +${splitCurrency(Math.max(0, bestEntry.recap.netValue)).int}€. Quella versione di te è sempre accessibile.`;

  const motivational = (() => {
    if (generalTrend !== null && generalTrend < 0)
      return "Continua così. La consapevolezza non si costruisce in un giorno, ma si vede mese per mese.";
    if (recaps.length >= 6)
      return "Sei qui da molti mesi — questo è già un atto di fedeltà verso te stesso. Pochi ci arrivano.";
    return "Ogni mese che registri è un passo in più verso la libertà finanziaria. Il dato da solo vale più di qualsiasi consiglio generico.";
  })();

  return (
    <div
      className="rounded-[16px] p-5"
      style={{
        background: "rgba(168,139,250,0.06)",
        border: "1px solid rgba(168,139,250,0.18)",
      }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Sparkles className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Analisi del Coach</p>
          <p className="m-0 text-[12px] text-ink-secondary">
            Basata sui tuoi dati reali
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {trendLine && (
          <p className="font-serif text-[14px] italic leading-[1.6] text-ink-primary">
            {trendLine}
          </p>
        )}
        {catLine && (
          <p className="text-[13px] leading-[1.6] text-ink-secondary">
            {catLine}
          </p>
        )}
        <p className="text-[13px] leading-[1.6] text-ink-secondary">
          {bestLine}
        </p>
        <p className="border-t border-white/[0.06] pt-3 font-serif text-[13px] italic leading-[1.6] text-iri-pale/90">
          {motivational}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  TASK 2 — MONTH CARD MIGLIORATA
// ─────────────────────────────────────────

function MonthCard({
  entry,
  onClick,
  index,
}: {
  entry: MonthEntry;
  onClick: () => void;
  index: number;
}) {
  const { recap, slug } = entry;
  const [year, month] = slug.split("-").map(Number);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const { int: spentInt, dec: spentDec } = splitCurrency(recap.totalSpent);
  const { int: incomeInt, dec: incomeDec } = splitCurrency(recap.totalIncome);
  const net = recap.totalIncome - recap.totalSpent;
  const isPositive = net >= 0;

  // 2a — Estrai titolo narrativo (parte dopo " — ")
  const narrativePill = recap.narrativeTitle.includes(" — ")
    ? recap.narrativeTitle.split(" — ")[1]
    : null;

  // 2c — Miglioramento: trend negativo = spese calate = buono
  const improved =
    recap.trendVsPrevMonth !== null && recap.trendVsPrevMonth < -5;

  const TrendIcon =
    recap.trendVsPrevMonth === null
      ? Minus
      : recap.trendVsPrevMonth > 5
      ? TrendingUp
      : recap.trendVsPrevMonth < -5
      ? TrendingDown
      : Minus;

  const trendColor =
    recap.trendVsPrevMonth === null
      ? "text-ink-muted"
      : recap.trendVsPrevMonth > 5
      ? "text-red-400"
      : recap.trendVsPrevMonth < -5
      ? "text-emerald-400"
      : "text-ink-muted";

  // 2d — delay progressivo
  const delay = index * 80;

  return (
    <button
      onClick={onClick}
      className="group glass-panel w-full rounded-[18px] p-5 text-left transition-all duration-[350ms] hover:bg-white/[0.03] animate-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {/* 2a — Narrative pill + improvement badge */}
      {(narrativePill || improved) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {narrativePill && (
            <span className="inline-flex items-center rounded-full border border-iri-violet/25 bg-iri-violet/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-iri-pale">
              {narrativePill}
            </span>
          )}
          {improved && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
              <Star className="h-2.5 w-2.5" strokeWidth={2} />
              Migliorato
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Info mese */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03]">
            <Calendar className="h-4 w-4 text-iri-pale" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[15px] font-medium capitalize text-ink-primary">
              {monthName}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-secondary">
              {recap.transactionCount}{" "}
              {recap.transactionCount === 1 ? "transazione" : "transazioni"}
              {recap.capitalInvested > 0 &&
                ` · ${splitCurrency(recap.capitalInvested).int}€ investiti`}
            </p>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-faint opacity-0 transition-all duration-[250ms] group-hover:translate-x-0.5 group-hover:text-iri-pale group-hover:opacity-100" />
      </div>

      {/* KPI riga */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Spese
          </p>
          <p className="font-mono-tabular text-[20px] font-medium leading-none text-red-300">
            {spentInt}
            <span className="text-[13px] text-red-300/65">,{spentDec}</span>
            <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
          </p>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Entrate
          </p>
          <p className="font-mono-tabular text-[20px] font-medium leading-none text-emerald-300">
            {incomeInt}
            <span className="text-[13px] text-emerald-300/65">,{incomeDec}</span>
            <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
          </p>
        </div>

        <div className="flex flex-col items-end">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Trend
          </p>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" strokeWidth={2} />
            {recap.trendVsPrevMonth !== null && (
              <span className="font-mono-tabular text-[13px] font-medium">
                {Math.abs(recap.trendVsPrevMonth).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Bilancio
          </p>
          <p
            className={`font-mono-tabular text-[15px] font-medium ${
              isPositive ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {isPositive ? "+" : "−"}
            {splitCurrency(Math.abs(net)).int}€
          </p>
        </div>
      </div>

      {/* 2b — Top categoria */}
      {recap.topCategory && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.04] pt-3">
          <span className="text-[13px]">
            {CAT_EMOJI[recap.topCategory.name] ?? "📌"}
          </span>
          <span className="text-[11px] text-ink-secondary">
            {recap.topCategory.name} ·{" "}
            <span className="font-mono-tabular text-ink-primary">
              {splitCurrency(recap.topCategory.amount).int}€
            </span>
          </span>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────

function EmptyStorico() {
  return (
    <div className="glass-panel rounded-[18px] p-10 text-center">
      <p className="font-serif text-[24px] italic text-ink-primary">
        Nessun mese ancora.
      </p>
      <p className="mt-3 text-[13px] text-ink-secondary">
        Aggiungi le tue prime transazioni per vedere la cronologia mensile.
      </p>
    </div>
  );
}
