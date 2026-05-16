"use client";

import { useState, useTransition } from "react";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Trash2,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { EmptyGoals } from "@/components/empty-states";
import type { UserProfile, Goal, DashboardStats } from "@/lib/finance";
import { estimateGoalReachDate, getGoalProgress } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { NewGoalModal } from "@/components/new-goal-modal";
import { DepositGoalModal } from "@/components/deposit-goal-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteGoal } from "@/app/actions/goals";
import { splitCurrency } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";

export function ObiettiviView({
  profile,
  goals,
  monthlySavings,
  stats,
}: {
  profile: UserProfile;
  goals: Goal[];
  monthlySavings: number;
  stats: DashboardStats;
}) {
  const [newOpen, setNewOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="goals" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Obiettivi" />

          <header className="relative mb-8 mt-8 flex items-start justify-between gap-4">
            <HelpTooltip
              title="Obiettivi Intelligenti"
              content="Crea un obiettivo con importo target. Valorem calcola quanto devi mettere da parte ogni mese in base al tuo ritmo reale di risparmio."
              example="Es: Vacanza 1.000€ tra 8 mesi = 125€/mese"
            />
            <div>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-iri-pale" strokeWidth={1.6} />
                <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
                  Dove stai andando
                </h1>
              </div>
              <p className="mt-2 max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
                Ogni obiettivo è una destinazione. Valorem calcola la rotta in
                base al tuo ritmo di risparmio reale.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nuovo obiettivo
            </button>
          </header>

          {/* Info sul ritmo di risparmio */}
          {activeGoals.length > 0 && (
            <div className="glass-panel mb-6 flex items-center gap-4 rounded-[16px] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-iri-violet/25 bg-iri-violet/[0.08]">
                <TrendingUp className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />
              </div>
              <div>
                <p className="eyebrow m-0">Il tuo ritmo attuale</p>
                <p className="m-0 mt-0.5 text-[13px] text-ink-primary">
                  Stai accantonando{" "}
                  <span className="iri-text font-medium">
                    {monthlySavings.toFixed(0)}€
                  </span>{" "}
                  al mese. I calcoli qui sotto usano questo ritmo.
                </p>
              </div>
            </div>
          )}

          {/* Obiettivi attivi */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <EmptyGoals onCreate={() => setNewOpen(true)} />
          )}

          {activeGoals.length > 0 && (
            <div className="mb-8">
              <p className="eyebrow mb-3 px-1">Attivi</p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {activeGoals.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    monthlySavings={monthlySavings}
                    stats={stats}
                    onDeposit={() => setDepositGoal(g)}
                  />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <p className="eyebrow mb-3 px-1">Completati</p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {completedGoals.map((g) => (
                  <CompletedGoalCard key={g.id} goal={g} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewGoalModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DepositGoalModal
        open={depositGoal !== null}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
      />

      <FabButton />
      <BottomBar activeRoute="goals" />
    </div>
  );
}
function GoalCard({
  goal,
  monthlySavings,
  stats,
  onDeposit,
}: {
  goal: Goal;
  monthlySavings: number;
  stats: DashboardStats;
  onDeposit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const progress = getGoalProgress(goal);
  const { daysToGo, targetDate, months } = estimateGoalReachDate(
    goal,
    monthlySavings
  );
  const remaining =
    Number(goal.target_amount) - Number(goal.current_amount);
  const remainingSplit = splitCurrency(Math.max(0, remaining));
  const currentSplit = splitCurrency(Number(goal.current_amount));
  const targetSplit = splitCurrency(Number(goal.target_amount));

  // Calcolo scenari "what-if" rispetto alla deadline
  const deadlineInfo = (() => {
    if (!goal.deadline) return null;
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDeadline < 0)
      return { status: "expired" as const, text: "Scadenza passata" };

    if (daysToGo < 0 || targetDate === null)
      return {
        status: "at-risk" as const,
        text: "Devi iniziare a risparmiare",
      };

    if (daysToGo <= daysUntilDeadline)
      return {
        status: "on-track" as const,
        text: `In tempo — ${daysUntilDeadline - daysToGo}g di margine`,
      };

    const gapDays = daysToGo - daysUntilDeadline;
    const monthsShort = gapDays / 30;
    const extraNeeded = Math.ceil(remaining / daysUntilDeadline * 30);
    return {
      status: "late" as const,
      text: `In ritardo di ~${Math.ceil(monthsShort)} ${
        monthsShort < 2 ? "mese" : "mesi"
      } · serve ~${extraNeeded}€/mese`,
    };
  })();

  function handleDelete() {
    startTransition(async () => {
      await deleteGoal(goal.id);
    });
  }

  return (
    <div
      className={`glass-panel relative overflow-hidden rounded-[20px] p-6 transition-all duration-[400ms] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(168,139,250,0.2)] ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {/* Header: emoji + titolo + azioni */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-[24px]">
            {goal.emoji}
          </div>
          <div>
            <h3 className="m-0 text-[16px] font-medium text-ink-primary">
              {goal.title}
            </h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-secondary">
              {currentSplit.int},{currentSplit.dec}€ di{" "}
              <span className="text-ink-primary">
                {targetSplit.int},{targetSplit.dec}€
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          title="Elimina"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="iri-text font-mono-tabular text-[28px] font-medium [letter-spacing:-0.02em]">
            {progress}%
          </span>
          <span className="font-mono-tabular text-[11px] text-ink-secondary">
            mancano {remainingSplit.int},{remainingSplit.dec}€
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue shadow-[0_0_12px_rgba(168,139,250,0.5)] transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Calcolo data raggiungimento */}
      <div className="mb-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-cyan-300/85">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="eyebrow-accent m-0 text-[10px]">Rotta calcolata</p>
        </div>
        <p className="m-0 mt-1.5 font-serif text-[14px] italic text-ink-primary">
          {daysToGo < 0 || targetDate === null ? (
            <>
              Con un ritmo di risparmio di{" "}
              <span className="text-red-300">0€/mese</span>, questo obiettivo{" "}
              <span className="text-red-300">non si muove</span>. Imposta un
              obiettivo di risparmio nel Setup Vitale.
            </>
          ) : daysToGo === 0 ? (
            <>
              🎉 <span className="text-emerald-300">Obiettivo raggiunto!</span>
            </>
          ) : (
            <>
              Al tuo ritmo arriverai il{" "}
              <span className="iri-text font-medium">
                {targetDate.toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>{" "}
              — circa{" "}
              <span className="iri-text font-medium">{months}</span>{" "}
              {months === 1 ? "mese" : "mesi"}
            </>
          )}
        </p>
      </div>

      {/* Deadline info se presente */}
      {deadlineInfo && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${
            deadlineInfo.status === "on-track"
              ? "border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-300"
              : deadlineInfo.status === "late"
              ? "border-amber-300/25 bg-amber-300/[0.06] text-amber-300"
              : "border-red-300/25 bg-red-300/[0.06] text-red-300"
          }`}
        >
          {deadlineInfo.status === "on-track" ? (
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
          ) : (
            <AlertCircle className="h-3 w-3" strokeWidth={2} />
          )}
          <span>{deadlineInfo.text}</span>
        </div>
      )}

      {/* Bottone aggiungi accantonamento */}
      <button
        type="button"
        onClick={onDeposit}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-iri-violet/25 bg-iri-violet/[0.06] py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-iri-pale transition-all duration-[300ms] hover:border-iri-violet/45 hover:bg-iri-violet/[0.12] hover:text-ink-primary"
      >
        <PiggyBank className="h-3.5 w-3.5 transition-transform group-hover:scale-110" strokeWidth={1.8} />
        Accantona
      </button>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Elimina obiettivo?"
        description={`Questa azione non può essere annullata. L'obiettivo "${goal.title}" verrà rimosso definitivamente.`}
      />
    </div>
  );
}

function CompletedGoalCard({ goal }: { goal: Goal }) {
  const targetSplit = splitCurrency(Number(goal.target_amount));

  return (
    <div className="glass-panel relative overflow-hidden rounded-[20px] p-6 opacity-85">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] text-[24px]">
          {goal.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-[16px] font-medium text-ink-primary">
              {goal.title}
            </h3>
            <CheckCircle2
              className="h-4 w-4 text-emerald-300"
              strokeWidth={2}
            />
          </div>
          <p className="m-0 mt-0.5 font-mono-tabular text-[12px] text-emerald-300">
            {targetSplit.int},{targetSplit.dec}€ raggiunti
          </p>
        </div>
      </div>
    </div>
  );
}

