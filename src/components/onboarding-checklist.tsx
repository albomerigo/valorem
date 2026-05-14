"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, X, Check, Circle } from "lucide-react";
import { NewTransactionModal } from "./new-transaction-modal";

const DISMISSED_KEY = "valorem_checklist_dismissed";

interface OnboardingChecklistProps {
  transactions: number;
  goals: number;
  onAddTransaction: () => void;
  profileCreatedAt?: string | null;
}

export function OnboardingChecklist({
  transactions,
  goals,
  onAddTransaction,
  profileCreatedAt,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden, reveal after mount
  const [visible, setVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasTransaction = transactions > 0;
  const hasGoal = goals > 0;
  const allDone = hasTransaction && hasGoal;

  // Determine if checklist should appear
  const isNewUser = (() => {
    if (transactions < 3) return true;
    if (profileCreatedAt) {
      const created = new Date(profileCreatedAt).getTime();
      const now = Date.now();
      return now - created < 168 * 60 * 60 * 1000;
    }
    return false;
  })();

  useEffect(() => {
    const isDismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY) === "true";
    setDismissed(isDismissed);
    setVisible(!isDismissed && isNewUser);
  }, [isNewUser]);

  // Auto-dismiss when all done
  useEffect(() => {
    if (allDone && visible) {
      const t = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(DISMISSED_KEY, "true");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [allDone, visible]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleAddTransaction = () => {
    setIsModalOpen(true);
    onAddTransaction();
  };

  if (!visible || dismissed) return null;

  return (
    <>
      <div className="glass-panel rounded-[16px] p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
              <Target className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="eyebrow-accent text-[10px]">Inizia qui</p>
              <p className="m-0 text-[13px] font-medium text-ink-primary">
                Primi passi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-ink-faint transition-all hover:border-white/[0.08] hover:text-ink-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {allDone ? (
          <div className="rounded-[12px] border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3 text-center">
            <p className="text-[13px] font-medium text-emerald-300">
              Ottimo lavoro! Sei pronto.
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-300/60">
              La checklist si chiuderà automaticamente…
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <CheckItem
              done={true}
              label="Account creato"
            />
            <CheckItem
              done={hasTransaction}
              label="Prima transazione aggiunta"
              action={
                !hasTransaction ? (
                  <button
                    type="button"
                    onClick={handleAddTransaction}
                    className="text-[11px] font-medium text-iri-pale underline underline-offset-2 hover:text-ink-primary"
                  >
                    Aggiungi ora →
                  </button>
                ) : undefined
              }
            />
            <CheckItem
              done={hasGoal}
              label="Primo obiettivo impostato"
              action={
                !hasGoal ? (
                  <Link
                    href="/obiettivi"
                    className="text-[11px] font-medium text-iri-pale underline underline-offset-2 hover:text-ink-primary"
                  >
                    Vai agli obiettivi →
                  </Link>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

function CheckItem({
  done,
  label,
  action,
}: {
  done: boolean;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
            done
              ? "bg-emerald-500/[0.15] text-emerald-400"
              : "border border-white/[0.12] text-ink-muted"
          }`}
        >
          {done ? (
            <Check className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <Circle className="h-3 w-3" strokeWidth={1.5} />
          )}
        </div>
        <span
          className={`text-[13px] ${done ? "text-ink-secondary line-through" : "text-ink-primary"}`}
        >
          {label}
        </span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
