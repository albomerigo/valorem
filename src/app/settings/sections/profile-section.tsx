"use client";

import { useState, useTransition } from "react";
import { User, Briefcase, TrendingUp, Wallet, Check } from "lucide-react";
import type { UserProfile, IncomeType } from "@/lib/finance";
import { updateProfileInfo } from "../actions";
import { SectionCard, SaveButton, FeedbackLine } from "./section-primitives";

export function ProfileSection({ profile }: { profile: UserProfile }) {
  const [name, setName] = useState(profile.name || "");
  const [incomeType, setIncomeType] = useState<IncomeType>(profile.income_type);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    name.trim() !== (profile.name || "") || incomeType !== profile.income_type;

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfileInfo({ name, incomeType });
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }
      setStatus("saved");
      setMessage("Profilo aggiornato");
      setTimeout(() => setStatus("idle"), 2500);
    });
  }

  return (
    <SectionCard
      icon={<User className="h-4 w-4" strokeWidth={1.8} />}
      title="Profilo"
      subtitle="Identità e tipologia di reddito"
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="eyebrow mb-2">Nome</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
          />
        </div>

        <div>
          <p className="eyebrow mb-2.5">Tipo di reddito</p>
          <div className="grid grid-cols-3 gap-2">
            <IncomeTypePill
              icon={<Briefcase className="h-3.5 w-3.5" />}
              label="Stipendio"
              selected={incomeType === "fixed_salary"}
              onClick={() => setIncomeType("fixed_salary")}
            />
            <IncomeTypePill
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Variabile"
              selected={incomeType === "variable"}
              onClick={() => setIncomeType("variable")}
            />
            <IncomeTypePill
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Saltuario"
              selected={incomeType === "irregular"}
              onClick={() => setIncomeType("irregular")}
            />
          </div>
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

function IncomeTypePill({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-[10px] border px-2 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] transition-all duration-[250ms] ${
        selected
          ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.08] text-ink-primary"
          : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25 hover:text-iri-pale"
      }`}
    >
      {icon}
      {label}
      {selected && <Check className="h-2.5 w-2.5 text-iri-violet" strokeWidth={2.5} />}
    </button>
  );
}