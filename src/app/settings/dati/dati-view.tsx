"use client";

import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { EconomicsSection } from "../sections/economics-section";
import { TimeMetricSection } from "../sections/time-metric-section";
import { FixedCostsSection } from "../sections/fixed-costs-section";
import { CustomCategoriesSection } from "../sections/custom-categories-section";
import type { UserProfile, FixedCost } from "@/lib/finance";
import type { CustomCategory } from "../categories-actions";

export function DatiView({
  profile,
  fixedCosts,
  customCategories,
}: {
  profile: UserProfile;
  fixedCosts: FixedCost[];
  customCategories: CustomCategory[];
}) {
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
              Dati finanziari
            </h1>
          </header>

          <div className="flex flex-col gap-5">
            <EconomicsSection profile={profile} />
            <TimeMetricSection profile={profile} />
            <FixedCostsSection fixedCosts={fixedCosts} />
            <CustomCategoriesSection
              plan={profile.plan ?? "free"}
              initialCategories={customCategories}
            />
          </div>
        </div>
      </div>

      <BottomBar activeRoute="settings" />
    </div>
  );
}
