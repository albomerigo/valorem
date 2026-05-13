import type { DashboardData } from "@/lib/finance";
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
import Link from "next/link";

type DailyPoint = { date: string; amount: number; label: string };

function PlanPill({ plan }: { plan: string }) {
  if (plan === "free") return null;
  const isPro = plan === "pro";
  return (
    <Link
      href="/pricing"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px 3px 6px",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: isPro
          ? "linear-gradient(135deg, rgba(168,139,250,0.2), rgba(96,165,250,0.15))"
          : "rgba(168,139,250,0.12)",
        border: isPro
          ? "1px solid rgba(168,139,250,0.45)"
          : "1px solid rgba(168,139,250,0.25)",
        color: isPro ? "#C4B5FD" : "#A88BFA",
        boxShadow: isPro
          ? "0 0 16px rgba(168,139,250,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          animation: isPro ? "shimmerSlide 3s ease-in-out infinite" : "none",
        }}
      />
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isPro
            ? "linear-gradient(135deg, #A88BFA, #E879F9)"
            : "rgba(168,139,250,0.3)",
          fontSize: "8px",
          flexShrink: 0,
        }}
      >
        {isPro ? "✦" : "★"}
      </span>
      <span style={{ position: "relative", zIndex: 1 }}>
        {isPro ? "Pro" : "Premium"}
      </span>
      <style>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Link>
  );
}

export function Dashboard({
  data,
  dailyData,
}: {
  data: DashboardData;
  dailyData: DailyPoint[];
}) {
  const plan = data.profile?.plan ?? "free";

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar />
      </div>
      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <div className="flex items-center justify-between gap-3">
            <Topbar userName={data.profile?.name || "ospite"} />
            <PlanPill plan={plan} />
          </div>
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-5">
            <RecapBanner />
            <HeroCard stats={data.stats} />
            <UpgradeBanner plan={plan} />
            <KPIRow stats={data.stats} />
            <CoachBanner stats={data.stats} transactions={data.transactions} />
            <SpendingChart
              data={dailyData}
              dailyBudgetBase={data.stats.dailyBudgetBase}
            />
            <CoachStripe
              coachMessage={data.stats.coachMessage}
              stats={data.stats}
            />
            <TransactionsList
              transactions={data.transactions}
              stats={data.stats}
            />
          </div>
        </div>
      </div>
      <FabButton />
      <BottomBar activeRoute="dashboard" />
    </div>
  );
}