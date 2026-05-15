"use client";

import { useMemo, useState, useEffect } from "react";
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

  const agg = useMemo(() => {
    if (recaps.length === 0) return null;

    const totalSpent = recaps.reduce((s, e) => s + e.recap.totalSpent, 0);
    const totalTransactions = recaps.reduce((s, e) => s + e.recap.transactionCount, 0);
    const totalImpulsesSaved = recaps.reduce((s, e) => s + e.recap.savedFromImpulses, 0);
    const totalInvested = recaps.reduce((s, e) => s + e.recap.capitalInvested, 0);
    const avgMonthlySpent = totalSpent / recaps.length;

    const bestEntry = [...recaps].sort((a, b) => b.recap.netValue - a.recap.netValue)[0];

    const sortedAsc = [...recaps].reverse();
    const firstRecap = sortedAsc[0].recap;
    const lastRecap = sortedAsc[sortedAsc.length - 1].recap;
    const generalTrend =
      firstRecap.totalSpent > 0
        ? ((lastRecap.totalSpent - firstRecap.totalSpent) / firstRecap.totalSpent) * 100
        : null;

    const catTotals: Record<string, number> = {};
    for (const { recap } of recaps) {
      for (const cat of recap.categoryBreakdown) {
        catTotals[cat.name] = (catTotals[cat.name] || 0) + cat.amount;
      }
    }
    const topCatEntry = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0] as
      | [string, number]
      | undefined;

    return {
      totalSpent,
      totalTransactions,
      totalImpulsesSaved,
      totalInvested,
      avgMonthlySpent,
      bestEntry,
      generalTrend,
      topCatEntry,
      sortedAsc,
    };
  }, [recaps]);

  const headerSubtitle = agg
    ? `${agg.totalTransactions} transazion${agg.totalTransactions === 1 ? "e" : "i"} tracciate · ${splitCurrency(agg.totalImpulsesSaved).int}€ salvati dagli impulsi · ${splitCurrency(agg.totalInvested).int}€ investiti`
    : "Nessuna transazione ancora";

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="storico" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Storico" />

          <header className="mb-10 mt-8">
            <p className="eyebrow-accent mb-2 text-[10px]">La tua storia finanziaria</p>
            <h1 className="m-0 font-serif text-[36px] font-normal italic leading-tight text-ink-primary md:text-[44px]">
              {recaps.length} {recaps.length === 1 ? "mese" : "mesi"} di crescita
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-secondary">
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
              {agg && (
                <section className="mb-10">
                  <p className="eyebrow mb-5 text-[10px]">La tua crescita</p>
                  <AggregateKPIs agg={agg} recaps={recaps} />
                  {recaps.length > 1 && (
                    <div className="mt-5">
                      <TrendChart recaps={recaps} avgMonthlySpent={agg.avgMonthlySpent} />
                    </div>
                  )}
                  {recaps.length > 1 && (
                    <div className="mt-5">
                      <CoachAnalysis agg={agg} recaps={recaps} />
                    </div>
                  )}
                </section>
              )}

              <p className="eyebrow mb-5 text-[10px]">Mesi</p>
              <div className="flex flex-col gap-4">
                {recaps.map((entry, i) => (
                  <MonthCard
                    key={entry.slug}
                    entry={entry}
                    isBestMonth={agg?.bestEntry?.slug === entry.slug && recaps.length > 1}
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
      <BottomBar activeRoute="storico" />
    </div>
  );
}

// ─────────────────────────────────────────
//  KPI AGGREGATE
// ─────────────────────────────────────────

type AggData = {
  totalSpent: number;
  totalTransactions: number;
  totalImpulsesSaved: number;
  totalInvested: number;
  avgMonthlySpent: number;
  bestEntry: MonthEntry;
  generalTrend: number | null;
  topCatEntry: [string, number] | undefined;
  sortedAsc: MonthEntry[];
};

function AggregateKPIs({ agg, recaps }: { agg: AggData; recaps: MonthEntry[] }) {
  const spentSplit = splitCurrency(agg.totalSpent);
  const avgSplit = splitCurrency(agg.avgMonthlySpent);
  const savedSplit = splitCurrency(agg.totalImpulsesSaved);

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
      <div className="glass-panel rounded-[16px] p-5">
        <p className="eyebrow text-[9px]">Totale speso</p>
        <p className="m-0 mt-2 font-mono-tabular font-medium">
          <span className="text-[24px] text-red-200 [letter-spacing:-0.03em]">{spentSplit.int}</span>
          <span className="text-[13px] text-red-200/50">,{spentSplit.dec}</span>
          <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[10px] text-ink-muted">
          {recaps.length} {recaps.length === 1 ? "mese tracciato" : "mesi tracciati"}
        </p>
      </div>

      <div className="glass-panel rounded-[16px] p-5">
        <p className="eyebrow text-[9px]">Media mensile</p>
        <p className="m-0 mt-2 font-mono-tabular font-medium">
          <span className="text-[24px] text-ink-primary [letter-spacing:-0.03em]">{avgSplit.int}</span>
          <span className="text-[13px] text-ink-primary/50">,{avgSplit.dec}</span>
          <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[10px] text-ink-muted">per mese</p>
      </div>

      <div className="glass-panel rounded-[16px] p-5">
        <p className="eyebrow text-[9px]">Salvati dagli impulsi</p>
        <p className="m-0 mt-2 font-mono-tabular font-medium">
          <span className="text-[24px] text-cyan-300 [letter-spacing:-0.03em]">{savedSplit.int}</span>
          <span className="text-[13px] text-cyan-300/50">,{savedSplit.dec}</span>
          <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[10px] text-ink-muted">resistiti agli impulsi</p>
      </div>

      <div className="glass-panel rounded-[16px] p-5">
        <p className="eyebrow text-[9px]">Trend generale</p>
        {recaps.length > 1 ? (
          <>
            <p className={`m-0 mt-2 text-[15px] font-medium ${trendColor}`}>{trendText}</p>
            <p className="mt-1 text-[10px] text-ink-muted">dal primo mese</p>
          </>
        ) : (
          <p className="m-0 mt-2 text-[13px] text-ink-muted">Aggiungi più mesi</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  GRAFICO TREND MENSILE (SVG)
// ─────────────────────────────────────────

function TrendChart({
  recaps,
  avgMonthlySpent,
}: {
  recaps: MonthEntry[];
  avgMonthlySpent: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const chronological = useMemo(() => [...recaps].reverse(), [recaps]);
  const maxSpent = Math.max(...chronological.map((e) => e.recap.totalSpent), 1);
  const n = chronological.length;

  const BAR_W = 32;
  const GAP = 10;
  const MAX_BAR_H = 160;
  const LABEL_H = 24;
  const PADDING_Y = 8;
  const CHART_H = MAX_BAR_H + LABEL_H + PADDING_Y;
  const TOTAL_W = Math.max(n * BAR_W + (n - 1) * GAP, 280);

  const avgY = PADDING_Y + MAX_BAR_H - (avgMonthlySpent / maxSpent) * MAX_BAR_H;

  return (
    <div className="glass-panel overflow-hidden rounded-[16px] p-5">
      <p className="eyebrow mb-4 text-[9px]">Spese mensili</p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${TOTAL_W} ${CHART_H}`}
          width={TOTAL_W}
          height={CHART_H}
          style={{ minWidth: "100%", display: "block" }}
        >
          <defs>
            {chronological.map((entry, i) => {
              const isAboveAvg = entry.recap.totalSpent > avgMonthlySpent;
              return (
                <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isAboveAvg ? "#F87171" : "#A88BFA"}
                    stopOpacity="0.95"
                  />
                  <stop
                    offset="100%"
                    stopColor={isAboveAvg ? "#FB923C" : "#E879F9"}
                    stopOpacity="0.55"
                  />
                </linearGradient>
              );
            })}
          </defs>

          {chronological.map((entry, i) => {
            const spent = entry.recap.totalSpent;
            const barH = spent > 0 ? (spent / maxSpent) * MAX_BAR_H : 3;
            const x = i * (BAR_W + GAP);
            const yTop = PADDING_Y + MAX_BAR_H - barH;

            const [yr, mo] = entry.slug.split("-").map(Number);
            const monthAbbr = new Date(yr, mo - 1, 1)
              .toLocaleDateString("it-IT", { month: "short" })
              .replace(".", "")
              .slice(0, 3);

            return (
              <g key={entry.slug}>
                <g
                  style={{
                    transformOrigin: `${x + BAR_W / 2}px ${PADDING_Y + MAX_BAR_H}px`,
                    transform: mounted ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 700ms cubic-bezier(0.2,0.8,0.2,1) ${i * 55}ms`,
                  }}
                >
                  <rect
                    x={x}
                    y={yTop}
                    width={BAR_W}
                    height={barH}
                    rx={6}
                    fill={`url(#bar-grad-${i})`}
                  />
                </g>
                <title>
                  {entry.recap.monthYear}: {entry.recap.totalSpent.toFixed(0)}€
                </title>
                <text
                  x={x + BAR_W / 2}
                  y={PADDING_Y + MAX_BAR_H + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(255,255,255,0.35)"
                  fontFamily="system-ui, sans-serif"
                >
                  {monthAbbr}
                </text>
              </g>
            );
          })}

          {avgMonthlySpent > 0 && (
            <g>
              <line
                x1={0}
                y1={avgY}
                x2={TOTAL_W}
                y2={avgY}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={TOTAL_W - 2}
                y={avgY - 4}
                textAnchor="end"
                fontSize={8}
                fill="rgba(255,255,255,0.35)"
                fontFamily="system-ui, sans-serif"
              >
                media
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-3 rounded-sm"
            style={{ background: "linear-gradient(90deg, #F87171, #FB923C)", opacity: 0.85 }}
          />
          <span className="text-[10px] text-ink-muted">Sopra la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-3 rounded-sm"
            style={{ background: "linear-gradient(90deg, #A88BFA, #E879F9)", opacity: 0.85 }}
          />
          <span className="text-[10px] text-ink-muted">Sotto la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-[1px] w-4"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0, rgba(255,255,255,0.28) 4px, transparent 4px, transparent 8px)",
            }}
          />
          <span className="text-[10px] text-ink-muted">Media</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  ANALISI COACH
// ─────────────────────────────────────────

function CoachAnalysis({ agg, recaps }: { agg: AggData; recaps: MonthEntry[] }) {
  const { generalTrend, topCatEntry, bestEntry, sortedAsc } = agg;

  const [bestYear, bestMonth] = bestEntry.slug.split("-").map(Number);
  const bestMonthName = new Date(bestYear, bestMonth - 1, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

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
      className="rounded-[20px] p-6"
      style={{
        background: "rgba(168,139,250,0.06)",
        border: "1px solid rgba(168,139,250,0.18)",
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-iri-violet/30 text-iri-pale"
          style={{
            background: "linear-gradient(135deg, rgba(168,139,250,0.2), rgba(232,121,249,0.12))",
          }}
        >
          <Sparkles className="h-4 w-4 animate-pulse" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Analisi del Coach</p>
          <p className="m-0 text-[12px] text-ink-secondary">Basata sui tuoi dati reali</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {trendLine && (
          <p className="font-serif text-[15px] font-medium italic leading-[1.6] text-ink-primary">
            {trendLine}
          </p>
        )}
        {catLine && (
          <p className="text-[13px] leading-[1.7] text-ink-secondary">{catLine}</p>
        )}
        <p className="text-[13px] leading-[1.7] text-ink-secondary">{bestLine}</p>
        <p className="border-t border-white/[0.06] pt-4 font-serif text-[14px] italic leading-[1.6] text-iri-pale/90">
          {motivational}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  MONTH CARD
// ─────────────────────────────────────────

function MonthCard({
  entry,
  isBestMonth,
  onClick,
  index,
}: {
  entry: MonthEntry;
  isBestMonth?: boolean;
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

  const narrativePill = recap.narrativeTitle.includes(" — ")
    ? recap.narrativeTitle.split(" — ")[1]
    : null;

  const improved = recap.trendVsPrevMonth !== null && recap.trendVsPrevMonth < -5;

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

  const delay = index * 80;

  return (
    <button
      onClick={onClick}
      className="group glass-panel w-full rounded-[20px] p-6 text-left transition-all duration-[350ms] hover:bg-white/[0.03] animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {/* Badges */}
      {(narrativePill || improved || isBestMonth) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {narrativePill && (
            <span className="inline-flex items-center rounded-full border border-iri-violet/25 bg-iri-violet/[0.08] px-3 py-0.5 text-[10px] font-medium text-iri-pale">
              {narrativePill}
            </span>
          )}
          {isBestMonth && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
              <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
              Migliore mese
            </span>
          )}
          {improved && (
            <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
              <TrendingDown className="h-2.5 w-2.5" strokeWidth={2} />
              Migliorato
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03]">
            <Calendar className="h-4 w-4 text-iri-pale" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[15px] font-medium capitalize text-ink-primary">{monthName}</p>
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

      {/* Coach quote snippet */}
      {recap.coachQuote && (
        <p className="mt-4 border-t border-white/[0.04] pt-4 font-serif text-[12px] italic leading-[1.6] text-ink-muted">
          &ldquo;{recap.coachQuote.length > 110
            ? recap.coachQuote.slice(0, 110) + "…"
            : recap.coachQuote}&rdquo;
        </p>
      )}

      {/* KPI grid */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <div>
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Spese
          </p>
          <p className="font-mono-tabular text-[18px] font-medium leading-none text-red-300">
            {spentInt}
            <span className="text-[11px] text-red-300/65">,{spentDec}</span>
            <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Entrate
          </p>
          <p className="font-mono-tabular text-[18px] font-medium leading-none text-emerald-300">
            {incomeInt}
            <span className="text-[11px] text-emerald-300/65">,{incomeDec}</span>
            <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-ink-muted">
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
        <div className="text-right">
          <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-ink-muted">
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

      {/* Top categoria con progress bar */}
      {recap.topCategory && (
        <div className="mt-4 border-t border-white/[0.04] pt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px]">
                {CAT_EMOJI[recap.topCategory.name] ?? "📌"}
              </span>
              <span className="text-[11px] text-ink-secondary">{recap.topCategory.name}</span>
            </div>
            <span className="font-mono-tabular text-[11px] text-ink-muted">
              {recap.topCategory.percent}%
            </span>
          </div>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet to-iri-magenta"
              style={{ width: `${recap.topCategory.percent}%` }}
            />
          </div>
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
    <div className="glass-panel rounded-[20px] p-12 text-center">
      <p className="font-serif text-[24px] italic text-ink-primary">Nessun mese ancora.</p>
      <p className="mt-3 text-[13px] text-ink-secondary">
        Aggiungi le tue prime transazioni per vedere la cronologia mensile.
      </p>
    </div>
  );
}
