import type { DashboardData } from "@/lib/finance";
import { Sidebar } from "./sidebar";
import { BottomBar } from "./bottom-bar";
import { FabButton } from "./fab-button";
import { Topbar } from "./topbar";
import { HeroCard } from "./hero-card";
import { UpgradeBanner } from "./upgrade-banner";
import { KPIRow } from "./kpi-row";
import { CoachStripe } from "./coach-stripe";
import { CoachBanner } from "./coach-banner";
import { RecapBanner } from "./recap-banner";
import { TransactionsList } from "./transactions-list";
import { SpendingChart } from "./spending-chart";

type DailyPoint = { date: string; amount: number; label: string };

export function Dashboard({
  data,
  dailyData,
}: {
  data: DashboardData;
  dailyData: DailyPoint[];
}) {
  return (
    <div className="relative min-h-screen">
      {/* Sidebar desktop */}
     <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar />
      </div>
      {/* Contenuto */}
      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={data.profile?.name || "ospite"} />
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-5">
            <RecapBanner />
            <HeroCard stats={data.stats} />
            <UpgradeBanner plan={data.profile?.plan ?? "free"} />
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

      {/* UI mobile */}
      <FabButton />
      <BottomBar activeRoute="dashboard" />
    </div>
  );
}