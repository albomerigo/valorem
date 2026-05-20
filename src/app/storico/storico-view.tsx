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
  Lock,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Link from "next/link";
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
  const isFree = (profile.plan || "free") === "free";

  // Free plan: show only current month
  const now = new Date();
  const currentSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const visibleRecaps = isFree
    ? recaps.filter((e) => e.slug === currentSlug)
    : recaps;

  const agg = useMemo(() => {
    if (visibleRecaps.length === 0) return null;

    const totalSpent = visibleRecaps.reduce((s, e) => s + e.recap.totalSpent, 0);
    const totalTransactions = visibleRecaps.reduce((s, e) => s + e.recap.transactionCount, 0);
    const totalImpulsesSaved = visibleRecaps.reduce((s, e) => s + e.recap.savedFromImpulses, 0);
    const totalInvested = visibleRecaps.reduce((s, e) => s + e.recap.capitalInvested, 0);
    const avgMonthlySpent = totalSpent / visibleRecaps.length;

    const bestEntry = [...visibleRecaps].sort((a, b) => b.recap.netValue - a.recap.netValue)[0];

    const sortedAsc = [...visibleRecaps].reverse();
    const firstRecap = sortedAsc[0].recap;
    const lastRecap = sortedAsc[sortedAsc.length - 1].recap;
    const generalTrend =
      firstRecap.totalSpent > 0
        ? ((lastRecap.totalSpent - firstRecap.totalSpent) / firstRecap.totalSpent) * 100
        : null;

    const catTotals: Record<string, number> = {};
    for (const { recap } of visibleRecaps) {
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
  }, [visibleRecaps]);

  const headerSubtitle = agg
    ? `${agg.totalTransactions} transazion${agg.totalTransactions === 1 ? "e" : "i"} tracciate · ${splitCurrency(agg.totalImpulsesSaved).int}€ salvati dagli impulsi · ${splitCurrency(agg.totalInvested).int}€ investiti`
    : "Nessuna transazione ancora";


  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="storico" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Storico" />

          <header className="mb-10 mt-8">
            <p className="eyebrow-accent mb-2 text-[10px]">La tua storia finanziaria</p>
            <h1 className="m-0 font-serif text-[36px] font-normal italic leading-tight text-ink-primary md:text-[44px]">
              {visibleRecaps.length} {visibleRecaps.length === 1 ? "mese" : "mesi"} di crescita
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-secondary">
              {headerSubtitle}
            </p>
            {visibleRecaps.length > 3 && (
              <p className="mt-3 font-serif text-[15px] italic leading-[1.5] text-iri-pale/80">
                Ogni mese che passa, la tua consapevolezza cresce.
              </p>
            )}
          </header>

          {/* FREE PLAN BANNER */}
          {isFree && (
            <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-iri-violet/20 bg-iri-violet/[0.05] px-4 py-3.5">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-iri-pale" strokeWidth={1.6} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink-secondary">
                  Con il piano gratuito vedi solo il mese corrente. Passa a Premium per lo storico completo.
                </p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 rounded-full border border-iri-violet/40 bg-iri-violet/[0.1] px-3 py-1.5 text-[11px] font-medium text-iri-pale transition-all hover:border-iri-violet/60 hover:bg-iri-violet/[0.18]"
              >
                Premium →
              </Link>
            </div>
          )}

          {visibleRecaps.length === 0 ? (
            <EmptyStorico />
          ) : (
            <>
              {agg && (
                <section className="mb-10">
                  <p className="eyebrow mb-5 text-[10px]">La tua crescita</p>
                  <AggregateKPIs agg={agg} recaps={visibleRecaps} />
                  {visibleRecaps.length > 1 && (
                    <div className="mt-5">
                      <TrendChart recaps={visibleRecaps} avgMonthlySpent={agg.avgMonthlySpent} />
                    </div>
                  )}
                  {visibleRecaps.length > 1 && (
                    <div className="mt-5">
                      <CoachAnalysis agg={agg} recaps={visibleRecaps} />
                    </div>
                  )}
                </section>
              )}

              <p className="eyebrow mb-5 text-[10px]">Mesi</p>
              <div className="flex flex-col gap-4">
                {visibleRecaps.map((entry, i) => (
                  <MonthCard
                    key={entry.slug}
                    entry={entry}
                    isBestMonth={agg?.bestEntry?.slug === entry.slug && visibleRecaps.length > 1}
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
//  GRAFICO TREND MENSILE (Recharts)
// ─────────────────────────────────────────

type ChartDatum = {
  name: string;
  fullName: string;
  spese: number;
  aboveAvg: boolean;
  trendLine: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const barPayload = payload.find((p: { dataKey: string }) => p.dataKey === "spese");
  if (!barPayload) return null;
  const value: number = barPayload.value;
  const fullName: string = barPayload.payload?.fullName ?? "";
  return (
    <div
      style={{
        background: "rgba(13,10,30,0.97)",
        border: "1px solid rgba(168,139,250,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: "#7C6FA0" }}>{fullName}</p>
      <p
        style={{
          margin: "4px 0 0",
          fontFamily: "monospace",
          fontSize: 16,
          fontWeight: 600,
          color: "#F0EEFF",
        }}
      >
        {value?.toFixed(0)}€
      </p>
    </div>
  );
}

function TrendChart({
  recaps,
  avgMonthlySpent,
}: {
  recaps: MonthEntry[];
  avgMonthlySpent: number;
}) {
  const chartData: ChartDatum[] = useMemo(() => {
    const chronological = [...recaps].reverse();
    const raw = chronological.map((entry) => {
      const [yr, mo] = entry.slug.split("-").map(Number);
      const name = new Date(yr, mo - 1, 1)
        .toLocaleDateString("it-IT", { month: "short" })
        .replace(".", "")
        .slice(0, 3);
      return {
        name,
        fullName: entry.recap.monthYear,
        spese: entry.recap.totalSpent,
        aboveAvg: entry.recap.totalSpent > avgMonthlySpent,
      };
    });

    // Linear regression trend
    const n = raw.length;
    if (n < 2) return raw.map((d) => ({ ...d, trendLine: d.spese }));
    const xMean = (n - 1) / 2;
    const yMean = raw.reduce((s, d) => s + d.spese, 0) / n;
    const num = raw.reduce((s, d, i) => s + (i - xMean) * (d.spese - yMean), 0);
    const den = raw.reduce((s, _, i) => s + (i - xMean) ** 2, 0);
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;
    return raw.map((d, i) => ({ ...d, trendLine: Math.max(0, intercept + slope * i) }));
  }, [recaps, avgMonthlySpent]);

  return (
    <div className="glass-panel overflow-hidden rounded-[16px] p-5">
      <p className="eyebrow mb-4 text-[9px]">Spese mensili</p>

      {/* Gradient defs hidden — referenced by Recharts Cell fill */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="chart-grad-above" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F87171" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="chart-grad-below" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A88BFA" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E879F9" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray=""
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "system-ui" }}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(168,139,250,0.06)" }}
          />
          {avgMonthlySpent > 0 && (
            <ReferenceLine
              y={avgMonthlySpent}
              stroke="rgba(168,139,250,0.5)"
              strokeDasharray="4 4"
              label={{
                value: "media",
                position: "insideTopRight",
                fill: "#A88BFA",
                fontSize: 9,
                fontFamily: "system-ui",
              }}
            />
          )}
          <Bar
            dataKey="spese"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={800}
            maxBarSize={48}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.aboveAvg
                    ? "url(#chart-grad-above)"
                    : "url(#chart-grad-below)"
                }
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="trendLine"
            stroke="rgba(168,139,250,0.45)"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 3"
            isAnimationActive
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-3 rounded-sm"
            style={{ background: "linear-gradient(180deg,#F87171,#FB923C)", opacity: 0.85 }}
          />
          <span className="text-[10px] text-ink-muted">Sopra la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-3 rounded-sm"
            style={{ background: "linear-gradient(180deg,#A88BFA,#E879F9)", opacity: 0.85 }}
          />
          <span className="text-[10px] text-ink-muted">Sotto la media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-[1px] w-4"
            style={{
              background:
                "repeating-linear-gradient(90deg,rgba(168,139,250,0.5) 0,rgba(168,139,250,0.5) 4px,transparent 4px,transparent 8px)",
            }}
          />
          <span className="text-[10px] text-ink-muted">Tendenza</span>
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
