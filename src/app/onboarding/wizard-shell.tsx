"use client";

export function WizardShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, #1A1530 0%, #0A0812 40%, #060508 100%)",
      }}
    >
      <div className="relative w-full max-w-[560px]">
        <AuraBackdrop />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue font-serif italic text-base font-medium text-[#0A0812] shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] [background-size:200%_200%] animate-gradient-shift">
            v
          </div>
          <ProgressBar step={step} total={totalSteps} />
          <div className="border-gradient relative mt-5 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-surface-3/80 to-surface-2/80 p-8 backdrop-blur-sm">
            <div className="mb-6 text-center">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-iri-pale">
                Passo {step} di {totalSteps}
              </p>
              <h1 className="m-0 font-serif text-[26px] font-normal italic text-ink-primary">
                {title}
              </h1>
              <p className="mt-1.5 text-[13px] text-ink-secondary">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = (step / total) * 100;
  return (
    <div className="flex w-full max-w-[300px] items-center gap-2">
      <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-[3px] rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function AuraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.5) 25%, rgba(232,121,249,0.4) 50%, rgba(96,165,250,0.45) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPONENTI FORM RIUSABILI
// ═══════════════════════════════════════════════════════════

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          min={min}
          step="0.01"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 font-mono-tabular text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono-tabular text-[12px] text-ink-muted">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
      />
    </label>
  );
}

/**
 * Card di scelta singola cliccabile.
 * Usata per income_type e time_metric.
 */
export function ChoiceCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-start gap-3.5 overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${
        selected
          ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.15] to-iri-magenta/[0.08]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-iri-violet/25 hover:bg-iri-violet/[0.06]"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-gradient-to-br from-iri-violet to-iri-magenta text-white"
            : "bg-white/[0.04] text-ink-secondary group-hover:text-iri-pale"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[13px] font-medium text-ink-primary">{title}</p>
        <p className="mt-0.5 text-[11px] leading-[1.5] text-ink-secondary">
          {description}
        </p>
      </div>
      {selected && (
        <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iri-violet to-iri-magenta">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
            <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function NavButtons({
  canProceed,
  isLast,
  pending,
  onBack,
  onNext,
}: {
  canProceed: boolean;
  isLast: boolean;
  pending: boolean;
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-secondary transition-colors hover:border-white/[0.16] hover:text-ink-primary"
        >
          Indietro
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || pending}
        className="relative flex-1 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {pending ? "Salvataggio…" : isLast ? "Completa setup" : "Avanti"}
      </button>
    </div>
  );
}