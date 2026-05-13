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

type DailyPoint = { date: string; amount: number; label: string };

function PlanPill({ plan }: { plan: string }) {
  if (plan === "free") return null;
  const isPro = plan === "pro";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        background: isPro ? "rgba(168,139,250,0.15)" : "rgba(168,139,250,0.08)",
        border: isPro ? "1px solid rgba(168,139,250,0.4)" : "1px solid rgba(168,139,250,0.2)",
        color: isPro ? "#C4B5FD" : "#A88BFA",
        width: "fit-content",
      }}
    >
      {isPro ? "Piano Pro ✦" : "Piano Premium"}
    </div>
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
          <Topbar userName={data.profile?.name || "ospite"} />
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-5">
            <RecapBanner />
            <HeroCard stats={data.stats} />
            <UpgradeBanner plan={plan} />
            <PlanPill plan={plan} />
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