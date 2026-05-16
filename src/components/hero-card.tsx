"use client";

import { useRef } from "react";
import { Clock } from "lucide-react";
import type { DashboardStats } from "@/lib/finance";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { SafeModeSwitcher } from "./safe-mode-switcher";
import { splitCurrency } from "@/lib/utils";
import { useAnimatedCurrency } from "./animated-number";
import { HelpTooltip } from "./help-tooltip";

export function HeroCard({ stats }: { stats: DashboardStats }) {
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

  const { safeToSpendToday, savingsPercent, monthLabel, timeMetric } = stats;
  const { int: eurosInt, dec: eurosDec } = useAnimatedCurrency(safeToSpendToday);
  const timeLabel = amountToTimeLabel(safeToSpendToday, stats);
  const timeSuffix = getTimeMetricSuffix(timeMetric);

  const ringCircumference = 2 * Math.PI * 76;
  const ringOffset = ringCircumference * (1 - savingsPercent / 100);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glass-panel-strong group relative overflow-hidden rounded-[20px] p-5 md:p-9 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_32px_64px_-20px_rgba(168,139,250,0.3)] animate-slide-up [animation-delay:0.1s]"
      style={{
        animationFillMode: "both",
        backgroundImage: `
          radial-gradient(
            circle at var(--mx, 30%) var(--my, 20%),
            rgba(168, 139, 250, 0.15) 0%,
            transparent 50%
          )
        `,
      }}
    >
      <HelpTooltip
        title="Safe-to-Spend"
        content="È quanto puoi spendere oggi in modo sereno. Calcolato sottraendo dal reddito i costi fissi, il risparmio obiettivo e le spese già fatte questo mese."
        example="Es: 1.800€ - 850€ fissi - 200€ risparmio = 750€ ÷ 30 giorni = 25€/giorno"
      />
      <AuraLayers />
      <Stars />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-5 md:gap-7">
        <div>
          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-[7px] rounded-full border border-iri-violet/20 bg-iri-violet/[0.08] px-3 py-[5px]">
              <span className="h-[6px] w-[6px] rounded-full bg-iri-violet animate-pulse-dot" />
              <span className="eyebrow-accent text-[10px]">
                Potere d&apos;acquisto · oggi
              </span>
            </div>
            <SafeModeSwitcher current={stats.safeMode} />
          </div>
          <div className="flex items-baseline gap-[2px] font-mono-tabular">
            <span className="mt-3.5 self-start text-[22px] font-light text-ink-secondary">
              €
            </span>
            <span className="hero-number-grad text-[96px] font-normal leading-[0.9] [letter-spacing:-0.055em]">
              {eurosInt}
            </span>
            <span className="ml-0.5 mt-[18px] self-start text-[32px] font-normal text-ink-primary/75 [letter-spacing:-0.02em]">
              ,{eurosDec}
            </span>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-iri-violet/20 bg-iri-violet/[0.06] px-3.5 py-[7px] transition-all duration-[350ms] hover:scale-[1.03] hover:border-iri-violet/40 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]">
            <Clock className="h-3 w-3 text-iri-violet" />
            <span className="iri-text font-mono-tabular text-xs">
              ≡ {timeLabel} {timeSuffix}
            </span>
          </div>

          <p className="mt-6 max-w-[340px] text-[13px] leading-[1.65] text-ink-secondary">
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

        <div className="relative mx-auto h-[140px] w-[140px] md:h-[200px] md:w-[200px] flex-shrink-0">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A88BFA" />
                <stop offset="50%" stopColor="#E879F9" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <filter id="ringGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="2.5"
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