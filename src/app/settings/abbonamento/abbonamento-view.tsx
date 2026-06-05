"use client";

import Link from "next/link";
import { CreditCard, Zap, Check, ArrowUpRight } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/finance";

const PLAN_BENEFITS: Record<string, string[]> = {
  free: [
    "Fino a 12 transazioni al mese",
    "Dashboard Safe-to-Spend",
    "Obiettivi di risparmio (1)",
    "Cimitero degli impulsi",
  ],
  premium: [
    "Transazioni illimitate",
    "Storico completo + Recap mensile",
    "Export CSV",
    "Spese ricorrenti",
    "Categorie personalizzate",
  ],
  pro: [
    "Tutto di Premium",
    "AI Coach illimitato (Claude AI)",
    "Analisi avanzate",
    "Supporto prioritario",
  ],
};

export function AbbonamentoView({ profile }: { profile: UserProfile }) {
  const plan = profile.plan || "free";
  const planLabel = plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Free";
  const planColor =
    plan === "pro"
      ? { text: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" }
      : plan === "premium"
      ? { text: "#C4B5FD", bg: "rgba(168,139,250,0.08)", border: "rgba(168,139,250,0.25)" }
      : { text: "#9CA3AF", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" };

  const benefits = PLAN_BENEFITS[plan] || PLAN_BENEFITS.free;

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[680px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Impostazioni" showBack />

          <header className="mt-8 mb-8">
            <p className="eyebrow-accent mb-2 text-[10px]">Impostazioni</p>
            <h1 className="m-0 font-serif text-[28px] font-normal italic leading-tight text-ink-primary">
              Abbonamento
            </h1>
          </header>

          {/* Piano attuale */}
          <div className="glass-panel mb-5 rounded-[18px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
                <CreditCard className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="eyebrow-accent text-[10px]">Piano attuale</p>
                <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">Il tuo abbonamento Valorem</p>
              </div>
            </div>

            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium"
              style={{ background: planColor.bg, border: `1px solid ${planColor.border}`, color: planColor.text }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              Piano {planLabel}
            </div>

            <div className="flex flex-col gap-2 mb-5">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-iri-pale" strokeWidth={2.5} />
                  <span className="text-[13px] text-ink-secondary">{b}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {plan === "free" ? (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade a Premium
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-ink-secondary transition-all hover:border-white/[0.16] hover:text-ink-primary"
                >
                  Gestisci piano
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Upgrade se free */}
          {plan === "free" && (
            <div
              className="rounded-[18px] p-6"
              style={{
                background: "linear-gradient(135deg, rgba(168,139,250,0.08) 0%, rgba(232,121,249,0.05) 100%)",
                border: "1px solid rgba(168,139,250,0.2)",
              }}
            >
              <p className="eyebrow-accent mb-2 text-[10px]">Perché fare upgrade?</p>
              <p className="font-serif text-[18px] italic leading-[1.5] text-ink-primary mb-4">
                Sblocca il pieno potere di Valorem.
              </p>
              {PLAN_BENEFITS.premium.map((b) => (
                <div key={b} className="mb-2 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-iri-pale" strokeWidth={2.5} />
                  <span className="text-[13px] text-ink-secondary">{b}</span>
                </div>
              ))}
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-iri-violet to-iri-magenta px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Vedi i piani
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomBar activeRoute="settings" />
    </div>
  );
}
