"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { DashboardData, Goal } from "@/lib/finance";
import { Sidebar } from "./sidebar";
import { BottomBar } from "./bottom-bar";
import { FabButton } from "./fab-button";
import { Topbar } from "./topbar";
import { HeroCard } from "./hero-card";
import { KPIRow } from "./kpi-row";
import { CoachStripe } from "./coach-stripe";
import { CoachBanner } from "./coach-banner";
import { RecapBanner } from "./recap-banner";
import { TransactionsList } from "./transactions-list";
import { SpendingChart } from "./spending-chart";
import { UpgradeBanner } from "./upgrade-banner";
import { OnboardingChecklist } from "./onboarding-checklist";
import { NewTransactionModal } from "./new-transaction-modal";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";

type DailyPoint = { date: string; amount: number; label: string };

function CurrentMonthRecapLink() {
  const now = new Date();
  const slug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  return (
    <Link
      href={`/recap/${slug}`}
      className="glass-panel-subtle flex items-center gap-3 rounded-[14px] px-4 py-3 transition-all hover:bg-white/[0.04]"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
        <Calendar className="h-4 w-4" strokeWidth={1.6} />
      </div>
      <p className="m-0 flex-1 text-[13px] font-medium text-ink-secondary">
        Recap di {monthLabel}
      </p>
      <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.6} />
    </Link>
  );
}

function PlanPill({ plan }: { plan: string }) {
  if (plan === "free") return null;
  const isPro = plan === "pro";
  return (
    <div className="flex justify-center">
      <Link
        href="/pricing"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 14px 4px 8px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          background: isPro
            ? "linear-gradient(135deg, rgba(168,139,250,0.18), rgba(96,165,250,0.12))"
            : "rgba(168,139,250,0.10)",
          border: isPro
            ? "1px solid rgba(168,139,250,0.4)"
            : "1px solid rgba(168,139,250,0.22)",
          color: isPro ? "#C4B5FD" : "#A88BFA",
          boxShadow: isPro
            ? "0 0 20px rgba(168,139,250,0.18), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "none",
        }}
      >
        {isPro && (
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            animation: "shimmerSlide 3s ease-in-out infinite",
          }} />
        )}
        <span style={{
          width: "16px", height: "16px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isPro ? "linear-gradient(135deg, #A88BFA, #E879F9)" : "rgba(168,139,250,0.25)",
          fontSize: "9px", flexShrink: 0, position: "relative", zIndex: 1,
        }}>
          {isPro ? "✦" : "★"}
        </span>
        <span style={{ position: "relative", zIndex: 1 }}>
          {isPro ? "Piano Pro" : "Piano Premium"}
        </span>
        <style>{`@keyframes shimmerSlide{0%{transform:translateX(-100%)}50%{transform:translateX(100%)}100%{transform:translateX(100%)}}`}</style>
      </Link>
    </div>
  );
}

export function Dashboard({
  data,
  dailyData,
  goalsCount = 0,
  goals = [],
}: {
  data: DashboardData;
  dailyData: DailyPoint[];
  goalsCount?: number;
  goals?: Goal[];
}) {
  const plan = data.profile?.plan ?? "free";
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCustomCategories);
  }, []);

  const openNewTransaction = () => setIsAddingTransaction(true);

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar />
      </div>
      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar
            userName={data.profile?.name || "ospite"}
            transactions={data.transactions}
            goals={goals}
          />
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-5">
            <RecapBanner />
            <CurrentMonthRecapLink />
            <OnboardingChecklist
              transactions={data.transactions.length}
              goals={goalsCount}
              onAddTransaction={openNewTransaction}
              profileCreatedAt={(data.profile as unknown as { created_at?: string })?.created_at}
            />
            <PlanPill plan={plan} />
            <HeroCard stats={data.stats} />
            <UpgradeBanner plan={plan} />
            <KPIRow stats={data.stats} />
            <CoachBanner stats={data.stats} transactions={data.transactions} />
            <SpendingChart data={dailyData} dailyBudgetBase={data.stats.dailyBudgetBase} />
            <CoachStripe coachMessage={data.stats.coachMessage} stats={data.stats} />
            <TransactionsList
              transactions={data.transactions}
              stats={data.stats}
              onAddTransaction={openNewTransaction}
            />
          </div>
        </div>
      </div>

      <NewTransactionModal
        isOpen={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
        customCategories={customCategories}
      />
      <FabButton />
      <BottomBar activeRoute="dashboard" />
    </div>
  );
}
