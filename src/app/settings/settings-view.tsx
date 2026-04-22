"use client";

import type { UserProfile, FixedCost } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { ProfileSection } from "./sections/profile-section";
import { EconomicsSection } from "./sections/economics-section";
import { TimeMetricSection } from "./sections/time-metric-section";
import { FixedCostsSection } from "./sections/fixed-costs-section";

/**
 * Pagina "Setup Vitale" — la sala comandi di Valorem.
 * L'utente modifica tutti i parametri fondamentali qui.
 */
export function SettingsView({
  profile,
  fixedCosts,
}: {
  profile: UserProfile;
  fixedCosts: FixedCost[];
}) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Setup vitale" />

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
            </div>
          </div>
       </div>
      </div>

      <FabButton />
      <BottomBar activeRoute="settings" />
    </div>
  );
}