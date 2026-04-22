"use client";

import { Check, AlertCircle } from "lucide-react";

/**
 * Componenti riusabili tra le 4 sezioni Settings.
 * Centralizzati qui per evitare duplicazione.
 */

export function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-[18px] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-gradient-to-br from-iri-violet/[0.15] to-iri-magenta/[0.08] text-iri-pale">
          {icon}
        </div>
        <div>
          <h2 className="m-0 text-[15px] font-medium text-ink-primary">{title}</h2>
          <p className="eyebrow mt-0.5 text-[9px]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SaveButton({
  onClick,
  disabled,
  pending,
}: {
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_-4px_rgba(168,139,250,0.45)] transition-all duration-[300ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_rgba(168,139,250,0.6)] disabled:opacity-40 disabled:hover:translate-y-0"
    >
      {pending ? "Salvataggio…" : "Salva"}
    </button>
  );
}

export function FeedbackLine({
  status,
  message,
}: {
  status: "idle" | "saved" | "error";
  message: string | null;
}) {
  if (status === "idle" || !message) return <span />;

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
        <Check className="h-3 w-3" strokeWidth={2.5} />
        {message}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-red-300">
      <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
      {message}
    </span>
  );
}

export function CurrencyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        step="0.01"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-9 font-mono-tabular text-[14px] text-ink-primary focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
        €
      </span>
    </div>
  );
}