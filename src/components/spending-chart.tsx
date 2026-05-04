"use client";

import { useState, useMemo, useRef } from "react";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

type DailyPoint = { date: string; amount: number; label: string };

const VW = 600;
const VH = 200;
const PT = 24;
const PB = 8;
const PL = 2;
const PR = 2;
const CH = VH - PT - PB;
const CW = VW - PL - PR;

function toSvgPts(data: DailyPoint[], max: number) {
  const n = data.length;
  if (n === 0) return [];
  return data.map((d, i) => ({
    x: PL + (n > 1 ? i / (n - 1) : 0) * CW,
    y: PT + (1 - d.amount / max) * CH,
  }));
}

function bezier(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cx},${pts[i - 1].y} ${cx},${pts[i].y} ${pts[i].x},${pts[i].y}`;
  }
  return d;
}

function closedArea(pts: { x: number; y: number }[], bottom: number): string {
  if (pts.length < 2) return "";
  const last = pts[pts.length - 1];
  return `${bezier(pts)} L ${last.x},${bottom} L ${pts[0].x},${bottom} Z`;
}

function linearReg(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 3) return null;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (den === 0) return null;
  const slope = num / den;
  return { slope, intercept: my - slope * mx };
}

export function SpendingChart({
  data,
  dailyBudgetBase,
}: {
  data: DailyPoint[];
  dailyBudgetBase: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { maxAmount, totalSpent, avgDaily, trend } = useMemo(() => {
    const amounts = data.map((d) => d.amount);
    const max = Math.max(...amounts, dailyBudgetBase * 1.5, 1);
    const total = amounts.reduce((s, a) => s + a, 0);
    const avg = total / Math.max(data.length, 1);
    const half = Math.floor(data.length / 2);
    const fAvg = data.slice(0, half).reduce((s, d) => s + d.amount, 0) / Math.max(half, 1);
    const sAvg = data.slice(half).reduce((s, d) => s + d.amount, 0) / Math.max(data.length - half, 1);
    return {
      maxAmount: max,
      totalSpent: total,
      avgDaily: avg,
      trend: fAvg > 0 ? ((sAvg - fAvg) / fAvg) * 100 : 0,
    };
  }, [data, dailyBudgetBase]);

  const pts = useMemo(() => toSvgPts(data, maxAmount), [data, maxAmount]);
  const linePath = useMemo(() => bezier(pts), [pts]);
  const areaPath = useMemo(() => closedArea(pts, VH - PB), [pts]);

  const budgetY =
    dailyBudgetBase > 0
      ? PT + (1 - dailyBudgetBase / maxAmount) * CH
      : null;
  const avgY = PT + (1 - avgDaily / maxAmount) * CH;

  const reg = useMemo(() => linearReg(pts), [pts]);
  const trendLine = useMemo(() => {
    if (!reg) return null;
    const clamp = (v: number) => Math.max(PT, Math.min(VH - PB, v));
    return {
      x1: PL,
      y1: clamp(reg.intercept + reg.slope * PL),
      x2: VW - PR,
      y2: clamp(reg.intercept + reg.slope * (VW - PR)),
    };
  }, [reg]);
  // In SVG: higher Y = lower on screen. slope<0 → line goes up = spending increasing = bad
  const trendBad = reg ? reg.slope < -0.05 : false;
  const trendGood = reg ? reg.slope > 0.05 : false;

  const hPt = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hSvg = hoveredIndex !== null ? pts[hoveredIndex] : null;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || pts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VW;
    let ci = 0,
      md = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < md) {
        md = d;
        ci = i;
      }
    });
    setHoveredIndex(ci);
  }

  const gridLines = [0.25, 0.5, 0.75].map((f) => ({
    y: PT + (1 - f) * CH,
    label: `${(maxAmount * f).toFixed(0)}€`,
  }));

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[18px] p-5 md:p-6 animate-slide-up [animation-delay:0.25s]"
      style={{ animationFillMode: "both" }}
    >
      <style>{`
        @keyframes sc-rainbow {
          0%,100% { stroke: #a88bfa; }
          25%      { stroke: #e879f9; }
          50%      { stroke: #60a5fa; }
          75%      { stroke: #67e8f9; }
        }
        @keyframes sc-glow {
          0%,100% { stroke: #a88bfa; filter: drop-shadow(0 0 8px #a88bfaaa); }
          25%      { stroke: #e879f9; filter: drop-shadow(0 0 8px #e879f9aa); }
          50%      { stroke: #60a5fa; filter: drop-shadow(0 0 8px #60a5faaa); }
          75%      { stroke: #67e8f9; filter: drop-shadow(0 0 8px #67e8f9aa); }
        }
        @keyframes sc-dot {
          0%,100% { fill: #a88bfa; }
          25%      { fill: #e879f9; }
          50%      { fill: #60a5fa; }
          75%      { fill: #67e8f9; }
        }
        @keyframes sc-budget-pulse {
          0%,100% { stroke-opacity: 0.35; }
          50%      { stroke-opacity: 0.8; }
        }
        @keyframes sc-trend-march {
          to { stroke-dashoffset: -28; }
        }
        .sc-line   { animation: sc-rainbow 5s linear infinite; }
        .sc-glow   { animation: sc-glow 5s linear infinite; }
        .sc-dot    { animation: sc-dot 5s linear infinite; }
        .sc-budget { animation: sc-budget-pulse 2.8s ease-in-out infinite; }
        .sc-march  { animation: sc-trend-march 1.4s linear infinite; }
      `}</style>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
            <Activity className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="m-0 text-[14px] font-medium text-ink-primary">
              Il tuo ritmo di spesa
            </h3>
            <p className="eyebrow mt-0.5 text-[9px]">Ultime 4 settimane · ogni giorno</p>
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
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full overflow-visible"
          style={{ height: 190 }}
          onMouseMove={onMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="sc-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a88bfa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a88bfa" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="sc-danger-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
            {/* Clip to chart drawing area */}
            <clipPath id="sc-area-clip">
              <rect x={PL} y={PT} width={CW} height={CH} />
            </clipPath>
            {/* Left-to-right reveal on mount */}
            <clipPath id="sc-reveal">
              <rect x="0" y="0" width="0" height={VH}>
                <animate
                  attributeName="width"
                  from="0"
                  to={VW}
                  dur="1.5s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.2 0.8 0.2 1"
                  keyTimes="0;1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* Grid lines */}
          {gridLines.map(({ y, label }) => (
            <g key={label}>
              <line
                x1={PL} y1={y} x2={VW - PR} y2={y}
                stroke="rgba(255,255,255,0.038)"
                strokeWidth="1"
              />
              <text
                x={VW - PR - 2} y={y - 3}
                fill="rgba(255,255,255,0.17)"
                fontSize="8"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          ))}

          {/* Danger zone above budget threshold */}
          {budgetY !== null && (
            <rect
              x={PL} y={PT}
              width={CW}
              height={Math.max(0, budgetY - PT)}
              fill="url(#sc-danger-fill)"
              clipPath="url(#sc-area-clip)"
            />
          )}

          {/* Average reference line */}
          {data.length > 0 && (
            <line
              x1={PL} y1={avgY} x2={VW - PR} y2={avgY}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="2 9"
            />
          )}

          {/* Budget threshold */}
          {budgetY !== null && (
            <g>
              <line
                x1={PL} y1={budgetY} x2={VW - PR} y2={budgetY}
                stroke="#c4b5fd"
                strokeWidth="1.2"
                strokeDasharray="7 5"
                className="sc-budget"
              />
              <rect
                x={PL} y={budgetY - 14}
                width={74} height={13}
                rx={5}
                fill="rgba(168,139,250,0.15)"
              />
              <text
                x={PL + 37} y={budgetY - 4}
                fill="rgba(196,181,253,0.9)"
                fontSize="8"
                textAnchor="middle"
              >
                soglia {dailyBudgetBase.toFixed(0)}€
              </text>
            </g>
          )}

          {/* Trend line (linear regression) with marching-ants animation */}
          {trendLine && (trendBad || trendGood) && (
            <line
              x1={trendLine.x1} y1={trendLine.y1}
              x2={trendLine.x2} y2={trendLine.y2}
              stroke={trendBad ? "#f87171" : "#4ade80"}
              strokeWidth="1.2"
              strokeOpacity="0.45"
              strokeDasharray="9 6"
              className="sc-march"
            />
          )}

          {/* Revealed group: area + glow + line */}
          <g clipPath="url(#sc-reveal)">
            {/* Area fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#sc-area-fill)"
                clipPath="url(#sc-area-clip)"
              />
            )}

            {/* Wide blurred glow layer */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.22"
                className="sc-glow"
              />
            )}

            {/* Main rainbow line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sc-line"
              />
            )}
          </g>

          {/* Hover overlay */}
          {hSvg && (
            <g>
              <line
                x1={hSvg.x} y1={PT}
                x2={hSvg.x} y2={VH - PB}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              {/* Outer halo */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="10"
                fillOpacity="0.1"
                className="sc-dot"
              />
              {/* Main dot */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="4.5"
                className="sc-dot"
              />
              {/* Inner white */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="1.8"
                fill="white"
                opacity="0.9"
              />
            </g>
          )}
        </svg>

        {/* Floating tooltip */}
        {hPt && hSvg && (
          <div
            className="pointer-events-none absolute z-10 glass-panel-strong rounded-xl px-3 py-2 shadow-xl"
            style={{
              left: `${(hSvg.x / VW) * 100}%`,
              top: `${Math.max((hSvg.y / VH) * 100 - 4, 2)}%`,
              transform:
                hSvg.x / VW > 0.75
                  ? "translate(-100%, -115%)"
                  : hSvg.x / VW < 0.2
                  ? "translate(0%, -115%)"
                  : "translate(-50%, -115%)",
            }}
          >
            <p className="m-0 whitespace-nowrap text-[10px] text-ink-secondary">
              {hPt.label}
            </p>
            <p className="m-0 font-mono-tabular text-[14px] font-medium text-ink-primary">
              {hPt.amount.toFixed(2).replace(".", ",")}
              <span className="ml-0.5 text-[10px] text-ink-muted">€</span>
            </p>
            {dailyBudgetBase > 0 && (
              <p
                className={`m-0 mt-0.5 text-[10px] font-medium ${
                  hPt.amount > dailyBudgetBase
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {hPt.amount > dailyBudgetBase
                  ? `+${(hPt.amount - dailyBudgetBase).toFixed(0)}€ sopra soglia`
                  : `−${(dailyBudgetBase - hPt.amount).toFixed(0)}€ sotto soglia`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* X axis */}
      <div className="mt-2 flex justify-between px-0.5 text-[9px] text-ink-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>oggi</span>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <LegendItem
          svg={
            <svg width="22" height="4" viewBox="0 0 22 4">
              <line x1="0" y1="2" x2="22" y2="2" stroke="#a88bfa" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          }
          label="spesa"
        />
        {dailyBudgetBase > 0 && (
          <LegendItem
            svg={
              <svg width="22" height="4" viewBox="0 0 22 4">
                <line x1="0" y1="2" x2="22" y2="2" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="5 3" />
              </svg>
            }
            label="soglia budget"
          />
        )}
        {trendLine && (trendBad || trendGood) && (
          <LegendItem
            svg={
              <svg width="22" height="4" viewBox="0 0 22 4">
                <line
                  x1="0" y1="2" x2="22" y2="2"
                  stroke={trendBad ? "#f87171" : "#4ade80"}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              </svg>
            }
            label={trendBad ? "tendenza ↑" : "tendenza ↓"}
          />
        )}
        <LegendItem
          svg={
            <svg width="22" height="4" viewBox="0 0 22 4">
              <line x1="0" y1="2" x2="22" y2="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 7" />
            </svg>
          }
          label="media"
        />
      </div>

      {/* Footer */}
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

function LegendItem({
  svg,
  label,
}: {
  svg: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {svg}
      <span className="text-[9px] text-ink-muted">{label}</span>
    </div>
  );
}
