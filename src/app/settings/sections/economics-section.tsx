"use client";

import { useState, useTransition } from "react";
import { Coins } from "lucide-react";
import type { UserProfile } from "@/lib/finance";
import { updateEconomics } from "../actions";
import { SectionCard, SaveButton, FeedbackLine, CurrencyInput } from "./section-primitives";

export function EconomicsSection({ profile }: { profile: UserProfile }) {
  const [monthlyIncome, setMonthlyIncome] = useState(Number(profile.monthly_income));
  const [savingsGoal, setSavingsGoal] = useState(Number(profile.savings_goal));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    monthlyIncome !== Number(profile.monthly_income) ||
    savingsGoal !== Number(profile.savings_goal);

  function handleSave() {
    startTransition(async () => {
      const result = await updateEconomics({ monthlyIncome, savingsGoal });
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }
      setStatus("saved");
      setMessage("Economia aggiornata");
      setTimeout(() => setStatus("idle"), 2500);
    });
  }

  const savingsPercent =
    monthlyIncome > 0 ? Math.round((savingsGoal / monthlyIncome) * 100) : 0;

  return (
    <SectionCard
      icon={<Coins className="h-4 w-4" strokeWidth={1.8} />}
      title="Economia"
      subtitle="Entrate e obiettivo di risparmio"
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="eyebrow mb-2">Reddito mensile</p>
          <CurrencyInput value={monthlyIncome} onChange={setMonthlyIncome} />
        </div>

        <div>
          <p className="eyebrow mb-2">Obiettivo di risparmio</p>
          <CurrencyInput value={savingsGoal} onChange={setSavingsGoal} />
          {monthlyIncome > 0 && savingsGoal > 0 && (
            <p className="mt-2 text-[11px] text-ink-secondary">
              È il{" "}
              <span className="iri-text font-medium">{savingsPercent}%</span>{" "}
              del tuo reddito
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <FeedbackLine status={status} message={message} />
          <SaveButton
            onClick={handleSave}
            disabled={!dirty || isPending}
            pending={isPending}
          />
        </div>
      </div>
    </SectionCard>
  );
}