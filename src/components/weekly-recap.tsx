"use client";

import { useState, useEffect } from "react";
import { BarChart2, X } from "lucide-react";
import type { Transaction } from "@/lib/finance";

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

export function WeeklyRecap({ transactions }: { transactions: Transaction[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  const now = new Date();
  // daysSinceMonday: Mon=0, Tue=1, Wed=2, ..., Sun=6
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const shouldShow = daysSinceMonday <= 2; // Mon, Tue, Wed only

  // This week's Monday (start of day)
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysSinceMonday);
  thisMonday.setHours(0, 0, 0, 0);

  // Previous week bounds
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const lastSunday = new Date(thisMonday);
  lastSunday.setDate(thisMonday.getDate() - 1);
  lastSunday.setHours(23, 59, 59, 999);

  const year = lastMonday.getFullYear();
  const week = getISOWeek(lastMonday);
  const storageKey = `valorem_weekly_recap_${year}-${String(week).padStart(2, "0")}`;

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "true");
    setMounted(true);
  }, [storageKey]);

  if (!mounted || dismissed || !shouldShow) return null;

  // Filter expense transactions from last week
  const lastWeekTx = transactions.filter((t) => {
    const d = new Date(t.transaction_date + "T00:00:00");
    return d >= lastMonday && d <= lastSunday && t.type === "expense";
  });

  if (lastWeekTx.length === 0) return null;

  const totalSpent = lastWeekTx.reduce((s, t) => s + Number(t.amount), 0);

  // Most expensive day
  const byDay: Record<string, number> = {};
  for (const t of lastWeekTx) {
    byDay[t.transaction_date] = (byDay[t.transaction_date] || 0) + Number(t.amount);
  }
  const topDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  const topDayLabel = topDayEntry
    ? new Date(topDayEntry[0] + "T00:00:00").toLocaleDateString("it-IT", {
        weekday: "long",
      })
    : "—";

  // Top category
  const byCat: Record<string, number> = {};
  for (const t of lastWeekTx) {
    const c = t.category || "Altro";
    byCat[c] = (byCat[c] || 0) + Number(t.amount);
  }
  const topCat =
    Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const weekLabel = `${lastMonday.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  })} – ${lastSunday.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  })}`;

  function handleDismiss() {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[16px] border border-iri-violet/15 px-5 py-4"
      style={{ background: "rgba(168,139,250,0.04)" }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        title="Chiudi"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <BarChart2 className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            La tua settimana · {weekLabel}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                Speso
              </p>
              <p className="mt-0.5 font-mono-tabular text-[16px] font-medium text-ink-primary">
                {totalSpent.toFixed(0)}€
              </p>
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                Giorno top
              </p>
              <p className="mt-0.5 text-[13px] font-medium capitalize text-ink-primary">
                {topDayLabel}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                Categoria
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-ink-primary">
                {topCat}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
