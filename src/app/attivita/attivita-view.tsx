"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  Calendar,
  ListOrdered,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Repeat2,
  Gamepad2,
  HeartPulse,
  Home as HomeIcon,
  ShoppingBag,
  MoreHorizontal,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { EmptyActivity, EmptyActivityFiltered } from "@/components/empty-states";
import type {
  UserProfile,
  Transaction,
  DashboardStats,
} from "@/lib/finance";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { deleteTransaction } from "@/app/actions/transactions";
import { splitCurrency } from "@/lib/utils";

type Period = "month" | "30days" | "3months" | "all";
type TypeFilter = "all" | "expense" | "income";

const CATEGORIES = [
  "Alimentari",
  "Ristorazione",
  "Trasporti",
  "Abbonamento",
  "Svago",
  "Salute",
  "Casa",
  "Shopping",
  "Altro",
];

const PERIOD_LABELS: Record<Period, string> = {
  month: "Mese corrente",
  "30days": "Ultimi 30 giorni",
  "3months": "Ultimi 3 mesi",
  all: "Tutto",
};

export function AttivitaView({
  profile,
  transactions,
  stats,
}: {
  profile: UserProfile;
  transactions: Transaction[];
  stats: DashboardStats;
}) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Applica i filtri
  const filtered = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;

    if (period === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "30days") {
      cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 30);
    } else if (period === "3months") {
      cutoff = new Date(now);
      cutoff.setMonth(now.getMonth() - 3);
    }

    return transactions.filter((tx) => {
      // Filtro data
      if (cutoff && new Date(tx.transaction_date) < cutoff) return false;

      // Filtro tipo
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Filtro categoria (solo per expense)
      if (selectedCategories.size > 0 && tx.type === "expense") {
        const cat = tx.category || "Altro";
        if (!selectedCategories.has(cat)) return false;
      }

      // Ricerca testuale
      if (search.trim()) {
        const q = search.toLowerCase();
        const inMerchant = tx.merchant.toLowerCase().includes(q);
        const inCategory = (tx.category || "").toLowerCase().includes(q);
        if (!inMerchant && !inCategory) return false;
      }

      return true;
    });
  }, [transactions, search, period, typeFilter, selectedCategories]);

  // Calcola KPI riassuntivi
  const kpis = useMemo(() => {
    const expenses = filtered.filter((t) => t.type === "expense");
    const incomes = filtered.filter((t) => t.type === "income");
    const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);

    const categoryCount: Record<string, number> = {};
    for (const t of expenses) {
      const c = t.category || "Altro";
      categoryCount[c] = (categoryCount[c] || 0) + Number(t.amount);
    }
    const topCat = Object.entries(categoryCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      count: filtered.length,
      totalExpense,
      totalIncome,
      netValue: totalIncome - totalExpense,
      avgPerTx:
        filtered.length > 0
          ? (totalExpense + totalIncome) / filtered.length
          : 0,
      topCategory: topCat ? topCat[0] : null,
      topCategoryAmount: topCat ? topCat[1] : 0,
    };
  }, [filtered]);

  // Raggruppa per data
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of filtered) {
      if (!groups[tx.transaction_date]) groups[tx.transaction_date] = [];
      groups[tx.transaction_date].push(tx);
    }
    return Object.entries(groups);
  }, [filtered]);

  function toggleCategory(cat: string) {
    const next = new Set(selectedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelectedCategories(next);
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setSelectedCategories(new Set());
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all" ||
    selectedCategories.size > 0;

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="activity" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Attività" />

          {/* HEADER */}
          <header className="mb-6 mt-8">
            <div className="flex items-center gap-3">
              <ListOrdered
                className="h-5 w-5 text-iri-pale"
                strokeWidth={1.6}
              />
              <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
                La tua storia finanziaria
              </h1>
            </div>
            <p className="mt-2 max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
              Ogni transazione che hai registrato, in un'unica vista. Filtra,
              cerca, comprendi.
            </p>
          </header>

          {/* FILTERS BAR */}
          <div className="glass-panel mb-5 rounded-[16px] p-5">
            {/* Riga 1: search + period */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome o categoria…"
                  className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-[13px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-1.5">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-[10px] border px-3 py-2 text-[11px] font-medium transition-all duration-[200ms] ${
                      period === p
                        ? "border-iri-violet/50 bg-iri-violet/[0.15] text-ink-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25"
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Riga 2: type toggle + categorie */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-[3px]">
                <TypeTab
                  active={typeFilter === "all"}
                  onClick={() => setTypeFilter("all")}
                  label="Tutte"
                />
                <TypeTab
                  active={typeFilter === "expense"}
                  onClick={() => setTypeFilter("expense")}
                  label="Spese"
                  icon={<ArrowDownRight className="h-3 w-3" />}
                  color="red"
                />
                <TypeTab
                  active={typeFilter === "income"}
                  onClick={() => setTypeFilter("income")}
                  label="Entrate"
                  icon={<ArrowUpRight className="h-3 w-3" />}
                  color="green"
                />
              </div>

              <div className="flex flex-1 flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-3 py-1 text-[10px] font-medium transition-all duration-[200ms] ${
                      selectedCategories.has(cat)
                        ? "border-iri-violet/50 bg-iri-violet/[0.15] text-ink-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-ink-secondary hover:border-iri-violet/25"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-[10px] border border-white/[0.08] px-3 py-2 text-[11px] text-ink-secondary transition-colors hover:border-white/[0.16] hover:text-ink-primary"
                >
                  <X className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* KPI SUMMARY */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiBox
              label="Transazioni"
              value={kpis.count.toString()}
              suffix=""
            />
            <KpiBox
              label="Spese totali"
              value={splitCurrency(kpis.totalExpense).int}
              decimal={splitCurrency(kpis.totalExpense).dec}
              suffix="€"
              tone="expense"
            />
            <KpiBox
              label="Entrate totali"
              value={splitCurrency(kpis.totalIncome).int}
              decimal={splitCurrency(kpis.totalIncome).dec}
              suffix="€"
              tone="income"
            />
            <KpiBox
              label={kpis.topCategory ? "Top categoria" : "Media"}
              value={
                kpis.topCategory
                  ? kpis.topCategory
                  : splitCurrency(kpis.avgPerTx).int
              }
              decimal={
                kpis.topCategory
                  ? undefined
                  : splitCurrency(kpis.avgPerTx).dec
              }
              suffix={
                kpis.topCategory
                  ? `· ${kpis.topCategoryAmount.toFixed(0)}€`
                  : "€"
              }
              isText={!!kpis.topCategory}
            />
          </div>

          {/* LISTA */}
          {grouped.length === 0 ? (
            hasActiveFilters ? (
              <EmptyActivityFiltered onReset={clearFilters} />
            ) : (
              <EmptyActivity />
            )
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map(([date, txs]) => (
                <DayGroup
                  key={date}
                  date={date}
                  transactions={txs}
                  stats={stats}
                />
              ))}
            </div>
          )}
       </div>
      </div>

      <FabButton />
      <BottomBar activeRoute="activity" />
    </div>
  );
}

function TypeTab({
  active,
  onClick,
  label,
  icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  color?: "red" | "green";
}) {
  const activeColor =
    color === "red"
      ? "bg-red-500/[0.15] text-red-300"
      : color === "green"
      ? "bg-emerald-500/[0.15] text-emerald-300"
      : "bg-iri-violet/[0.15] text-ink-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-medium transition-all duration-[200ms] ${
        active ? activeColor : "text-ink-secondary hover:text-ink-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function KpiBox({
  label,
  value,
  decimal,
  suffix,
  tone,
  isText,
}: {
  label: string;
  value: string;
  decimal?: string;
  suffix: string;
  tone?: "expense" | "income";
  isText?: boolean;
}) {
  const color =
    tone === "expense"
      ? "text-red-200"
      : tone === "income"
      ? "text-emerald-200"
      : "text-ink-primary";

  return (
    <div className="glass-panel rounded-[12px] px-4 py-3">
      <p className="eyebrow text-[9px]">{label}</p>
      <p className="m-0 mt-1.5 font-mono-tabular font-medium">
        {isText ? (
          <>
            <span className={`text-[14px] ${color}`}>{value}</span>
            <span className="ml-1 text-[10px] text-ink-muted">{suffix}</span>
          </>
        ) : (
          <>
            <span className={`text-[20px] ${color} [letter-spacing:-0.02em]`}>
              {value}
            </span>
            {decimal && (
              <span className="text-[12px] text-ink-primary/60">,{decimal}</span>
            )}
            <span className="ml-0.5 text-[11px] text-ink-muted">{suffix}</span>
          </>
        )}
      </p>
    </div>
  );
}

function DayGroup({
  date,
  transactions,
  stats,
}: {
  date: string;
  transactions: Transaction[];
  stats: DashboardStats;
}) {
  const dayTotal = transactions.reduce(
    (s, t) => s + (t.type === "expense" ? -Number(t.amount) : Number(t.amount)),
    0
  );
  const { int, dec } = splitCurrency(Math.abs(dayTotal));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <p className="eyebrow-accent text-[10px]">
          {formatDayHeader(date)}
        </p>
        <p className="m-0 font-mono-tabular text-[11px] text-ink-secondary">
          {dayTotal !== 0 && (
            <>
              {dayTotal > 0 ? "+" : "−"}
              {int},{dec}€
            </>
          )}
        </p>
      </div>
      <div className="glass-panel overflow-hidden rounded-[14px]">
        {transactions.map((tx, i) => (
          <ActivityRow
            key={tx.id}
            tx={tx}
            stats={stats}
            isLast={i === transactions.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({
  tx,
  stats,
  isLast,
}: {
  tx: Transaction;
  stats: DashboardStats;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const amount = Number(tx.amount);
  const timeLabel = amountToTimeLabel(amount, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);
  const { int, dec } = splitCurrency(amount);
  const { Icon, color } = categoryMeta(tx.category, tx.type);

  function handleDelete() {
    if (!confirm(`Eliminare "${tx.merchant}"?`)) return;
    startTransition(async () => {
      await deleteTransaction(tx.id);
    });
  }

  return (
    <div
      className={`group relative flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02] ${
        !isLast ? "border-b border-white/[0.04]" : ""
      } ${isPending ? "opacity-50" : ""}`}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] border border-white/[0.06] bg-white/[0.03]"
        style={{ color }}
      >
        <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="m-0 text-[13px] font-medium text-ink-primary">
              {tx.merchant}
            </p>
            {tx.recurring && (
              <span className="rounded-md border border-iri-violet/25 bg-iri-violet/[0.1] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.08em] text-iri-pale">
                Ricorrente
              </span>
            )}
          </div>
          <p
            className={`m-0 font-mono-tabular text-[13px] font-medium [letter-spacing:-0.01em] ${
              tx.type === "income" ? "text-emerald-300" : "text-ink-primary"
            }`}
          >
            {tx.type === "expense" ? "−" : "+"}
            {int}
            <span className="text-[11px] opacity-65">,{dec}</span>
            <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
          </p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-[11px] text-ink-secondary">
            {tx.category || "Altro"}
          </span>
          <p className="m-0 font-mono-tabular text-[11px] text-ink-muted">
            ≡ {timeLabel} {suffix}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        title="Elimina"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-transparent text-ink-faint opacity-0 transition-all duration-[200ms] hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-300 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </div>
  );
}



function categoryMeta(
  category: string | null,
  type: "expense" | "income"
): { Icon: typeof ShoppingCart; color: string } {
  if (type === "income") {
    return { Icon: TrendingUp, color: "#86EFAC" };
  }
  const map: Record<string, { Icon: typeof ShoppingCart; color: string }> = {
    Alimentari: { Icon: ShoppingCart, color: "#A88BFA" },
    Ristorazione: { Icon: UtensilsCrossed, color: "#FDA4AF" },
    Trasporti: { Icon: Car, color: "#FCD34D" },
    Abbonamento: { Icon: Repeat2, color: "#93C5FD" },
    Svago: { Icon: Gamepad2, color: "#F0ABFC" },
    Salute: { Icon: HeartPulse, color: "#7DD3FC" },
    Casa: { Icon: HomeIcon, color: "#C4B5FD" },
    Shopping: { Icon: ShoppingBag, color: "#E879F9" },
  };
  return (
    (category && map[category]) || { Icon: MoreHorizontal, color: "#9CA3AF" }
  );
}

function formatDayHeader(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDate = date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (sameDay(date, today)) return `Oggi · ${formatDate}`;
  if (sameDay(date, yesterday)) return `Ieri · ${formatDate}`;
  return formatDate;
}