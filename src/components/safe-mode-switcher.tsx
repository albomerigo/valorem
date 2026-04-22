"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldCheck, PiggyBank, Check } from "lucide-react";
import type { SafeMode } from "@/lib/finance";
import { updateSafeMode } from "@/app/settings/actions";

type Mode = {
  id: SafeMode;
  label: string;
  short: string;
  icon: React.ReactNode;
  description: string;
  color: string;
};

const MODES: Mode[] = [
  {
    id: "aggressive",
    label: "Aggressiva",
    short: "100%",
    icon: <Shield className="h-3 w-3" strokeWidth={2} />,
    description: "Il budget completo è disponibile ogni giorno",
    color: "text-iri-pale",
  },
  {
    id: "cautious",
    label: "Cautelativa",
    short: "90%",
    icon: <ShieldCheck className="h-3 w-3" strokeWidth={2} />,
    description: "Cuscinetto del 10% per imprevisti",
    color: "text-cyan-300",
  },
  {
    id: "saving",
    label: "Salvataggio",
    short: "80%",
    icon: <PiggyBank className="h-3 w-3" strokeWidth={2} />,
    description: "Il 20% extra accelera i tuoi obiettivi",
    color: "text-emerald-300",
  },
];

export function SafeModeSwitcher({ current }: { current: SafeMode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const active = MODES.find((m) => m.id === current) || MODES[0];

  function handleSelect(mode: SafeMode) {
    startTransition(async () => {
      await updateSafeMode(mode);
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`glass-panel-subtle flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300 hover:border-iri-violet/30 ${active.color}`}
      >
        {active.icon}
        <span className="uppercase tracking-[0.08em]">Modalità</span>
        <span className="font-mono-tabular">{active.short}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 md:top-full top-auto bottom-[96px] md:bottom-auto md:mt-2 z-50 md:w-[280px] overflow-hidden rounded-[14px] p-2"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid rgba(168, 139, 250, 0.5)",
              boxShadow:
                "0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(168, 139, 250, 0.3)",
            }}
          >
            <p className="eyebrow px-3 py-2 text-[9px]">
              Scegli il tuo approccio
            </p>
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelect(mode.id)}
                disabled={isPending}
                className={`flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                  mode.id === current
                    ? "bg-iri-violet/[0.1]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className={`mt-0.5 ${mode.color}`}>{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-ink-primary">
                      {mode.label}
                    </span>
                    <span className={`font-mono-tabular text-[11px] ${mode.color}`}>
                      {mode.short}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-[1.4] text-ink-secondary">
                    {mode.description}
                  </p>
                </div>
                {mode.id === current && (
                  <Check className="h-3 w-3 flex-shrink-0 text-iri-violet mt-1" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}