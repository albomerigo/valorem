"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Calendar, ChevronRight, X } from "lucide-react";
import type { DashboardData, Goal, FixedCost } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";
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
import { WeeklyRecap } from "./weekly-recap";
import { NewTransactionModal } from "./new-transaction-modal";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";

type DailyPoint = { date: string; amount: number; label: string };

function WelcomeAnimation({ name }: { name: string }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "done">("done");
  const firstName = name ? name.split(" ")[0] : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("valorem_welcomed") === "1") return;
    localStorage.setItem("valorem_welcomed", "1");
    setPhase("in");
    const t1 = setTimeout(() => setPhase("hold"), 500);
    const t2 = setTimeout(() => setPhase("out"), 2000);
    const t3 = setTimeout(() => setPhase("done"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  const opacity =
    phase === "in" ? 0 :
    phase === "hold" ? 1 :
    0;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(6,5,12,0.82)",
        backdropFilter: "blur(6px)",
        transition: "opacity 0.5s ease",
        opacity,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-fraunces, serif)",
          fontSize: "clamp(28px, 6vw, 48px)",
          fontStyle: "italic",
          fontWeight: 400,
          color: "#E9E4FF",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        Benvenuto{firstName ? `, ${firstName}` : ""} 🎉
      </h2>
      <p
        style={{
          marginTop: "12px",
          fontSize: "16px",
          color: "rgba(200,190,240,0.7)",
          letterSpacing: "0.03em",
        }}
      >
        Valorem è pronto per te.
      </p>
    </div>
  );
}


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

function CompleteProfileBanner({
  monthlyIncome,
  safeToSpendToday,
}: {
  monthlyIncome: number;
  safeToSpendToday: number;
}) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = "valorem_profile_banner_dismissed";
    setDismissed(localStorage.getItem(key) === "true");
    setMounted(true);
  }, []);

  if (!mounted || dismissed || safeToSpendToday !== 0 || monthlyIncome !== 0)
    return null;

  function handleDismiss() {
    localStorage.setItem("valorem_profile_banner_dismissed", "true");
    setDismissed(true);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[16px] border border-amber-400/20 px-5 py-4"
      style={{ background: "rgba(245,158,11,0.06)" }}
    >
      <button
        type="button"
        onClick={handleDismiss}
        title="Chiudi"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex flex-wrap items-center gap-3 pr-8">
        <AlertCircle
          className="h-4 w-4 flex-shrink-0 text-amber-400"
          strokeWidth={1.8}
        />
        <p className="m-0 flex-1 text-[13px] text-ink-secondary">
          <span className="font-medium text-ink-primary">
            Il tuo Safe-to-Spend è 0
          </span>{" "}
          — completa il profilo per vedere il tuo budget reale.
        </p>
        <Link
          href="/settings"
          className="flex-shrink-0 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
        >
          Configura ora →
        </Link>
      </div>
    </div>
  );
}

function EveningCheck({
  name,
  safeToSpendToday,
}: {
  name: string;
  safeToSpendToday: number;
}) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 18) {
      setMounted(true);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const key = `valorem_evening_dismissed_${today}`;
    setDismissed(localStorage.getItem(key) === "true");
    setMounted(true);
  }, []);

  if (!mounted || dismissed || new Date().getHours() < 18) return null;

  const isPositive = safeToSpendToday > 0;
  const firstName = name ? name.split(" ")[0] : "";

  function handleDismiss() {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`valorem_evening_dismissed_${today}`, "true");
    setDismissed(true);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[16px] border border-iri-violet/20 px-5 py-4"
      style={{
        background:
          "linear-gradient(135deg, #12082a 0%, #0a0618 100%)",
      }}
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
        <span className="mt-0.5 text-[22px]">🌙</span>
        <div>
          <p className="m-0 text-[13px] font-medium text-ink-primary">
            Buonasera{firstName ? ` ${firstName}` : ""}
          </p>
          <p
            className="m-0 mt-1 text-[12px] leading-[1.5]"
            style={{ color: isPositive ? "#86EFAC" : "#FDA4AF" }}
          >
            {isPositive
              ? `Come è andata oggi? Hai ancora ${safeToSpendToday.toFixed(0)}€ disponibili.`
              : "Oggi hai superato il budget. Domani è un nuovo giorno. 💙"}
          </p>
        </div>
      </div>
    </div>
  );
}

function UpcomingFixedCosts({ fixedCosts }: { fixedCosts: FixedCost[] }) {
  if (fixedCosts.length === 0) return null;

  const total = fixedCosts.reduce((s, c) => s + Number(c.amount), 0);
  const { int: tInt, dec: tDec } = splitCurrency(total);

  return (
    <div className="glass-panel-subtle rounded-[16px] px-5 py-4">
      <p className="eyebrow mb-3">Costi fissi mensili</p>
      <div className="flex flex-col gap-2">
        {fixedCosts.map((cost) => {
          const { int, dec } = splitCurrency(Number(cost.amount));
          return (
            <div key={cost.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-iri-violet" />
                <span className="truncate text-[13px] text-ink-secondary">
                  {cost.name}
                </span>
              </div>
              <span className="shrink-0 font-mono-tabular text-[13px] text-red-300">
                −{int},{dec}€
              </span>
            </div>
          );
        })}
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-2">
          <span className="text-[11px] text-ink-muted">Totale mensile</span>
          <span className="font-mono-tabular text-[12px] font-medium text-red-200">
            −{tInt},{tDec}€
          </span>
        </div>
      </div>
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

  // Ctrl+N / Cmd+N → apri nuova transazione
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setIsAddingTransaction(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const openNewTransaction = () => setIsAddingTransaction(true);

  return (
    <div className="relative min-h-screen">
      <WelcomeAnimation name={data.profile?.name || ""} />
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar userName={data.profile?.name || ""} />
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
            <CompleteProfileBanner
              monthlyIncome={data.profile?.monthly_income ?? 0}
              safeToSpendToday={data.stats.safeToSpendToday}
            />
            <WeeklyRecap transactions={data.transactions} />
            <EveningCheck
              name={data.profile?.name || ""}
              safeToSpendToday={data.stats.safeToSpendToday}
            />
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
            <UpcomingFixedCosts fixedCosts={data.fixedCosts} />
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
