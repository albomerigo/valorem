"use client";

import { useState, useEffect } from "react";
import { Volume2, Vibrate, Sparkles, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/finance";

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
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-iri-violet/20 bg-iri-violet/[0.06] text-iri-pale">
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

export function PersonalizzazioneView({ profile }: { profile: UserProfile }) {
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
              Personalizzazione
            </h1>
          </header>

          {/* Esperienza sensoriale */}
          <div className="glass-panel mb-5 rounded-[18px] p-6">
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

          {/* Aspetto — futuro */}
          <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.015] p-5">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-4 w-4 text-iri-pale" strokeWidth={1.6} />
              <p className="m-0 text-[13px] font-medium text-ink-primary">Altre opzioni</p>
            </div>
            <p className="text-[12px] text-ink-muted">
              Nuove opzioni di personalizzazione in arrivo nei prossimi aggiornamenti.
            </p>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="settings" />
    </div>
  );
}
