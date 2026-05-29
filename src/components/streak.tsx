"use client";

import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/finance";

/* ──────────────────────────────────────────────
   STREAK CALCULATION
────────────────────────────────────────────── */
function calculateStreak(transactions: Transaction[]): {
  count: number;
  status: "active" | "at_risk" | "none";
} {
  if (!transactions.length) return { count: 0, status: "none" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Unique days with at least one transaction
  const txDays = new Set(transactions.map((t) => t.transaction_date.slice(0, 10)));

  // Check today
  const hasToday = txDays.has(todayStr);
  const hasYesterday = txDays.has(yesterdayStr);

  // Count consecutive days ending at yesterday (or today if present)
  let streak = 0;
  const startFrom = hasToday ? today : yesterday;

  for (let i = 0; i < 365; i++) {
    const d = new Date(startFrom);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    if (txDays.has(dStr)) {
      streak++;
    } else {
      break;
    }
  }

  // If today has no tx but yesterday had, it's "at risk"
  if (!hasToday && hasYesterday && streak > 0) {
    return { count: streak, status: "at_risk" };
  }

  // If last tx is 2+ days ago, streak is broken
  if (!hasToday && !hasYesterday) {
    return { count: 0, status: "none" };
  }

  return { count: streak, status: "active" };
}

const MILESTONES = [7, 14, 30];

/* ──────────────────────────────────────────────
   STREAK BADGE
────────────────────────────────────────────── */
export function StreakBadge({ transactions }: { transactions: Transaction[] }) {
  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { count, status } = calculateStreak(transactions);

  // Milestone toast
  useEffect(() => {
    if (!mounted || count === 0 || status === "none") return;
    const key = `valorem_streak_milestone_${count}`;
    if (MILESTONES.includes(count) && !localStorage.getItem(key)) {
      localStorage.setItem(key, "true");
      setToastMsg(`🔥 ${count} giorni consecutivi! Sei in fuoco.`);
      const t = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [count, status, mounted]);

  if (!mounted || status === "none" || count === 0) return null;

  // Color scheme
  let bg: string;
  let border: string;
  let textColor: string;
  let icon: string;

  if (status === "at_risk") {
    bg = "rgba(245,158,11,0.08)";
    border = "rgba(245,158,11,0.25)";
    textColor = "#FCD34D";
    icon = "⚠️";
  } else if (count >= 7) {
    bg = "rgba(16,185,129,0.08)";
    border = "rgba(16,185,129,0.25)";
    textColor = "#6EE7B7";
    icon = "🔥";
  } else if (count >= 3) {
    bg = "rgba(168,139,250,0.08)";
    border = "rgba(168,139,250,0.25)";
    textColor = "#C4B5FD";
    icon = "🔥";
  } else {
    bg = "rgba(255,255,255,0.04)";
    border = "rgba(255,255,255,0.08)";
    textColor = "rgba(255,255,255,0.5)";
    icon = "🔥";
  }

  return (
    <>
      <div className="flex justify-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: bg, border: `1px solid ${border}` }}
          title={
            status === "at_risk"
              ? "Aggiungi una transazione oggi per mantenere lo streak!"
              : `${count} giorni consecutivi con transazioni`
          }
        >
          <span className="text-[14px]">{icon}</span>
          <span
            className="font-mono-tabular text-[12px] font-semibold"
            style={{ color: textColor }}
          >
            {count}
          </span>
          <span className="text-[11px]" style={{ color: textColor, opacity: 0.8 }}>
            {status === "at_risk"
              ? "giorni · a rischio"
              : `giorn${count === 1 ? "o" : "i"} consecutiv${count === 1 ? "o" : "i"}`}
          </span>
        </div>
      </div>

      {/* Milestone toast */}
      {toastMsg && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-[14px] px-5 py-3 text-[13px] font-medium text-white animate-slide-up"
          style={{
            background: "linear-gradient(135deg, #A88BFA, #E879F9)",
            boxShadow: "0 8px 32px -8px rgba(168,139,250,0.7)",
            animationFillMode: "both",
          }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
