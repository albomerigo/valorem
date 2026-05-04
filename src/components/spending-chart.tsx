"use client";

import { useState, useMemo, useRef } from "react";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

type DailyPoint = { date: string; amount: number; label: string };

// SVG coordinate system
const VW = 600;
const VH = 260;
const YL = 52;   // left margin for Y-axis labels
const YR = 12;   // right margin
const YT = 20;   // top padding
const YB = 24;   // bottom (holds X-axis date labels)
const DX = YL;               // drawing area x start
const DW = VW - YL - YR;    // drawing area width
const DY = YT;               // drawing area y start
const DH = VH - YT - YB;    // drawing area height

function toSvgPts(data: DailyPoint[], max: number) {
  const n = data.length;
  if (n === 0) return [];
  return data.map((d, i) => ({
    x: DX + (n > 1 ? i / (n - 1) : 0) * DW,
    y: DY + (1 - d.amount / max) * DH,
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
  if (n < 4) return null;
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
    const fAvg =
      data.slice(0, half).reduce((s, d) => s + d.amount, 0) /
      Math.max(half, 1);
    const sAvg =
      data.slice(half).reduce((s, d) => s + d.amount, 0) /
      Math.max(data.length - half, 1);
    return {
      maxAmount: max,
      totalSpent: total,
      avgDaily: avg,
      trend: fAvg > 0 ? ((sAvg - fAvg) / fAvg) * 100 : 0,
    };
  }, [data, dailyBudgetBase]);

  const pts = useMemo(() => toSvgPts(data, maxAmount), [data, maxAmount]);
  const linePath = useMemo(() => bezier(pts), [pts]);
  const areaFillPath = useMemo(() => closedArea(pts, DY + DH), [pts]);

  const budgetY =
    dailyBudgetBase > 0
      ? DY + (1 - dailyBudgetBase / maxAmount) * DH
      : null;
  const avgY = DY + (1 - avgDaily / maxAmount) * DH;

  const reg = useMemo(() => linearReg(pts), [pts]);
  const trendLine = useMemo(() => {
    if (!reg) return null;
    const clamp = (v: number) => Math.max(DY, Math.min(DY + DH, v));
    return {
      x1: DX,
      y1: clamp(reg.intercept + reg.slope * DX),
      x2: DX + DW,
      y2: clamp(reg.intercept + reg.slope * (DX + DW)),
    };
  }, [reg]);
  // slope < 0 in SVG = Y decreasing left-to-right = amounts increasing = bad
  const trendBad = reg ? reg.slope < -0.08 : false;
  const trendGood = reg ? reg.slope > 0.08 : false;

  const hPt = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hSvg = hoveredIndex !== null ? pts[hoveredIndex] : null;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || pts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    // preserveAspectRatio="none" → direct linear mapping
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

  // Y-axis: 4 labelled grid lines at 0%, 33%, 66%, 100%
  const gridLines = [0, 0.33, 0.66, 1].map((f) => ({
    y: DY + (1 - f) * DH,
    label: f === 0 ? "0" : `${(maxAmount * f).toFixed(0)}`,
  }));

  // X-axis: first, mid, last labels inside SVG bottom margin
  const xLabels = [
    { x: DX, text: data[0]?.label ?? "" },
    { x: DX + DW / 2, text: data[Math.floor(data.length / 2)]?.label ?? "" },
    { x: DX + DW, text: "oggi" },
  ];

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[18px] animate-slide-up [animation-delay:0.25s]"
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
          0%,100% { stroke: #a88bfa; filter: drop-shadow(0 0 10px #a88bfabb); }
          25%      { stroke: #e879f9; filter: drop-shadow(0 0 10px #e879f9bb); }
          50%      { stroke: #60a5fa; filter: drop-shadow(0 0 10px #60a5fabb); }
          75%      { stroke: #67e8f9; filter: drop-shadow(0 0 10px #67e8f9bb); }
        }
        @keyframes sc-dot {
          0%,100% { fill: #a88bfa; }
          25%      { fill: #e879f9; }
          50%      { fill: #60a5fa; }
          75%      { fill: #67e8f9; }
        }
        @keyframes sc-budget-pulse {
          0%,100% { stroke-opacity: 0.3; }
          50%      { stroke-opacity: 0.75; }
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

      {/* ── Header (padded) ── */}
      <div className="flex items-start justify-between gap-4 px-5 pb-0 pt-5 md:px-6 md:pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
            <Activity className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="m-0 text-[14px] font-medium text-ink-primary">
              Il tuo ritmo di spesa
            </h3>
            <p className="eyebrow mt-0.5 text-[9px]">
              Ultime 4 settimane · ogni giorno
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="eyebrow text-[9px]">Media giornaliera</p>
            <p className="m-0 mt-0.5 font-mono-tabular text-[16px] font-medium text-ink-primary">
              {avgDaily.toFixed(0)}
              <span className="text-[12px] text-ink-muted">€</span>
            </p>
          </div>
          {Math.abs(trend) > 5 && (
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                trend > 0
                  ? "bg-red-500/[0.12] text-red-300"
                  : "bg-emerald-500/[0.12] text-emerald-300"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
              )}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* ── SVG full-bleed ── */}
      <div className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: 260 }}
          onMouseMove={onMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="sc-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a88bfa" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#a88bfa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sc-danger-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.01" />
            </linearGradient>
            {/* Clip to drawing area only */}
            <clipPath id="sc-draw-clip">
              <rect x={DX} y={DY} width={DW} height={DH} />
            </clipPath>
            {/* Left-to-right reveal on mount */}
            <clipPath id="sc-reveal">
              <rect x="0" y="0" width="0" height={VH}>
                <animate
                  attributeName="width"
                  from="0"
                  to={VW}
                  dur="1.6s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.2 0.8 0.2 1"
                  keyTimes="0;1"
                />
              </rect>
            </clipPath>
          </defs>

          {/* ── Y-axis grid lines + labels ── */}
          {gridLines.map(({ y, label }) => (
            <g key={label}>
              {/* Full-width faint rule */}
              <line
                x1={0} y1={y} x2={VW} y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              {/* Y label in left margin */}
              <text
                x={YL - 8} y={y + 4}
                fill="rgba(255,255,255,0.28)"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {label}€
              </text>
            </g>
          ))}

          {/* ── Danger zone above budget ── */}
          {budgetY !== null && (
            <rect
              x={DX} y={DY}
              width={DW}
              height={Math.max(0, budgetY - DY)}
              fill="url(#sc-danger-fill)"
              clipPath="url(#sc-draw-clip)"
            />
          )}

          {/* ── Average dotted reference ── */}
          {data.length > 0 && (
            <line
              x1={DX} y1={avgY} x2={DX + DW} y2={avgY}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              strokeDasharray="3 10"
            />
          )}

          {/* ── Budget threshold ── */}
          {budgetY !== null && (
            <g>
              <line
                x1={DX} y1={budgetY} x2={DX + DW} y2={budgetY}
                stroke="#c4b5fd"
                strokeWidth="1.5"
                strokeDasharray="8 5"
                className="sc-budget"
              />
              {/* Label pill */}
              <rect
                x={DX + 8} y={budgetY - 15}
                width={86} height={14}
                rx={6}
                fill="rgba(168,139,250,0.18)"
              />
              <text
                x={DX + 51} y={budgetY - 4}
                fill="rgba(196,181,253,0.95)"
                fontSize="9"
                textAnchor="middle"
                fontWeight="500"
              >
                soglia {dailyBudgetBase.toFixed(0)}€/g
              </text>
            </g>
          )}

          {/* ── Trend line (regression) ── */}
          {trendLine && (trendBad || trendGood) && (
            <line
              x1={trendLine.x1} y1={trendLine.y1}
              x2={trendLine.x2} y2={trendLine.y2}
              stroke={trendBad ? "#f87171" : "#4ade80"}
              strokeWidth="1.5"
              strokeOpacity="0.5"
              strokeDasharray="10 6"
              className="sc-march"
            />
          )}

          {/* ── Area + glow + line (revealed left-to-right) ── */}
          <g clipPath="url(#sc-reveal)">
            {areaFillPath && (
              <path
                d={areaFillPath}
                fill="url(#sc-area-fill)"
                clipPath="url(#sc-draw-clip)"
              />
            )}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.18"
                className="sc-glow"
              />
            )}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sc-line"
              />
            )}
          </g>

          {/* ── X-axis date labels (inside SVG bottom margin) ── */}
          {xLabels.map(({ x, text }, i) => (
            <text
              key={i}
              x={x}
              y={VH - 5}
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
              textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
              fontFamily="system-ui, sans-serif"
            >
              {text}
            </text>
          ))}

          {/* ── Hover: crosshair + dot ── */}
          {hSvg && (
            <g>
              {/* Vertical crosshair */}
              <line
                x1={hSvg.x} y1={DY}
                x2={hSvg.x} y2={DY + DH}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              {/* Halo */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="13"
                fillOpacity="0.08"
                className="sc-dot"
              />
              {/* Main dot */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="5.5"
                className="sc-dot"
              />
              {/* Center white */}
              <circle
                cx={hSvg.x} cy={hSvg.y} r="2.2"
                fill="white"
                opacity="0.95"
              />
            </g>
          )}
        </svg>

        {/* ── Floating tooltip ── */}
        {hPt && hSvg && (
          <div
            className="pointer-events-none absolute z-20 glass-panel-strong rounded-2xl px-4 py-3 shadow-2xl"
            style={{
              left: `${(hSvg.x / VW) * 100}%`,
              top: `${(hSvg.y / VH) * 100}%`,
              transform:
                hSvg.x / VW > 0.72
                  ? "translate(-100%, -110%)"
                  : hSvg.x / VW < 0.22
                  ? "translate(4px, -110%)"
                  : "translate(-50%, -110%)",
            }}
          >
            <p className="m-0 whitespace-nowrap text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              {hPt.label}
            </p>
            <p className="m-0 mt-0.5 font-mono-tabular text-[22px] font-semibold leading-none text-ink-primary">
              {hPt.amount.toFixed(2).replace(".", ",")}
              <span className="ml-1 text-[14px] font-normal text-ink-muted">€</span>
            </p>
            {dailyBudgetBase > 0 && (
              <p
                className={`m-0 mt-1.5 text-[11px] font-medium ${
                  hPt.amount > dailyBudgetBase
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {hPt.amount > dailyBudgetBase
                  ? `↑ +${(hPt.amount - dailyBudgetBase).toFixed(0)}€ sopra soglia`
                  : `↓ −${(dailyBudgetBase - hPt.amount).toFixed(0)}€ sotto soglia`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Legend + footer (padded) ── */}
      <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <LegendItem
            line={{ color: "#a88bfa", width: 3 }}
            label="spesa giornaliera"
          />
          {dailyBudgetBase > 0 && (
            <LegendItem
              line={{ color: "#c4b5fd", width: 1.5, dash: "5 3" }}
              label="soglia budget"
            />
          )}
          {trendLine && (trendBad || trendGood) && (
            <LegendItem
              line={{
                color: trendBad ? "#f87171" : "#4ade80",
                width: 1.5,
                dash: "6 4",
              }}
              label={trendBad ? "tendenza in aumento" : "tendenza in calo"}
            />
          )}
          <LegendItem
            line={{ color: "rgba(255,255,255,0.22)", width: 1, dash: "2 8" }}
            label="media periodo"
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <p className="eyebrow text-[9px]">Totale speso nel periodo</p>
          <p className="m-0 font-mono-tabular text-[15px] font-semibold text-ink-primary">
            {totalSpent.toFixed(2).replace(".", ",")}
            <span className="ml-0.5 text-[11px] font-normal text-ink-muted">€</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  line,
  label,
}: {
  line: { color: string; width: number; dash?: string };
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="4" viewBox="0 0 24 4" style={{ flexShrink: 0 }}>
        <line
          x1="0" y1="2" x2="24" y2="2"
          stroke={line.color}
          strokeWidth={line.width}
          strokeDasharray={line.dash}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px] text-ink-muted">{label}</span>
    </div>
  );
}
