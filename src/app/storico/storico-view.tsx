"use client";

import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import type { UserProfile } from "@/lib/finance";
import type { MonthEntry } from "./page";
import { splitCurrency } from "@/lib/utils";

export function StoricoView({
  profile,
  recaps,
}: {
  profile: UserProfile;
  recaps: MonthEntry[];
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-28 md:pb-8">
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <p className="eyebrow mb-2">Cronologia</p>
            <h1 className="font-serif text-[32px] italic leading-[1.1] text-ink-primary">
              Il tuo storico
            </h1>
            <p className="mt-2 text-[13px] text-ink-secondary">
              {recaps.length} {recaps.length === 1 ? "mese" : "mesi"} di storia
              finanziaria
            </p>
          </div>

          {/* Lista mesi */}
          {recaps.length === 0 ? (
            <EmptyStorico />
          ) : (
            <div className="flex flex-col gap-3">
              {recaps.map((entry) => (
                <MonthCard
                  key={entry.slug}
                  entry={entry}
                  profile={profile}
                  onClick={() => router.push(`/recap/${entry.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomBar />
    </div>
  );
}

function MonthCard({
  entry,
  profile,
  onClick,
}: {
  entry: MonthEntry;
  profile: UserProfile;
  onClick: () => void;
}) {
  const { recap, slug } = entry;
  const [year, month] = slug.split("-").map(Number);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const { int: spentInt, dec: spentDec } = splitCurrency(recap.totalSpent);
  const { int: incomeInt, dec: incomeDec } = splitCurrency(recap.totalIncome);
  const net = recap.totalIncome - recap.totalSpent;
  const isPositive = net >= 0;

  const TrendIcon =
    recap.trendVsPrevMonth === null
      ? Minus
      : recap.trendVsPrevMonth > 5
      ? TrendingUp
      : recap.trendVsPrevMonth < -5
      ? TrendingDown
      : Minus;

  const trendColor =
    recap.trendVsPrevMonth === null
      ? "text-ink-muted"
      : recap.trendVsPrevMonth > 5
      ? "text-red-400"
      : recap.trendVsPrevMonth < -5
      ? "text-emerald-400"
      : "text-ink-muted";

  return (
    <button
      onClick={onClick}
      className="group glass-panel w-full rounded-[18px] p-5 text-left transition-all duration-[350ms] hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Info mese */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03]">
            <Calendar className="h-4.5 w-4.5 text-iri-pale" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[15px] font-medium capitalize text-ink-primary">
              {monthName}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-secondary">
              {recap.transactionCount}{" "}
              {recap.transactionCount === 1 ? "transazione" : "transazioni"}
              {recap.capitalInvested > 0 &&
                ` · ${splitCurrency(recap.capitalInvested).int},${splitCurrency(recap.capitalInvested).dec}€ investiti`}
            </p>
          </div>
        </div>

        {/* Freccia hover */}
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-faint opacity-0 transition-all duration-[250ms] group-hover:translate-x-0.5 group-hover:text-iri-pale group-hover:opacity-100" />
      </div>

      {/* KPI riga */}
      <div className="mt-4 flex items-end justify-between gap-3">
        {/* Spese */}
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Spese
          </p>
          <p className="font-mono-tabular text-[20px] font-medium leading-none text-red-300">
            {spentInt}
            <span className="text-[13px] text-red-300/65">,{spentDec}</span>
            <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
          </p>
        </div>

        {/* Entrate */}
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Entrate
          </p>
          <p className="font-mono-tabular text-[20px] font-medium leading-none text-emerald-300">
            {incomeInt}
            <span className="text-[13px] text-emerald-300/65">,{incomeDec}</span>
            <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
          </p>
        </div>

        {/* Trend */}
        <div className="flex flex-col items-end">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Trend
          </p>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" strokeWidth={2} />
            {recap.trendVsPrevMonth !== null && (
              <span className="font-mono-tabular text-[13px] font-medium">
                {Math.abs(recap.trendVsPrevMonth).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Bilancio */}
        <div className="flex flex-col items-end">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Bilancio
          </p>
          <p
            className={`font-mono-tabular text-[15px] font-medium ${
              isPositive ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {isPositive ? "+" : "−"}
            {splitCurrency(Math.abs(net)).int}€
          </p>
        </div>
      </div>

      {/* Narrativa del Coach se presente */}
      {recap.coachQuote && (
        <p className="mt-3 border-t border-white/[0.04] pt-3 font-serif text-[13px] italic leading-[1.5] text-ink-secondary">
          {recap.coachQuote}
        </p>
      )}
    </button>
  );
}

function EmptyStorico() {
  return (
    <div className="glass-panel rounded-[18px] p-10 text-center">
      <p className="font-serif text-[24px] italic text-ink-primary">
        Nessun mese ancora.
      </p>
      <p className="mt-3 text-[13px] text-ink-secondary">
        Aggiungi le tue prime transazioni per vedere la cronologia mensile.
      </p>
    </div>
  );
}