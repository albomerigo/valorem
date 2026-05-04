"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type DailyPoint = { date: string; amount: number; label: string };

const PALETTE: [number, number, number][] = [
  [168, 139, 250], // viola
  [96,  165, 250], // blu
  [103, 232, 249], // azzurro
  [232, 121, 249], // fuxia
  [168, 139, 250], // viola (chiude loop)
];

function paletteColor(t: number): [number, number, number] {
  const scaled = t * (PALETTE.length - 1);
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

function getCurvePoints(
  pts: { x: number; y: number }[],
  samples: number
): { x: number; y: number; t: number }[] {
  const result: { x: number; y: number; t: number }[] = [];
  const n = pts.length;
  for (let s = 0; s <= samples; s++) {
    const t = s / samples;
    const rawI = t * (n - 1);
    const i = Math.floor(rawI);
    const f = rawI - i;
    if (i >= n - 1) { result.push({ ...pts[n - 1], t }); continue; }
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    const bx = p0.x + (cpx - p0.x) * f;
    const bx2 = cpx + (p1.x - cpx) * f;
    const x = bx + (bx2 - bx) * f;
    const y = p0.y + (p1.y - p0.y) * f;
    result.push({ x, y, t });
  }
  return result;
}

export function SpendingChart({
  data,
  dailyBudgetBase,
}: {
  data: DailyPoint[];
  dailyBudgetBase: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animOffsetRef = useRef(0);
  const hoverIdxRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [hoverInfo, setHoverInfo] = useState<{
    label: string; amount: number; x: number; y: number;
  } | null>(null);

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

    const PAD = { top: 20, right: 8, bottom: 4, left: 8 };
    const amounts = data.map((d) => d.amount);
    const max = Math.max(...amounts, dailyBudgetBase * 1.5, 1);
    const n = data.length;
    const toX = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
    const toY = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.amount) }));

    // Griglia
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((f) => {
      const y = PAD.top + f * (H - PAD.top - PAD.bottom);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    });

    // Area fill iridescente
    const areaGrad = ctx.createLinearGradient(PAD.left, 0, W - PAD.right, 0);
    areaGrad.addColorStop(0,    "rgba(168,139,250,0.10)");
    areaGrad.addColorStop(0.33, "rgba(96,165,250,0.08)");
    areaGrad.addColorStop(0.66, "rgba(103,232,249,0.08)");
    areaGrad.addColorStop(1,    "rgba(232,121,249,0.10)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[n - 1].x, H - PAD.bottom);
    ctx.lineTo(pts[0].x, H - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Linea media
    const avgY = toY(avgDaily);
    ctx.setLineDash([3, 5]); ctx.strokeStyle = "rgba(168,139,250,0.35)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(PAD.left, avgY); ctx.lineTo(W - PAD.right, avgY); ctx.stroke();
    ctx.setLineDash([]);

    // Linea budget
    const budY = dailyBudgetBase > 0 ? toY(dailyBudgetBase) : null;
    if (budY !== null) {
      ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(232,121,249,0.45)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(PAD.left, budY); ctx.lineTo(W - PAD.right, budY); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Curva densa campionata
    const SAMPLES = 200;
    const curve = getCurvePoints(pts, SAMPLES);
    const animOffset = animOffsetRef.current;
    const hoverIdx = hoverIdxRef.current;
    const isHovering = hoverIdx !== null;

    // Linea animata base (attenuata se hover)
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 1; i < curve.length; i++) {
      const tAnim = ((curve[i].t + animOffset) % 1);
      const [r, g, b] = paletteColor(tAnim);
      ctx.strokeStyle = `rgba(${r},${g},${b},${isHovering ? 0.25 : 1})`;
      ctx.beginPath();
      ctx.moveTo(curve[i - 1].x, curve[i - 1].y);
      ctx.lineTo(curve[i].x, curve[i].y);
      ctx.stroke();
    }

    // Hover: luce accesa sul punto selezionato
    if (isHovering && hoverIdx !== null) {
      const hx = pts[hoverIdx].x;
      // Linea verticale
      ctx.strokeStyle = "rgba(168,139,250,0.2)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(hx, PAD.top); ctx.lineTo(hx, H - PAD.bottom); ctx.stroke();

      // Ridisegna con alone luminoso centrato sul punto
      for (let i = 1; i < curve.length; i++) {
        const tAnim = ((curve[i].t + animOffset) % 1);
        const [r, g, b] = paletteColor(tAnim);
        const dist = Math.abs(curve[i].x - hx) / (W * 0.18);
        const bright = Math.max(0, 1 - dist);
        if (bright < 0.02) continue;
        ctx.strokeStyle = `rgba(${r},${g},${b},${bright})`;
        ctx.lineWidth = 1.5 + bright * 2;
        ctx.beginPath();
        ctx.moveTo(curve[i - 1].x, curve[i - 1].y);
        ctx.lineTo(curve[i].x, curve[i].y);
        ctx.stroke();
      }

      // Dot
      const tDot = ((hoverIdx / (n - 1) + animOffset) % 1);
      const [hr, hg, hb] = paletteColor(tDot);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pts[hoverIdx].x, pts[hoverIdx].y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#12101e"; ctx.fill();
      ctx.strokeStyle = `rgb(${hr},${hg},${hb})`; ctx.stroke();
      ctx.beginPath(); ctx.arc(pts[hoverIdx].x, pts[hoverIdx].y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${hr},${hg},${hb})`; ctx.fill();
    }

    // Etichetta soglia — sempre sopra tutto
    if (budY !== null) {
      ctx.fillStyle = "#1a1030";
      ctx.fillRect(W - PAD.right - 58, budY - 15, 56, 14);
      ctx.fillStyle = "rgba(232,121,249,0.9)";
      ctx.font = "9px monospace"; ctx.textAlign = "right";
      ctx.fillText(`soglia ${dailyBudgetBase.toFixed(0)}€`, W - PAD.right - 3, budY - 4);
    }

    // Salva riferimenti per hover
    (canvas as any)._pts = pts;
    (canvas as any)._PAD = PAD;
    (canvas as any)._W = W;
  }, [data, dailyBudgetBase, avgDaily]);

  // Loop animazione
  useEffect(() => {
    if (data.length === 0) return;
    const loop = () => {
      animOffsetRef.current = (animOffsetRef.current + 0.002) % 1;
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

  if (data.length === 0) return null;

  const xLabels = [
    data[0].label,
    data[Math.floor(data.length / 2)].label,
    "oggi",
  ];

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
          <p className="eyebrow mt-0.5 text-[9px]">Ultime 4 settimane · ogni giorno</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="eyebrow text-[9px]">Media giornaliera</p>
            <p className="m-0 mt-0.5 font-mono-tabular text-[14px] font-medium text-ink-primary">
              {avgDaily.toFixed(0)}<span className="text-[11px] text-ink-muted">€</span>
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
          style={{ cursor: "crosshair" }}
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
              top: Math.max(0, hoverInfo.y - 72),
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
      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-5 rounded-full" style={{ background: "linear-gradient(90deg,#A88BFA,#60A5FA,#E879F9)" }} />
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