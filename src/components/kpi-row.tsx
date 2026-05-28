"use client";

import { useRef } from "react";
import { TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";

export function KPIRow({
  stats,
  weeklyBudget,
  weeklySpent,
  weeklyInvested,
}: {
  stats: DashboardStats;
  weeklyBudget?: number[];
  weeklySpent?: number[];
  weeklyInvested?: number[];
}) {
  const { remainingBudget, spentToday, capitalInvested, capitalInvestedCount, trendVsLastMonth } = stats;
const monthlyFreeSplit = splitCurrency(remainingBudget);
  const spentTodaySplit = splitCurrency(spentToday);
  const investedSplit = splitCurrency(capitalInvested);

  return (
    <div
      className="grid grid-cols-3 gap-4 animate-slide-up [animation-delay:0.2s]"
      style={{ animationFillMode: "both" }}
    >
      <div className="relative">
        <HelpTooltip
  title="Disponibile mensile"
  content="È quanto puoi ancora spendere questo mese in modo sereno. Si aggiorna ad ogni transazione sottraendo le spese già fatte dal tuo budget libero mensile."
  example="Es: 750€ budget libero - 320€ già spesi = 430€ ancora disponibili"
/>
        <KPITile
          label="Disponibile mensile"
          valueInt={monthlyFreeSplit.int}
          valueDec={monthlyFreeSplit.dec}
          valueColor="#A88BFA"
          weeklyData={weeklyBudget}
          accentColor="#A88BFA"
          trend={
          trendVsLastMonth !== 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] text-emerald-300 font-mono-tabular">
              <TrendingUp className="h-2.5 w-2.5" />
              +{trendVsLastMonth}% vs mese scorso
            </span>
          ) : (
            <span className="eyebrow text-[9px]">budget libero</span>
          )
        }
        />
      </div>
      <KPITile
        label="Spese oggi"
        valueInt={spentTodaySplit.int}
        valueDec={spentTodaySplit.dec}
        valueColor="#F87171"
        weeklyData={weeklySpent}
        accentColor="#F87171"
        trend={<Equalizer />}
      />
      <KPITile
        label="Capitale investito"
        valueInt={investedSplit.int}
        valueDec={investedSplit.dec}
        valueColor="#60A5FA"
        weeklyData={weeklyInvested}
        accentColor="#60A5FA"
        trend={
          <span className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] text-emerald-300 font-mono-tabular">
            <TrendingUp className="h-2.5 w-2.5" />
            {capitalInvestedCount === 0
              ? "nessuna operazione"
              : capitalInvestedCount === 1
              ? "1 operazione"
              : `${capitalInvestedCount} operazioni`}
          </span>
        }
      />
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const W = 100;
  const H = 20;
  const max = Math.max(...data, 0.01);
  const n = data.length;
  const toX = (i: number) => (i / (n - 1)) * W;
  const toY = (v: number) => H - (v / max) * H * 0.85;
  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < n; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    line += ` C ${cpx} ${pts[i - 1].y} ${cpx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${line} L ${pts[n - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      style={{ height: H }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace("#", "")})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KPITile({
  label,
  valueInt,
  valueDec,
  valueSuffix,
  trend,
  valueGradThick = false,
  valueColor,
  weeklyData,
  accentColor = "#A88BFA",
}: {
  label: string;
  valueInt: string;
  valueDec?: string;
  valueSuffix?: string;
  trend: React.ReactNode;
  valueGradThick?: boolean;
  valueColor?: string;
  weeklyData?: number[];
  accentColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      `${((e.clientX - rect.left) / rect.width) * 100}%`
    );
    el.style.setProperty(
      "--my",
      `${((e.clientY - rect.top) / rect.height) * 100}%`
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="glass-panel group relative overflow-hidden rounded-[18px] px-3 py-[10px] md:px-5 md:py-[18px] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[3px] hover:border-iri-violet/25 hover:shadow-[0_20px_40px_-12px_rgba(168,139,250,0.3)]"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(168,139,250,0.15), transparent 50%)",
        }}
      />

      <p className="font-serif italic text-[10px] tracking-[0.14em] text-ink-muted mb-2 hidden md:block uppercase">{label}</p>

      <p className="m-0 font-mono-tabular font-medium">
        {valueGradThick ? (
          <span className="iri-text text-[24px] md:text-[32px] font-bold [letter-spacing:-0.03em]">
            {valueInt}
          </span>
        ) : (
          <>
            <span
              className="font-serif text-[20px] md:text-[26px] font-normal [letter-spacing:-0.02em]"
              style={valueColor ? { color: valueColor } : undefined}
            >
              {valueInt}
            </span>
            {valueDec && (
              <span className="text-[12px] md:text-[16px] font-normal text-ink-primary/60">
                ,{valueDec}
              </span>
            )}
            <span className="ml-0.5 text-[12px] md:text-[14px] font-normal text-ink-muted">€</span>
          </>
        )}
        {valueSuffix && (
          <span className="text-[14px] font-normal text-ink-muted">
            {valueSuffix}
          </span>
        )}
      </p>

      <div className="mt-1.5 md:mt-2.5 flex items-center gap-1.5">{trend}</div>

      {weeklyData && weeklyData.length >= 2 && (
        <div className="mt-2 w-full">
          <MiniSparkline data={weeklyData} color={accentColor} />
        </div>
      )}
    </div>
  );
}

function Equalizer() {
  const heights = [4, 6, 8, 5, 10];
  return (
    <>
      <div className="flex h-2.5 items-end gap-[2px]">
        {heights.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm bg-gradient-to-b from-iri-violet to-iri-magenta animate-float-y"
            style={{ height: `${h}px`, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="eyebrow text-[9px] text-iri-pale/85">in corso</span>
    </>
  );
}