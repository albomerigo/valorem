"use client";

import { useState, useTransition } from "react";
import { Clock, CalendarDays, Calendar, Percent } from "lucide-react";
import type { UserProfile, TimeMetric } from "@/lib/finance";
import { updateTimeMetric } from "../actions";
import { SectionCard, SaveButton, FeedbackLine } from "./section-primitives";

export function TimeMetricSection({ profile }: { profile: UserProfile }) {
  const [metric, setMetric] = useState<TimeMetric>(profile.time_metric);
  const [monthlyHours, setMonthlyHours] = useState(
    profile.monthly_hours ? Number(profile.monthly_hours) : 160
  );
  const [workDays, setWorkDays] = useState(
    profile.work_days ? Number(profile.work_days) : 22
  );
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    metric !== profile.time_metric ||
    (metric === "work_hours" && monthlyHours !== Number(profile.monthly_hours || 0)) ||
    (metric === "work_days" && workDays !== Number(profile.work_days || 0));

  function handleSave() {
    startTransition(async () => {
      const result = await updateTimeMetric({
        timeMetric: metric,
        monthlyHours: metric === "work_hours" ? monthlyHours : null,
        workDays: metric === "work_days" ? workDays : null,
      });
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }
      setStatus("saved");
      setMessage("Metrica aggiornata");
      setTimeout(() => setStatus("idle"), 2500);
    });
  }

  return (
    <SectionCard
      icon={<Clock className="h-4 w-4" strokeWidth={1.8} />}
      title="Metrica del tempo"
      subtitle="Come tradurre i tuoi euro in tempo"
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <MetricPill
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Ore lavoro"
            selected={metric === "work_hours"}
            onClick={() => setMetric("work_hours")}
          />
          <MetricPill
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Giornate"
            selected={metric === "work_days"}
            onClick={() => setMetric("work_days")}
          />
          <MetricPill
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Giorni budget"
            selected={metric === "budget_days"}
            onClick={() => setMetric("budget_days")}
          />
          <MetricPill
            icon={<Percent className="h-3.5 w-3.5" />}
            label="% del mese"
            selected={metric === "month_percent"}
            onClick={() => setMetric("month_percent")}
          />
        </div>

        {metric === "work_hours" && (
          <div className="mt-1">
            <p className="eyebrow mb-2">Ore lavorate al mese</p>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={monthlyHours || ""}
                onChange={(e) => setMonthlyHours(Number(e.target.value) || 0)}
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-9 font-mono-tabular text-[14px] text-ink-primary focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
                h
              </span>
            </div>
          </div>
        )}

        {metric === "work_days" && (
          <div className="mt-1">
            <p className="eyebrow mb-2">Giornate lavorative al mese</p>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={workDays || ""}
                onChange={(e) => setWorkDays(Number(e.target.value) || 0)}
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-9 font-mono-tabular text-[14px] text-ink-primary focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
                g
              </span>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
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

function MetricPill({
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
      className={`flex items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[11px] font-medium transition-all duration-[250ms] ${
        selected
          ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.08] text-ink-primary"
          : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25 hover:text-iri-pale"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}