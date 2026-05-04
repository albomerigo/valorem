"use client";

import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type DailyPoint = { date: string; amount: number; label: string };

const W = 600;
const H = 160;
const PAD = { top: 24, right: 8, bottom: 8, left: 8 };

function toX(i: number, total: number) {
  return PAD.left + (i / Math.max(total - 1, 1)) * (W - PAD.left - PAD.right);
}

function toY(amount: number, max: number) {
  return PAD.top + (1 - amount / max) * (H - PAD.top - PAD.bottom);
}

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
    const avg = data.length > 0 ? total / data.length : 0;
    const half = Math.floor(data.length / 2);
    const firstAvg =
      data.slice(0, half).reduce((s, d) => s + d.amount, 0) /
      Math.max(half, 1);
    const secondAvg =
      data.slice(half).reduce((s, d) => s + d.amount, 0) /
      Math.max(data.length - half, 1);
    const trendValue =
      firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    return { maxAmount: max, totalSpent: total, avgDaily: avg, trend: trendValue };
  }, [data, dailyBudgetBase]);

  if (data.length === 0) return null;

  const points = data.map((d, i) => ({
    x: toX(i, data.length),
    y: toY(d.amount, maxAmount),
  }));

  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${H - PAD.bottom}` +
    ` L ${points[0].x},${H - PAD.bottom} Z`;

  const budgetY = dailyBudgetBase > 0 ? toY(dailyBudgetBase, maxAmount) : null;
  const avgY = toY(avgDaily, maxAmount);

  const xLabels = [
    { i: 0, label: data[0].label },
    { i: Math.floor(data.length / 2), label: data[Math.floor(data.length / 2)].label },
    { i: data.length - 1, label: "oggi" },
  ];

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPt = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[18px] p-5 animate-slide-up [animation-delay:0.25s]"
      style={{ animationFillMode: "both" }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-[13px] font-medium text-ink-primary">
            Il tuo ritmo di spesa
          </h3>
          <p className="eyebrow mt-0.5 text-[9px]">
            Ultime 4 settimane · ogni giorno
          </p>
        </div>

        <div className="flex items-center gap-2">
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
                  ? "bg-red-500/10 text-red-300"
                  : "bg-emerald-500/10 text-emerald-300"
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

      {/* SVG Chart */}
      <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A88BFA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#A88BFA" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* 1. Area fill — disegnata per prima (sotto tutto) */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* 2. Linea media */}
          <line
            x1={PAD.left} y1={avgY}
            x2={W - PAD.right} y2={avgY}
            stroke="#A88BFA"
            strokeWidth="0.8"
            strokeDasharray="3 4"
            strokeOpacity="0.35"
          />

          {/* 3. Linea budget */}
          {budgetY !== null && (
            <line
              x1={PAD.left} y1={budgetY}
              x2={W - PAD.right} y2={budgetY}
              stroke="#E879F9"
              strokeWidth="0.8"
              strokeDasharray="4 5"
              strokeOpacity="0.4"
            />
          )}

          {/* 4. Linea principale — sopra le linee di riferimento */}
          <path
            d={linePath}
            fill="none"
            stroke="#A88BFA"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 5. Etichetta soglia — sopra tutto, inclusa la linea principale */}
          {budgetY !== null && (
            <g>
              <rect
                x={W - PAD.right - 52}
                y={budgetY - 14}
                width={50}
                height={13}
                rx="3"
                fill="#1a1030"
              />
              <text
                x={W - PAD.right - 4}
                y={budgetY - 4}
                fontSize="9"
                fill="#E879F9"
                fillOpacity="0.9"
                textAnchor="end"
                fontFamily="monospace"
              >
                soglia {dailyBudgetBase.toFixed(0)}€
              </text>
            </g>
          )}

          {/* 6. Dot e linea verticale al hover — sempre sopra */}
          {hoveredPt && hoveredPoint && (
            <>
              <line
                x1={hoveredPt.x} y1={PAD.top}
                x2={hoveredPt.x} y2={H - PAD.bottom}
                stroke="#A88BFA"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />
              <circle
                cx={hoveredPt.x} cy={hoveredPt.y}
                r="4"
                fill="#12101e"
                stroke="#A88BFA"
                strokeWidth="1.5"
              />
              <circle
                cx={hoveredPt.x} cy={hoveredPt.y}
                r="1.5"
                fill="#A88BFA"
              />
            </>
          )}

          {/* 7. Aree invisibili per hover — sempre last */}
          {data.map((_, i) => {
            const x = toX(i, data.length);
            const slotW = W / data.length;
            return (
              <rect
                key={i}
                x={x - slotW / 2}
                y={0}
                width={slotW}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "crosshair" }}
              />
            );
          })}
        </svg>
      </div>

      {/* X axis labels */}
      <div className="mt-1.5 flex justify-between text-[9px] text-ink-muted">
        {xLabels.map(({ i, label }) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* Legenda — testo più grande */}
      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-5 rounded-full bg-iri-violet opacity-80" />
          <span className="text-[11px] text-ink-secondary">spesa giornaliera</span>
        </div>
        {budgetY !== null && (
          <div className="flex items-center gap-2">
            <div
              className="h-[1px] w-5"
              style={{
                background: "repeating-linear-gradient(90deg, #E879F9 0px, #E879F9 4px, transparent 4px, transparent 8px)",
              }}
            />
            <span className="text-[11px] text-ink-secondary">soglia budget</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="h-[1px] w-5"
            style={{
              background: "repeating-linear-gradient(90deg, #A88BFA 0px, #A88BFA 3px, transparent 3px, transparent 6px)",
              opacity: 0.4,
            }}
          />
          <span className="text-[11px] text-ink-secondary">media periodo</span>
        </div>
      </div>

      {/* Tooltip — sfondo opaco */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute bottom-14 left-1/2 z-10 -translate-x-1/2 rounded-xl px-3 py-2"
          style={{
            background: "#1a1030",
            border: "1px solid rgba(168,139,250,0.25)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          <p className="m-0 text-[11px] text-ink-secondary">{hoveredPoint.label}</p>
          <p className="m-0 font-mono-tabular text-[15px] font-semibold text-ink-primary">
            {hoveredPoint.amount.toFixed(2).replace(".", ",")}
            <span className="ml-0.5 text-[11px] font-normal text-ink-muted">€</span>
          </p>
          {dailyBudgetBase > 0 && (
            <p className={`m-0 text-[10px] ${hoveredPoint.amount > dailyBudgetBase ? "text-red-400" : "text-emerald-400"}`}>
              {hoveredPoint.amount > dailyBudgetBase
                ? `+${(hoveredPoint.amount - dailyBudgetBase).toFixed(0)}€ sulla soglia`
                : `−${(dailyBudgetBase - hoveredPoint.amount).toFixed(0)}€ dalla soglia`}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
        <p className="eyebrow text-[9px]">Totale speso nel periodo</p>
        <p className="m-0 font-mono-tabular text-[13px] font-medium text-ink-primary">
          {totalSpent.toFixed(2).replace(".", ",")}
          <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
        </p>
      </div>
    </div>
  );
}