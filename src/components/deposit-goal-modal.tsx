"use client";

import { useState, useTransition } from "react";
import { PiggyBank } from "lucide-react";
import { Modal } from "./modal";
import { updateGoalAmount } from "@/app/actions/goals";
import type { Goal } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";

export function DepositGoalModal({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
}) {
  const [deposit, setDeposit] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!goal) return null;

  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const remaining = Math.max(0, target - current);
  const afterDeposit = current + deposit;
  const newRemaining = Math.max(0, target - afterDeposit);

  const currentSplit = splitCurrency(current);
  const afterSplit = splitCurrency(afterDeposit);
  const remainingSplit = splitCurrency(newRemaining);

  function handleSubmit() {
    setError(null);
    if (deposit <= 0) {
      setError("Inserisci un importo maggiore di zero");
      return;
    }
    startTransition(async () => {
      const result = await updateGoalAmount({
        id: goal.id,
        currentAmount: afterDeposit,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDeposit(0);
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setDeposit(0);
        setError(null);
        onClose();
      }}
      title={`Verso ${goal.title}`}
      subtitle="Quanto vuoi accantonare oggi?"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[10px] border border-iri-violet/20 bg-iri-violet/[0.06] px-4 py-3">
          <p className="m-0 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
            Attualmente accantonati
          </p>
          <p className="m-0 mt-1 font-mono-tabular text-[22px] font-medium text-ink-primary">
            {currentSplit.int}
            <span className="text-[13px] opacity-65">,{currentSplit.dec}</span>
            <span className="ml-1 text-[12px] text-ink-muted">€</span>
            <span className="ml-2 text-[12px] text-ink-secondary">
              / {splitCurrency(target).int},{splitCurrency(target).dec}€
            </span>
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
            Aggiungi
          </p>
          <div className="relative">
            <PiggyBank className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-iri-pale" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={deposit || ""}
              onChange={(e) => setDeposit(Number(e.target.value) || 0)}
              placeholder="50"
              autoFocus
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] pl-10 pr-8 py-3 font-mono-tabular text-[18px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-muted">
              €
            </span>
          </div>
        </div>

        {deposit > 0 && (
          <div className="rounded-[10px] border border-cyan-300/20 bg-cyan-300/[0.04] px-4 py-3">
            <p className="m-0 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-300/80">
              Dopo l&apos;accantonamento
            </p>
            <p className="m-0 mt-1 font-mono-tabular text-[18px] font-medium text-ink-primary">
              {afterSplit.int}
              <span className="text-[12px] opacity-65">,{afterSplit.dec}</span>
              <span className="ml-1 text-[11px] text-ink-muted">€ accantonati</span>
            </p>
            <p className="m-0 mt-0.5 text-[11px] text-ink-secondary">
              {newRemaining === 0 ? (
                <span className="text-emerald-300">
                  🎉 Obiettivo raggiunto!
                </span>
              ) : (
                <>
                  Mancano{" "}
                  <span className="iri-text font-medium">
                    {remainingSplit.int},{remainingSplit.dec}€
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={deposit <= 0 || isPending}
          onClick={handleSubmit}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? "Salvataggio…" : "Conferma accantonamento"}
        </button>
      </div>
    </Modal>
  );
}