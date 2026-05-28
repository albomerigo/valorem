"use client";

import { useRef, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { DashboardStats } from "@/lib/finance";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { SafeModeSwitcher } from "./safe-mode-switcher";
import { splitCurrency } from "@/lib/utils";
import { useAnimatedCurrency } from "./animated-number";
import { HelpTooltip } from "./help-tooltip";

export function HeroCard({
  stats,
  valoremScore,
}: {
  stats: DashboardStats;
  valoremScore?: { score: number; label: string; color: string };
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
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

  const { safeToSpendToday, savingsPercent, monthLabel, timeMetric, monthlyFree } = stats;
  const { int: eurosInt, dec: eurosDec } = useAnimatedCurrency(safeToSpendToday);

  // Colore dinamico Safe-to-Spend
  function getSafeToSpendColor(safeToSpend: number, mFree: number) {
    if (safeToSpend <= 0)
      return { color: "#F87171", glow: "rgba(248,113,113,0.3)" };
    const daily = mFree > 0 ? mFree / 30 : 0;
    const ratio = daily > 0 ? safeToSpend / daily : 1;
    if (ratio < 0.3)
      return { color: "#F59E0B", glow: "rgba(245,158,11,0.3)" };
    return { color: "#A88BFA", glow: "rgba(168,139,250,0.3)" };
  }
  const safeColor = getSafeToSpendColor(safeToSpendToday, monthlyFree);

  // Flash rosso quando il valore scende
  const [flashDown, setFlashDown] = useState(false);
  const prevSafe = useRef(safeToSpendToday);
  useEffect(() => {
    if (safeToSpendToday < prevSafe.current && prevSafe.current > 0) {
      setFlashDown(true);
      const t = setTimeout(() => setFlashDown(false), 500);
      prevSafe.current = safeToSpendToday;
      return () => clearTimeout(t);
    }
    prevSafe.current = safeToSpendToday;
  }, [safeToSpendToday]);
  const timeLabel = amountToTimeLabel(safeToSpendToday, stats);
  const timeSuffix = getTimeMetricSuffix(timeMetric);

  const ringCircumference = 2 * Math.PI * 76;
  const ringOffset = ringCircumference * (1 - savingsPercent / 100);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glass-panel-strong group relative overflow-hidden rounded-[20px] p-5 md:p-9 transition-all duration-500 hover:-translate-y-0.5 animate-slide-up [animation-delay:0.1s]"
      style={{
        animationFillMode: "both",
        boxShadow: `0 32px 64px -20px ${safeColor.glow}`,
        backgroundImage: `
          radial-gradient(
            circle at var(--mx, 30%) var(--my, 20%),
            rgba(168, 139, 250, 0.15) 0%,
            transparent 50%
          )
        `,
      }}
    >
      {/* LED line — top border shimmer */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] animate-shimmer"
        style={{
          background: "linear-gradient(90deg, transparent, #A88BFA, #E879F9, #60A5FA, transparent)",
          backgroundSize: "200% 100%",
        }}
      />
      <HelpTooltip
        title="Safe-to-Spend"
        content="È quanto puoi spendere oggi in modo sereno. Calcolato sottraendo dal reddito i costi fissi, il risparmio obiettivo e le spese già fatte questo mese."
        example="Es: 1.800€ - 850€ fissi - 200€ risparmio = 750€ ÷ 30 giorni = 25€/giorno"
      />
      <AuraLayers />
      <Stars />

      {/* Valorem Score pill */}
      {valoremScore && (
        <div
          className="absolute bottom-4 right-4 z-20 hidden md:flex flex-col items-center rounded-[14px] px-[14px] py-2 transition-all duration-300 hover:scale-105 cursor-default"
          style={{
            background: `rgba(${hexToRgb(valoremScore.color)}, 0.1)`,
            border: `1px solid rgba(${hexToRgb(valoremScore.color)}, 0.3)`,
          }}
          title="Il tuo Valorem Score — misura la tua salute finanziaria mensile"
        >
          <span
            className="font-serif text-[28px] font-normal leading-none [letter-spacing:-0.04em]"
            style={{ color: valoremScore.color }}
          >
            {valoremScore.score}
          </span>
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-ink-secondary">
            {valoremScore.label}
          </span>
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-5 md:gap-7">
        <div>
          <div className="mb-4 md:mb-6 flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-[7px] rounded-full border border-iri-violet/20 bg-iri-violet/[0.08] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-iri-violet animate-pulse-dot" />
              <span className="eyebrow-accent text-[11px]">
                Potere d&apos;acquisto · oggi
              </span>
            </div>
            <SafeModeSwitcher current={stats.safeMode} />
          </div>
          <div
            className="flex items-baseline gap-[2px] rounded-[12px] transition-all duration-[500ms]"
            style={flashDown ? { background: "rgba(248,113,113,0.12)" } : undefined}
          >
            <span className="mt-2.5 self-start text-[18px] md:mt-3.5 md:text-[22px] font-light text-ink-secondary">
              €
            </span>
            <span
              className="font-serif text-[80px] md:text-[112px] font-normal leading-[0.9] [letter-spacing:-0.07em] transition-all duration-[500ms]"
              style={{
                color: safeColor.color,
                filter: flashDown
                  ? "drop-shadow(0 0 12px rgba(248,113,113,0.5))"
                  : `drop-shadow(0 0 20px ${safeColor.glow})`,
              }}
            >
              {eurosInt}
            </span>
            <span className="ml-0.5 mt-[14px] self-start text-[24px] md:mt-[18px] md:text-[32px] font-normal text-ink-primary/75 [letter-spacing:-0.02em]">
              ,{eurosDec}
            </span>
          </div>

          <div className="mt-4 md:mt-5 inline-flex items-center gap-2 rounded-full border border-iri-violet/20 bg-iri-violet/[0.06] px-3.5 py-[7px] transition-all duration-[350ms] hover:scale-[1.03] hover:border-iri-violet/40 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]">
            <Clock className="h-3 w-3 text-iri-violet" />
            <span className="iri-text font-mono-tabular text-xs">
              ≡ {timeLabel} {timeSuffix}
            </span>
          </div>

          <p className="mt-5 md:mt-6 max-w-[340px] font-serif text-[15px] italic leading-[1.65] text-ink-primary">
            {safeToSpendToday > 0 ? (
              <>
                Stai rispettando la tua{" "}
                <span className="text-iri-pale">soglia di serenità</span>.
              </>
            ) : (
              <>Completa la configurazione del tuo profilo per iniziare.</>
            )}
          </p>
        </div>

        <div className="relative mx-auto h-[120px] w-[120px] md:h-[200px] md:w-[200px] flex-shrink-0">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A88BFA" />
                <stop offset="50%" stopColor="#E879F9" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <filter id="ringGlow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Track circle */}
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="rgba(168,139,250,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={(2 * Math.PI * 84) * (1 - savingsPercent / 100)}
              transform="rotate(-90 100 100)"
              filter="url(#ringGlow)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="eyebrow text-[9px]">{monthLabel}</span>
            <span className="iri-text font-mono-tabular text-[28px] md:text-[36px] font-normal leading-none [letter-spacing:-0.03em]">
              {savingsPercent}%
            </span>
            <span className="font-mono-tabular text-[10px] text-ink-secondary">
              risparmio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function AuraLayers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute left-[20%] top-[30%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.4) 25%, rgba(232,121,249,0.3) 50%, rgba(96,165,250,0.35) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute right-[15%] top-1/2 h-[220px] w-[220px] -translate-y-1/2 rounded-full animate-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(232,121,249,0.3) 0%, rgba(168,139,250,0.15) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

function Stars() {
  const positions = [
    { left: "8%", top: "18%", delay: "0.2s" },
    { left: "92%", top: "28%", delay: "1.1s" },
    { left: "18%", top: "78%", delay: "0.6s" },
    { left: "74%", top: "82%", delay: "1.8s" },
    { left: "48%", top: "12%", delay: "2.4s" },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-white/50 animate-twinkle"
          style={{ left: p.left, top: p.top, animationDelay: p.delay }}
        />
      ))}
    </>
  );
}