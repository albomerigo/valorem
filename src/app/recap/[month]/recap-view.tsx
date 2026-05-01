"use client";

import Link from "next/link";
import {
  Sparkles,
  Ghost,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trophy,
  Target,
  ArrowRight,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Repeat2,
  Gamepad2,
  HeartPulse,
  Home as HomeIcon,
  ShoppingBag,
  MoreHorizontal,
  BarChart2,
} from "lucide-react";
import type { UserProfile, DashboardStats } from "@/lib/finance";
import type { RecapData } from "@/lib/recap";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { splitCurrency } from "@/lib/utils";

export function RecapView({
  profile,
  recap,
  stats,
}: {
  profile: UserProfile;
  recap: RecapData;
  stats: DashboardStats;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="dashboard" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-8 md:py-7">
          <Topbar
            userName={profile.name || "ospite"}
            section="Recap mensile"
          />

          {/* HERO NARRATIVO */}
          <HeroRecap recap={recap} />

          {/* TOTALE SPESA + NETTO */}
          <Overview recap={recap} />

          {/* CAPITALE INVESTITO */}
          <InvestedSection recap={recap} />

          {/* BILANCIO GUARDIANO */}
          {recap.savedImpulsesCount > 0 && (
            <GuardianSection recap={recap} stats={stats} />
          )}

          {/* TOP CATEGORIA + DONUT */}
          {recap.categoryBreakdown.length > 0 && (
            <CategoriesSection recap={recap} />
          )}

          {/* GIORNATA PIÙ COSTOSA / VIRTUOSA */}
          {recap.mostExpensiveDay && recap.leastExpensiveDay && (
            <DaysSection recap={recap} />
          )}

          {/* TREND VS MESE SCORSO */}
          {recap.trendVsPrevMonth !== null && (
            <TrendSection recap={recap} />
          )}

          {/* PROGRESSI OBIETTIVI */}
          {recap.goalsProgress.length > 0 && (
            <GoalsSection recap={recap} />
          )}

          {/* CITAZIONE FINALE */}
          <FinalQuote recap={recap} />

          {/* CTA */}
          <div className="mt-10 mb-16 flex justify-center">
            <Link
              href="/settings"
              className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-6 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)]"
            >
              Imposta l&apos;ambizione per il prossimo mese
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="dashboard" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SEZIONI
// ═══════════════════════════════════════════════════════════

function HeroRecap({ recap }: { recap: RecapData }) {
  return (
    <div className="relative mt-6 mb-8 overflow-hidden rounded-[24px] animate-slide-up">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168, 139, 250, 0.22), transparent 70%)",
        }}
      />
      <div className="relative z-10 py-14 text-center">
        <p className="eyebrow-accent mb-4 text-[10px]">
          Recap · {recap.monthYear}
        </p>
        <h1 className="m-0 font-serif text-[42px] font-normal italic leading-[1.1] text-ink-primary md:text-[54px]">
          {recap.narrativeTitle}
        </h1>
      </div>
    </div>
  );
}

function Overview({ recap }: { recap: RecapData }) {
  const spentSplit = splitCurrency(recap.totalSpent);
  const incomeSplit = splitCurrency(recap.totalIncome);
  const netSplit = splitCurrency(Math.abs(recap.netValue));
  const avgSplit = splitCurrency(recap.avgPerDay);

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 animate-slide-up [animation-delay:0.1s]"
      style={{ animationFillMode: "both" }}>
      <StatCard
        eyebrow="Spese totali"
        intPart={spentSplit.int}
        decPart={spentSplit.dec}
        suffix="€"
        tone="expense"
      />
      <StatCard
        eyebrow="Entrate totali"
        intPart={incomeSplit.int}
        decPart={incomeSplit.dec}
        suffix="€"
        tone="income"
      />
      <StatCard
        eyebrow={recap.netValue >= 0 ? "Surplus" : "Deficit"}
        intPart={`${recap.netValue >= 0 ? "+" : "−"}${netSplit.int}`}
        decPart={netSplit.dec}
        suffix="€"
        tone={recap.netValue >= 0 ? "income" : "expense"}
      />
      <StatCard
        eyebrow="Media al giorno"
        intPart={avgSplit.int}
        decPart={avgSplit.dec}
        suffix="€"
      />
    </div>
  );
}

function StatCard({
  eyebrow,
  intPart,
  decPart,
  suffix,
  tone,
}: {
  eyebrow: string;
  intPart: string;
  decPart: string;
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
    <div className="glass-panel rounded-[14px] px-4 py-3">
      <p className="eyebrow text-[9px]">{eyebrow}</p>
      <p className="m-0 mt-1.5 font-mono-tabular font-medium">
        <span className={`text-[22px] ${color} [letter-spacing:-0.02em]`}>
          {intPart}
        </span>
        <span className="text-[13px] text-ink-primary/60">,{decPart}</span>
        <span className="ml-0.5 text-[11px] text-ink-muted">{suffix}</span>
      </p>
    </div>
  );
}

function InvestedSection({ recap }: { recap: RecapData }) {
  const investedSplit = splitCurrency(recap.capitalInvested);
  const count = recap.capitalInvestedCount;
  const hasInvestments = recap.capitalInvested > 0;

  return (
    <div
      className="glass-panel mb-8 overflow-hidden rounded-[20px] p-8 animate-slide-up [animation-delay:0.15s]"
      style={{ animationFillMode: "both" }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-300">
          <BarChart2 className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Capitale investito</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Soldi che restano tuoi, in forma diversa
          </p>
        </div>
      </div>

      {hasInvestments ? (
        <>
          <div className="flex items-baseline gap-2 font-mono-tabular">
            <span className="text-[72px] font-normal leading-[0.9] [letter-spacing:-0.04em] text-emerald-300">
              {investedSplit.int}
            </span>
            <span className="text-[28px] text-ink-primary/60">,{investedSplit.dec}</span>
            <span className="text-[20px] text-ink-muted">€</span>
          </div>
          <p className="mt-2 text-[12px] text-ink-secondary font-mono-tabular">
            {count === 1 ? "1 operazione" : `${count} operazioni`} nel mese
          </p>
          <p className="mt-4 font-serif text-[15px] italic leading-[1.6] text-ink-primary/90">
            Non è una spesa — è capitale che continua a lavorare per te. Escluso dai calcoli di budget perché non è consumo.
          </p>
        </>
      ) : (
        <p className="mt-2 font-serif text-[15px] italic leading-[1.6] text-ink-primary/50">
          Nessun investimento registrato questo mese. Aggiungi una transazione con categoria "Investimenti" per tracciare il tuo capitale.
        </p>
      )}
    </div>
  );
}

function GuardianSection({
  recap,
  stats,
}: {
  recap: RecapData;
  stats: DashboardStats;
}) {
  const savedSplit = splitCurrency(recap.savedFromImpulses);
  const timeSaved = amountToTimeLabel(recap.savedFromImpulses, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);

  return (
    <div className="glass-panel-strong mb-8 overflow-hidden rounded-[20px] p-8 animate-slide-up [animation-delay:0.2s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-300">
          <Ghost className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Bilancio del Guardiano</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Ciò che hai scelto di non spendere
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 font-mono-tabular">
        <span className="hero-number-grad text-[72px] font-normal leading-[0.9] [letter-spacing:-0.04em]">
          {savedSplit.int}
        </span>
        <span className="text-[28px] text-ink-primary/60">,{savedSplit.dec}</span>
        <span className="text-[20px] text-ink-muted">€</span>
      </div>

      <p className="mt-4 font-serif text-[15px] italic leading-[1.6] text-ink-primary/90">
        Hai rifiutato <span className="iri-text font-medium">{recap.savedImpulsesCount}</span>{" "}
        {recap.savedImpulsesCount === 1 ? "impulso" : "impulsi"} — equivalente a{" "}
        <span className="iri-text font-medium">{timeSaved}</span> {suffix} che
        non hai dovuto "lavorare" per poi vedere svanire.
      </p>
    </div>
  );
}

function CategoriesSection({ recap }: { recap: RecapData }) {
  const top = recap.categoryBreakdown.slice(0, 5);

  return (
    <div className="glass-panel mb-8 rounded-[18px] p-6 animate-slide-up [animation-delay:0.3s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Trophy className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Categorie</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Dove sono andati i tuoi euro
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {top.map((cat, i) => {
          const { Icon, color } = categoryMeta(cat.name);
          const catSplit = splitCurrency(cat.amount);

          return (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03]"
                style={{ color }}
              >
                <Icon className="h-[16px] w-[16px]" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-ink-primary">
                    {cat.name}
                  </span>
                  <span className="font-mono-tabular text-[13px] text-ink-primary">
                    {catSplit.int},{catSplit.dec}
                    <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
                  </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{
                      width: `${cat.percent}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
              <span className="w-10 text-right font-mono-tabular text-[11px] text-ink-secondary">
                {cat.percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DaysSection({ recap }: { recap: RecapData }) {
  if (!recap.mostExpensiveDay || !recap.leastExpensiveDay) return null;

  const maxSplit = splitCurrency(recap.mostExpensiveDay.amount);
  const minSplit = splitCurrency(recap.leastExpensiveDay.amount);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 animate-slide-up [animation-delay:0.4s]"
      style={{ animationFillMode: "both" }}>
      <div className="glass-panel rounded-[16px] p-5">
        <div className="mb-3 flex items-center gap-2 text-red-300">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="eyebrow text-[9px]" style={{ color: "inherit", opacity: 0.85 }}>
            Giornata più costosa
          </p>
        </div>
        <p className="m-0 font-mono-tabular font-medium text-ink-primary">
          <span className="text-[24px] [letter-spacing:-0.02em]">
            {maxSplit.int}
          </span>
          <span className="text-[14px] text-ink-primary/60">,{maxSplit.dec}</span>
          <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-secondary">
          {formatItalianDate(recap.mostExpensiveDay.date)}
        </p>
      </div>

      <div className="glass-panel rounded-[16px] p-5">
        <div className="mb-3 flex items-center gap-2 text-emerald-300">
          <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="eyebrow text-[9px]" style={{ color: "inherit", opacity: 0.85 }}>
            Giornata più virtuosa
          </p>
        </div>
        <p className="m-0 font-mono-tabular font-medium text-ink-primary">
          <span className="text-[24px] [letter-spacing:-0.02em]">
            {minSplit.int}
          </span>
          <span className="text-[14px] text-ink-primary/60">,{minSplit.dec}</span>
          <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-secondary">
          {formatItalianDate(recap.leastExpensiveDay.date)}
        </p>
      </div>
    </div>
  );
}

function TrendSection({ recap }: { recap: RecapData }) {
  if (recap.trendVsPrevMonth === null) return null;
  const up = recap.trendVsPrevMonth > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "text-amber-300" : "text-emerald-300";
  const bg = up ? "bg-amber-400/[0.06] border-amber-400/20" : "bg-emerald-400/[0.06] border-emerald-400/20";

  return (
    <div className={`glass-panel mb-8 rounded-[16px] border p-5 animate-slide-up [animation-delay:0.5s] ${bg}`}
      style={{ animationFillMode: "both" }}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${color}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow text-[9px]">Rispetto al mese scorso</p>
          <p className="m-0 mt-0.5 text-[14px] text-ink-primary">
            Hai speso il{" "}
            <span className={`font-mono-tabular font-medium ${color}`}>
              {up ? "+" : ""}
              {recap.trendVsPrevMonth}%
            </span>{" "}
            {up ? "in più" : "in meno"}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoalsSection({ recap }: { recap: RecapData }) {
  return (
    <div className="glass-panel mb-8 rounded-[18px] p-6 animate-slide-up [animation-delay:0.6s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Target className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Obiettivi</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Dove stanno arrivando i tuoi sogni
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {recap.goalsProgress.map((gp) => (
          <div key={gp.goal.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-[20px]">
              {gp.goal.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-ink-primary">
                  {gp.goal.title}
                </span>
                <span className="iri-text font-mono-tabular text-[12px] font-medium">
                  {gp.monthProgressPct}%
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue transition-all duration-[600ms]"
                  style={{ width: `${gp.monthProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalQuote({ recap }: { recap: RecapData }) {
  return (
    <div className="relative my-10 overflow-hidden rounded-[20px] animate-slide-up [animation-delay:0.7s]"
      style={{ animationFillMode: "both" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 50%, rgba(125, 211, 252, 0.08), transparent 70%)",
        }}
      />
      <div className="relative z-10 py-10 px-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-iri-violet">
            <Sparkles className="h-4 w-4 text-[#0A0812]" strokeWidth={2} />
          </div>
        </div>
        <p className="eyebrow-accent mb-3 text-[10px]">Dal tuo Coach</p>
        <p className="mx-auto max-w-[600px] font-serif text-[20px] font-normal italic leading-[1.5] text-ink-primary">
          &ldquo;{recap.coachQuote}&rdquo;
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════

function categoryMeta(category: string): {
  Icon: typeof ShoppingCart;
  color: string;
} {
  const map: Record<string, { Icon: typeof ShoppingCart; color: string }> = {
    Alimentari: { Icon: ShoppingCart, color: "#A88BFA" },
    Ristorazione: { Icon: UtensilsCrossed, color: "#FDA4AF" },
    Trasporti: { Icon: Car, color: "#FCD34D" },
    Abbonamento: { Icon: Repeat2, color: "#93C5FD" },
    Svago: { Icon: Gamepad2, color: "#F0ABFC" },
    Salute: { Icon: HeartPulse, color: "#7DD3FC" },
    Casa: { Icon: HomeIcon, color: "#C4B5FD" },
    Shopping: { Icon: ShoppingBag, color: "#E879F9" },
    Investimenti: { Icon: TrendingUp, color: "#10B981" },
  };
  return map[category] || { Icon: MoreHorizontal, color: "#9CA3AF" };
}

function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}