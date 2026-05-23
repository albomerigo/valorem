"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Ghost,
  TrendingDown,
  Sparkles,
  Trash2,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Gamepad2,
  Repeat2,
  HeartPulse,
  Home as HomeIcon,
  ShoppingCart,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { EmptyCimitero, EmptyCimiteroMonth } from "@/components/empty-states";
import type {
  UserProfile,
  DeclinedSimulation,
  DashboardStats,
} from "@/lib/finance";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { splitCurrency } from "@/lib/utils";
import { deleteDeclinedSimulation } from "@/app/actions/declined";
import { HelpTooltip } from "@/components/help-tooltip";

type Scope = "month" | "all";

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-24 left-1/2 z-[9999] -translate-x-1/2"
      style={{ animation: "toastSlideUp 0.25s ease-out" }}
    >
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div className="flex items-center gap-2 rounded-[12px] border border-iri-violet/40 bg-[#0D0A1E] px-4 py-3 text-[13px] text-iri-pale shadow-[0_8px_32px_-8px_rgba(168,139,250,0.5)]">
        <span className="h-1.5 w-1.5 rounded-full bg-iri-violet" />
        {message}
      </div>
    </div>
  );
}

export function CimiteroView({
  profile,
  declined,
  stats,
}: {
  profile: UserProfile;
  declined: DeclinedSimulation[];
  stats: DashboardStats;
}) {
  const [scope, setScope] = useState<Scope>("month");
  const [toast, setToast] = useState<string | null>(null);

  const monthlyChart = useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const d of declined) {
      const month = d.declined_at.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
    const sorted = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([month, count]) => ({
      month,
      count,
      label: new Date(month + "-15").toLocaleDateString("it-IT", { month: "short" }),
    }));
  }, [declined]);

  const filtered = useMemo(() => {
    if (scope === "all") return declined;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return declined.filter(
      (d) => new Date(d.declined_at) >= monthStart
    );
  }, [declined, scope]);

  const totalSaved = filtered.reduce((sum, d) => sum + Number(d.amount), 0);
  const timeSaved = amountToTimeLabel(totalSaved, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);
  const split = splitCurrency(totalSaved);

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="cimitero" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar
            userName={profile.name || "ospite"}
            section="Cimitero degli Impulsi"
            showBack
          />

          {/* HEADER */}
          <header className="relative mb-8 mt-8">
            <HelpTooltip
              title="Cimitero degli Impulsi"
              content="Ogni acquisto impulsivo che rifiuti viene sepolto qui. A fine mese vedi quanto hai risparmiato grazie alla tua disciplina."
              example="Es: hai resistito a scarpe da 80€ → 80€ nel cimitero"
            />
            <div className="flex items-center gap-3">
              <Ghost
                className="h-5 w-5 text-iri-pale"
                strokeWidth={1.6}
              />
              <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
                Il valore che hai salvato
              </h1>
            </div>
            <p className="mt-2 max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
              Ogni impulso che non hai seguito è diventato libertà futura.
              Questa è la tua memoria delle scelte intelligenti.
            </p>
          </header>

          {/* SCOPE SWITCHER */}
          <div className="mb-6 flex gap-2">
            <ScopePill
              active={scope === "month"}
              onClick={() => setScope("month")}
              label="Mese corrente"
            />
            <ScopePill
              active={scope === "all"}
              onClick={() => setScope("all")}
              label="Dall'inizio"
            />
          </div>

          {/* HERO COUNTER */}
          <HeroCounter
            total={totalSaved}
            split={split}
            timeSaved={timeSaved}
            suffix={suffix}
            count={filtered.length}
            scope={scope}
          />

          {/* LISTA */}
          <div className="mt-6">
            <p className="eyebrow mb-3 px-1">
              {scope === "month" ? "Impulsi del mese" : "Tutti gli impulsi rifiutati"}
            </p>

           {filtered.length === 0 ? (
              scope === "month" ? (
                <EmptyCimiteroMonth />
              ) : (
                <EmptyCimitero />
              )
            ) : (
              <div className="glass-panel overflow-hidden rounded-[18px]">
                {filtered.map((item, i) => (
                  <ImpulseRow
                    key={item.id}
                    item={item}
                    stats={stats}
                    isLast={i === filtered.length - 1}
                    onRemoved={() => setToast("Impulso rimosso")}
                  />
                ))}
              </div>
            )}
          </div>
          {/* BAR CHART: disciplina nel tempo */}
          {monthlyChart.length >= 2 && (
            <div className="mt-8">
              <p className="eyebrow mb-4 px-1">La tua disciplina nel tempo</p>
              <div className="glass-panel rounded-[18px] px-5 py-5">
                <ImpulseBarChart data={monthlyChart} />
              </div>
            </div>
          )}
       </div>
      </div>

      <FabButton />
      <BottomBar activeRoute="cimitero" />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function ScopePill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-[250ms] ${
        active
          ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.08] text-ink-primary"
          : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25 hover:text-iri-pale"
      }`}
    >
      {label}
    </button>
  );
}

function HeroCounter({
  total,
  split,
  timeSaved,
  suffix,
  count,
  scope,
}: {
  total: number;
  split: { int: string; dec: string };
  timeSaved: string;
  suffix: string;
  count: number;
  scope: Scope;
}) {
  const hasData = total > 0;

  return (
    <div className="glass-panel-strong relative overflow-hidden rounded-[24px] p-10">
      <HeroAura />

      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
          <p className="eyebrow-accent text-[10px]">
            Totale salvato{" "}
            {scope === "month" ? "questo mese" : "dall'inizio del percorso"}
          </p>
        </div>

        <div className="flex items-baseline gap-[2px] font-mono-tabular">
          <span className="mt-3.5 self-start text-[24px] font-light text-ink-secondary">
            €
          </span>
          <span className="hero-number-grad text-[112px] font-normal leading-[0.9] [letter-spacing:-0.055em]">
            {split.int}
          </span>
          <span className="ml-0.5 mt-[22px] self-start text-[36px] font-normal text-ink-primary/75 [letter-spacing:-0.02em]">
            ,{split.dec}
          </span>
        </div>

        {hasData ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-4 py-2">
              <TrendingDown
                className="h-3.5 w-3.5 text-cyan-300"
                strokeWidth={1.8}
              />
              <span className="iri-text font-mono-tabular text-[13px]">
                ≡ {timeSaved} {suffix}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-iri-violet/25 bg-iri-violet/[0.06] px-4 py-2">
              <Ghost className="h-3.5 w-3.5 text-iri-pale" strokeWidth={1.8} />
              <span className="font-mono-tabular text-[13px] text-iri-pale">
                {count} {count === 1 ? "impulso evitato" : "impulsi evitati"}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-6 max-w-[420px] font-serif text-[14px] italic text-ink-secondary">
            Qui prenderà forma il tuo capitale invisibile. Ogni acquisto
            simulato e rifiutato dal simulatore finirà in questa pagina.
          </p>
        )}
      </div>
    </div>
  );
}

function HeroAura() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute left-[15%] top-[30%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(125,211,252,0) 0%, rgba(125,211,252,0.4) 25%, rgba(168,139,250,0.3) 50%, rgba(232,121,249,0.35) 75%, rgba(125,211,252,0) 100%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute right-[10%] top-[60%] h-[260px] w-[260px] -translate-y-1/2 rounded-full animate-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(168,139,250,0.3) 0%, rgba(125,211,252,0.15) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}



function ImpulseRow({
  item,
  stats,
  isLast,
  onRemoved,
}: {
  item: DeclinedSimulation;
  stats: DashboardStats;
  isLast: boolean;
  onRemoved?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const amount = Number(item.amount);
  const timeLabel = amountToTimeLabel(amount, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);
  const { int, dec } = splitCurrency(amount);
  const { Icon, color } = categoryMeta(item.category);

  function remove() {
    startTransition(async () => {
      await deleteDeclinedSimulation(item.id);
      onRemoved?.();
    });
  }

  return (
    <div
      className={`group relative flex items-center gap-4 px-5 py-4 transition-all duration-[350ms] hover:bg-white/[0.025] ${
        !isLast ? "border-b border-white/[0.04]" : ""
      } ${isPending ? "opacity-50" : ""}`}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03]"
        style={{ color }}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="m-0 text-[14px] font-medium text-ink-primary">
            {item.merchant}
          </p>
          <p className="m-0 font-mono-tabular text-[14px] font-medium text-iri-pale [letter-spacing:-0.01em]">
            +{int}
            <span className="text-[11px] opacity-65">,{dec}</span>
            <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
          </p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-[11px] text-ink-secondary">
            {item.category || "Altro"} · {formatRelativeDate(item.declined_at)}
          </span>
          <p className="m-0 font-mono-tabular text-[11px] text-ink-muted">
            ≡ {timeLabel} {suffix}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        title="Rimuovi"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-transparent text-ink-faint opacity-0 transition-all duration-[200ms] hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-300 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function categoryMeta(category: string | null): {
  Icon: typeof ShoppingBag;
  color: string;
} {
  const map: Record<string, { Icon: typeof ShoppingBag; color: string }> = {
    Alimentari: { Icon: ShoppingCart, color: "#A88BFA" },
    Ristorazione: { Icon: UtensilsCrossed, color: "#FDA4AF" },
    Trasporti: { Icon: Car, color: "#FCD34D" },
    Svago: { Icon: Gamepad2, color: "#F0ABFC" },
    Salute: { Icon: HeartPulse, color: "#7DD3FC" },
    Casa: { Icon: HomeIcon, color: "#C4B5FD" },
    Shopping: { Icon: ShoppingBag, color: "#E879F9" },
    Investimenti: { Icon: TrendingUp, color: "#10B981" },
  };
  return (
    (category && map[category]) || { Icon: MoreHorizontal, color: "#9CA3AF" }
  );
}

function ImpulseBarChart({
  data,
}: {
  data: { month: string; count: number; label: string }[];
}) {
  const W = 400;
  const H = 80;
  const PAD = { left: 4, right: 4, top: 8, bottom: 20 };
  const max = Math.max(...data.map((d) => d.count), 1);
  const n = data.length;
  const barW = Math.max(4, ((W - PAD.left - PAD.right) / n) * 0.55);
  const gap = (W - PAD.left - PAD.right) / n;

  const barH = H - PAD.top - PAD.bottom;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height: H }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A88BFA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E879F9" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const x = PAD.left + i * gap + gap / 2 - barW / 2;
          const h = (d.count / max) * barH;
          const y = PAD.top + barH - h;
          return (
            <g key={d.month}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill="url(#barGrad)"
              />
              <text
                x={x + barW / 2}
                y={H - 4}
                textAnchor="middle"
                fontSize={9}
                fill="rgba(255,255,255,0.4)"
              >
                {d.label}
              </text>
              <text
                x={x + barW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize={8}
                fill="rgba(168,139,250,0.8)"
              >
                {d.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return "oggi";
  if (sameDay(date, yesterday)) return "ieri";
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}