"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CreditCard, HelpCircle } from "lucide-react";
import type { DashboardStats } from "@/lib/finance";
import { SimulatorModal } from "./simulator-modal";

export function CoachStripe({
  coachMessage,
  stats,
}: {
  coachMessage: string;
  stats: DashboardStats;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="glass-panel relative overflow-hidden rounded-[18px] p-5 animate-slide-up [animation-delay:0.3s]"
        style={{
          animationFillMode: "both",
          borderColor: "rgba(125, 211, 252, 0.15)",
          backgroundImage:
            "linear-gradient(180deg, rgba(125, 211, 252, 0.04), rgba(168, 139, 250, 0.02))",
        }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-iri-violet">
              <Sparkles className="h-4 w-4 text-[#0A0812]" strokeWidth={2} />
              <div className="absolute -inset-[2px] rounded-full border border-cyan-300/60 animate-rotate-slow" />
            </div>
            <div>
              <p className="m-0 flex items-center gap-1.5 text-[13px] font-medium text-ink-primary">
                Coach <span className="text-cyan-300/80">·</span>
                <span className="text-cyan-300">in ascolto</span>
                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
              </p>
              <p className="eyebrow mt-0.5 text-[9px]">
                Intelligenza che osserva le tue abitudini
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="group relative flex items-center gap-2 overflow-hidden rounded-[12px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-full" />
            <div className="relative flex items-center">
              <CreditCard className="h-3.5 w-3.5" strokeWidth={2} />
              <HelpCircle
                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-iri-magenta text-white"
                strokeWidth={2.5}
              />
            </div>
            <span className="ml-1">Simula acquisto</span>
            <ArrowRight
              className="h-2.5 w-2.5 transition-transform duration-[400ms] group-hover:translate-x-1"
              strokeWidth={2}
            />
          </button>
        </div>

        <p className="m-0 font-serif text-[14px] italic leading-[1.7] text-ink-primary/95">
          &ldquo;{coachMessage}&rdquo;
        </p>
      </div>

      <SimulatorModal open={open} onClose={() => setOpen(false)} stats={stats} />
    </>
  );
}