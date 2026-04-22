"use client";

import { useState, useMemo } from "react";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";

type DailyPoint = { date: string; amount: number; label: string };

export function SpendingChart({
  data,
  dailyBudgetBase,
}: {
  data: DailyPoint[];
  dailyBudgetBase: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { maxAmount, totalSpent, avgDaily, trend } = useMemo(() => {
    const amounts = data.map((d) => d.amount);
    const max = Math.max(...amounts, dailyBudgetBase * 1.5, 1);
    const total = amounts.reduce((s, a) => s + a, 0);
    const avg = total / data.length;

    // Confronta prime 2 settimane vs ultime 2
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg =
      firstHalf.reduce((s, d) => s + d.amount, 0) / Math.max(firstHalf.length, 1);
    const secondAvg =
      secondHalf.reduce((s, d) => s + d.amount, 0) / Math.max(secondHalf.length, 1);
    const trendValue =
      firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return { maxAmount: max, totalSpent: total, avgDaily: avg, trend: trendValue };
  }, [data, dailyBudgetBase]);

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[18px] p-6 animate-slide-up [animation-delay:0.25s]"
      style={{ animationFillMode: "both" }}
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
            <BarChart3 className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="m-0 text-[14px] font-medium text-ink-primary">
              Il tuo ritmo di spesa
            </h3>
            <p className="eyebrow mt-0.5 text-[9px]">Ultime 4 settimane</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="eyebrow text-[9px]">Media giornaliera</p>
            <p className="m-0 mt-0.5 font-mono-tabular text-[14px] font-medium text-ink-primary">
              {avgDaily.toFixed(0)}
              <span className="text-[11px] text-ink-muted">€</span>
            </p>
          </div>
          {Math.abs(trend) > 5 && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                trend > 0
                  ? "bg-red-500/[0.1] text-red-300"
                  : "bg-emerald-500/[0.1] text-emerald-300"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.5} />
              )}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[140px]">
        {/* Linea del budget giornaliero */}
        {dailyBudgetBase > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-iri-violet/30"
            style={{
              bottom: `${(dailyBudgetBase / maxAmount) * 100}%`,
            }}
          >
            <span className="absolute -top-4 right-0 rounded bg-iri-violet/[0.15] px-1.5 py-0.5 text-[9px] font-medium text-iri-pale">
              soglia {dailyBudgetBase.toFixed(0)}€
            </span>
          </div>
        )}

        {/* Barre */}
        <div className="absolute inset-0 flex items-end justify-between gap-[2px]">
          {data.map((point, i) => {
            const heightPct = (point.amount / maxAmount) * 100;
            const overBudget = point.amount > dailyBudgetBase && dailyBudgetBase > 0;
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={point.date}
                className="group relative flex-1 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`w-full rounded-t-[3px] transition-all duration-[300ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${
                    isHovered ? "scale-y-[1.03] origin-bottom" : ""
                  }`}
                  style={{
                    height: `${Math.max(heightPct, 1)}%`,
                    background: overBudget
                      ? "linear-gradient(180deg, rgba(252, 165, 165, 0.85) 0%, rgba(225, 72, 72, 0.5) 100%)"
                      : "linear-gradient(180deg, rgba(168, 139, 250, 0.75) 0%, rgba(96, 165, 250, 0.4) 100%)",
                    boxShadow: isHovered
                      ? "0 0 16px rgba(168, 139, 250, 0.6)"
                      : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X axis labels — solo alcuni punti */}
      <div className="mt-2 flex justify-between text-[9px] text-ink-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>oggi</span>
      </div>

      {/* Tooltip fluttuante */}
      {hoveredPoint && (
        <div className="glass-panel-strong absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg px-3 py-2 pointer-events-none z-10">
          <p className="m-0 text-[10px] text-ink-secondary">{hoveredPoint.label}</p>
          <p className="m-0 font-mono-tabular text-[13px] font-medium text-ink-primary">
            {hoveredPoint.amount.toFixed(2).replace(".", ",")}
            <span className="ml-0.5 text-[10px] text-ink-muted">€</span>
          </p>
        </div>
      )}

      {/* Footer con totale */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <p className="eyebrow text-[9px]">Totale speso nel periodo</p>
        <p className="m-0 font-mono-tabular text-[13px] font-medium text-ink-primary">
          {totalSpent.toFixed(2).replace(".", ",")}
          <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
        </p>
      </div>
    </div>
  );
}