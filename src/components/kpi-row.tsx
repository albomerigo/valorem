"use client";

import { useRef } from "react";
import { TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";

export function KPIRow({ stats }: { stats: DashboardStats }) {
  const { monthlyFree, spentToday, capitalInvested, capitalInvestedCount, trendVsLastMonth } = stats;

  const monthlyFreeSplit = splitCurrency(monthlyFree);
  const spentTodaySplit = splitCurrency(spentToday);
  const investedSplit = splitCurrency(capitalInvested);

  return (
    <div
      className="grid grid-cols-3 gap-4 animate-slide-up [animation-delay:0.2s]"
      style={{ animationFillMode: "both" }}
    >
      <KPITile
        label="Disponibile mensile"
        valueInt={monthlyFreeSplit.int}
        valueDec={monthlyFreeSplit.dec}
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
      <KPITile
        label="Spese oggi"
        valueInt={spentTodaySplit.int}
        valueDec={spentTodaySplit.dec}
        trend={<Equalizer />}
      />
      <KPITile
        label="Capitale investito"
        valueInt={investedSplit.int}
        valueDec={investedSplit.dec}
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

function KPITile({
  label,
  valueInt,
  valueDec,
  valueSuffix,
  trend,
  valueGradThick = false,
}: {
  label: string;
  valueInt: string;
  valueDec?: string;
  valueSuffix?: string;
  trend: React.ReactNode;
  valueGradThick?: boolean;
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
      className="glass-panel group relative overflow-hidden rounded-[18px] px-5 py-[18px] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[3px] hover:border-iri-violet/25 hover:shadow-[0_20px_40px_-12px_rgba(168,139,250,0.3)]"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(168,139,250,0.15), transparent 50%)",
        }}
      />

      <p className="eyebrow mb-3">{label}</p>

      <p className="m-0 font-mono-tabular font-medium">
        {valueGradThick ? (
          <span className="iri-text text-[32px] font-bold [letter-spacing:-0.03em]">
            {valueInt}
          </span>
        ) : (
          <>
            <span className="text-[26px] text-ink-primary [letter-spacing:-0.02em]">
              {valueInt}
            </span>
            {valueDec && (
              <span className="text-[16px] font-normal text-ink-primary/60">
                ,{valueDec}
              </span>
            )}
            <span className="ml-0.5 text-[14px] font-normal text-ink-muted">€</span>
          </>
        )}
        {valueSuffix && (
          <span className="text-[14px] font-normal text-ink-muted">
            {valueSuffix}
          </span>
        )}
      </p>

      <div className="mt-2.5 flex items-center gap-1.5">{trend}</div>
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