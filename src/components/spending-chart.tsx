"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { HelpTooltip } from "./help-tooltip";

type DailyPoint = { date: string; amount: number; label: string };

const PALETTE: [number, number, number][] = [
  [168, 139, 250],
  [96,  165, 250],
  [103, 232, 249],
  [232, 121, 249],
  [168, 139, 250],
];

function ledColor(t: number): [number, number, number] {
  const s = ((t % 1) + 1) % 1;
  const scaled = s * (PALETTE.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = PALETTE[Math.min(i, PALETTE.length - 1)];
  const b = PALETTE[Math.min(i + 1, PALETTE.length - 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export function SpendingChart({
  data,
  dailyBudgetBase,
}: {
  data: DailyPoint[];
  dailyBudgetBase: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const hoverIdxRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [hoverInfo, setHoverInfo] = useState<{
    label: string; amount: number; x: number; y: number;
  } | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalSpent = data.reduce((s, d) => s + d.amount, 0);
  const avgDaily = data.length > 0 ? totalSpent / data.length : 0;
  const half = Math.floor(data.length / 2);
  const firstAvg = data.slice(0, half).reduce((s, d) => s + d.amount, 0) / Math.max(half, 1);
  const secondAvg = data.slice(half).reduce((s, d) => s + d.amount, 0) / Math.max(data.length - half, 1);
  const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const isMobile = W < 500;
    const PAD = isMobile
      ? { top: 20, right: 4, bottom: 4, left: 4 }
      : { top: 20, right: 8, bottom: 4, left: 8 };
    const max = Math.max(...data.map(d => d.amount), dailyBudgetBase * 1.5, 1);
    const n = data.length;
    const toX = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
    const toY = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.amount) }));

    // Salva riferimenti per hover
    (canvas as any)._pts = pts;
    (canvas as any)._PAD = PAD;
    (canvas as any)._W = W;

    // Area fill viola uniforme
    const areaGrad = ctx.createLinearGradient(0, PAD.top, 0, H);
    areaGrad.addColorStop(0, "rgba(168,139,250,0.20)");
    areaGrad.addColorStop(1, "rgba(168,139,250,0.01)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[n - 1].x, H - PAD.bottom);
    ctx.lineTo(pts[0].x, H - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Linea media tratteggiata
    const avgY = toY(avgDaily);
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(168,139,250,0.35)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(PAD.left, avgY);
    ctx.lineTo(W - PAD.right, avgY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Linea budget tratteggiata
    const budY = dailyBudgetBase > 0 ? toY(dailyBudgetBase) : null;
    if (budY !== null) {
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(232,121,249,0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(PAD.left, budY);
      ctx.lineTo(W - PAD.right, budY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ═══ LINEA LED ANIMATA ═══
    const gW = W * 3;
    const gX = -(offsetRef.current % 1) * W * 2;
    const lg = ctx.createLinearGradient(gX, 0, gX + gW, 0);
    for (let s = 0; s <= 12; s++) {
      const t = s / 12;
      const [r, g, b] = ledColor(t);
      lg.addColorStop(Math.min(t, 1), `rgb(${r},${g},${b})`);
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineWidth = isMobile ? 2.5 : 2;
    ctx.strokeStyle = lg;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Etichetta soglia — sempre sopra tutto
    if (budY !== null) {
      ctx.fillStyle = "#1a1030";
      ctx.fillRect(W - PAD.right - 58, budY - 15, 56, 14);
      ctx.fillStyle = "rgba(232,121,249,0.9)";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`soglia ${dailyBudgetBase.toFixed(0)}€`, W - PAD.right - 3, budY - 4);
    }

    // Hover dot
    const hoverIdx = hoverIdxRef.current;
    if (hoverIdx !== null) {
      const p = pts[hoverIdx];
      ctx.strokeStyle = "rgba(168,139,250,0.2)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(p.x, PAD.top);
      ctx.lineTo(p.x, H - PAD.bottom);
      ctx.stroke();
      const [r, g, b] = ledColor(hoverIdx / (n - 1) + offsetRef.current);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#12101e";
      ctx.fill();
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
    }
  }, [data, dailyBudgetBase, avgDaily]);

  useEffect(() => {
    if (data.length === 0) return;
    const loop = () => {
      offsetRef.current = (offsetRef.current + 0.007) % 1;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, data]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const PAD = (canvas as any)._PAD || { left: 8, right: 8 };
    const W = (canvas as any)._W || canvas.offsetWidth;
    const n = data.length;
    const idx = Math.round((mx - PAD.left) / ((W - PAD.left - PAD.right) / (n - 1)));
    const ci = Math.max(0, Math.min(n - 1, idx));
    hoverIdxRef.current = ci;
    const pts = (canvas as any)._pts;
    if (!pts) return;
    setHoverInfo({ label: data[ci].label, amount: data[ci].amount, x: pts[ci].x, y: pts[ci].y });
  }, [data]);

  const handleMouseLeave = useCallback(() => {
    hoverIdxRef.current = null;
    setHoverInfo(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const PAD = (canvas as any)._PAD || { left: 8, right: 8 };
    const W = (canvas as any)._W || canvas.offsetWidth;
    const n = data.length;
    const idx = Math.round((mx - PAD.left) / ((W - PAD.left - PAD.right) / (n - 1)));
    const ci = Math.max(0, Math.min(n - 1, idx));
    hoverIdxRef.current = ci;
    const pts = (canvas as any)._pts;
    if (!pts) return;
    setHoverInfo({ label: data[ci].label, amount: data[ci].amount, x: pts[ci].x, y: pts[ci].y });
  }, [data]);

  if (data.length === 0) return null;

  const xLabels = isMobileView
    ? [data[0].label, "oggi"]
    : [data[0].label, data[Math.floor(data.length / 2)].label, "oggi"];

  return (
    <div
      className="glass-panel relative overflow-hidden rounded-[18px] p-5 animate-slide-up [animation-delay:0.25s]"
      style={{ animationFillMode: "both", minHeight: isMobileView ? 0 : undefined }}
    >
      <HelpTooltip
        title="Ritmo di Spesa"
        content="Le tue spese giornaliere nelle ultime 4 settimane. La linea LED ti aiuta a vedere i picchi e i giorni virtuosi a colpo d'occhio."
      />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-[13px] font-medium text-ink-primary">
            Il tuo ritmo di spesa
          </h3>
          <p className="eyebrow mt-0.5 text-[9px]">Ultime 4 settimane · ogni giorno</p>
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
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
              trend > 0 ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {trend > 0
                ? <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
                : <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.5} />}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full" style={{ height: "160px" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
          style={{ cursor: "crosshair", touchAction: "none" }}
        />

        {/* Tooltip */}
        {hoverInfo && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl px-3 py-2"
            style={{
              background: "#1a1030",
              border: "1px solid rgba(168,139,250,0.3)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
              left: Math.max(4, Math.min(hoverInfo.x - 65, 260)),
              top: isMobileView ? 4 : Math.max(0, hoverInfo.y - 72),
              whiteSpace: "nowrap",
            }}
          >
            <p className="m-0 text-[11px] text-ink-secondary">{hoverInfo.label}</p>
            <p className="m-0 font-mono-tabular text-[15px] font-semibold text-ink-primary">
              {hoverInfo.amount.toFixed(2).replace(".", ",")}
              <span className="ml-0.5 text-[11px] font-normal text-ink-muted">€</span>
            </p>
            {dailyBudgetBase > 0 && (
              <p className={`m-0 text-[10px] ${hoverInfo.amount > dailyBudgetBase ? "text-red-400" : "text-emerald-400"}`}>
                {hoverInfo.amount > dailyBudgetBase
                  ? `+${(hoverInfo.amount - dailyBudgetBase).toFixed(0)}€ sulla soglia`
                  : `−${(dailyBudgetBase - hoverInfo.amount).toFixed(0)}€ dalla soglia`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* X labels */}
      <div className="mt-1.5 flex justify-between text-[9px] text-ink-muted">
        {xLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>

      {/* Legenda */}
      <div className="mt-3 hidden md:flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div
            className="h-[2px] w-5 rounded-full"
            style={{ background: "linear-gradient(90deg,#A88BFA,#60A5FA,#67E8F9,#E879F9)" }}
          />
          <span className="text-[11px] text-ink-secondary">spesa giornaliera</span>
        </div>
        {dailyBudgetBase > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-5" style={{ background: "repeating-linear-gradient(90deg,#E879F9 0px,#E879F9 4px,transparent 4px,transparent 8px)" }} />
            <span className="text-[11px] text-ink-secondary">soglia budget</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-5" style={{ background: "repeating-linear-gradient(90deg,rgba(168,139,250,.4) 0px,rgba(168,139,250,.4) 3px,transparent 3px,transparent 6px)" }} />
          <span className="text-[11px] text-ink-secondary">media periodo</span>
        </div>
      </div>

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
