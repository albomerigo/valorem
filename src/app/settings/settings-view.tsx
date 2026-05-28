"use client";

import Link from "next/link";
import { CreditCard, ArrowUpRight, Zap, Volume2, Vibrate } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserProfile, FixedCost } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { ProfileSection } from "./sections/profile-section";
import { EconomicsSection } from "./sections/economics-section";
import { TimeMetricSection } from "./sections/time-metric-section";
import { FixedCostsSection } from "./sections/fixed-costs-section";
import { CustomCategoriesSection } from "./sections/custom-categories-section";
import type { CustomCategory } from "./categories-actions";

/**
 * Pagina "Setup Vitale" — la sala comandi di Valorem.
 * L'utente modifica tutti i parametri fondamentali qui.
 */
export function SettingsView({
  profile,
  fixedCosts,
  customCategories = [],
}: {
  profile: UserProfile;
  fixedCosts: FixedCost[];
  customCategories?: CustomCategory[];
}) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Setup vitale" showBack />

          <div className="mt-8">
            <header className="mb-8">
              <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
                La tua sala comandi
              </h1>
              <p className="mt-2 max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
                Ogni parametro qui dentro alimenta il motore di Valorem.
                Modifica con cura — i tuoi calcoli ne dipendono.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ProfileSection profile={profile} />
              <EconomicsSection profile={profile} />
              <TimeMetricSection profile={profile} />
              <FixedCostsSection fixedCosts={fixedCosts} />
              <CustomCategoriesSection
                plan={profile.plan ?? "free"}
                initialCategories={customCategories}
              />
              <EsperienzaSection />
            </div>

            <PlanSection profile={profile} />

            {/* Footer links */}
            <p className="mt-6 text-center text-[10px] text-ink-muted">
              <Link href="/guida" className="hover:text-ink-secondary transition-colors">
                Guida
              </Link>
              {" · "}
              <Link href="/ricorrenti" className="hover:text-ink-secondary transition-colors">
                Spese ricorrenti
              </Link>
              {" · "}
              <Link href="/privacy" className="hover:text-ink-secondary transition-colors">
                Privacy Policy
              </Link>
              {" · "}
              <Link href="/termini" className="hover:text-ink-secondary transition-colors">
                Termini di Servizio
              </Link>
            </p>
          </div>
       </div>
      </div>

      <FabButton />
      <BottomBar activeRoute="settings" />
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  storageKey,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  storageKey: string;
}) {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setEnabled(stored !== "false");
    setMounted(true);
  }, [storageKey]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, String(next));
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-iri-violet/20 bg-iri-violet/[0.06] text-iri-pale">
          {icon}
        </div>
        <div>
          <p className="m-0 text-[13px] font-medium text-ink-primary">{label}</p>
          <p className="m-0 text-[11px] text-ink-muted">{description}</p>
        </div>
      </div>
      {mounted && (
        <button
          type="button"
          onClick={toggle}
          title={enabled ? "Disabilita" : "Abilita"}
          className="relative flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300"
          style={{
            background: enabled
              ? "linear-gradient(135deg, #A88BFA, #E879F9)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300"
            style={{ left: enabled ? "calc(100% - 22px)" : "2px" }}
          />
        </button>
      )}
    </div>
  );
}

function EsperienzaSection() {
  return (
    <div className="glass-panel rounded-[20px] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Zap className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Esperienza</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Feedback sensoriale e micro-interazioni
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04]">
        <ToggleRow
          icon={<Volume2 className="h-4 w-4" strokeWidth={1.6} />}
          label="Suoni dell'app"
          description="Micro-suoni al salvataggio e alle azioni"
          storageKey="valorem_sounds_enabled"
        />
        <ToggleRow
          icon={<Vibrate className="h-4 w-4" strokeWidth={1.6} />}
          label="Feedback aptico"
          description="Vibrazione leggera su azioni importanti (mobile)"
          storageKey="valorem_haptics_enabled"
        />
      </div>
    </div>
  );
}

function PlanSection({ profile }: { profile: UserProfile }) {
  const plan = profile.plan || "free";
  const planLabel =
    plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Free";
  const planColor =
    plan === "pro"
      ? "text-emerald-300 border-emerald-400/25 bg-emerald-500/[0.06]"
      : plan === "premium"
      ? "text-iri-pale border-iri-violet/30 bg-iri-violet/[0.08]"
      : "text-ink-secondary border-white/[0.08] bg-white/[0.03]";

  return (
    <div className="mt-5 glass-panel rounded-[20px] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <CreditCard className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Piano attuale</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Gestisci il tuo abbonamento Valorem
          </p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium ${planColor}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        Piano {planLabel}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
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
  );
}

