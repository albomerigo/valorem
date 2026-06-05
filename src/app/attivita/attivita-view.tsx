"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ListOrdered,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Pencil,
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
  Download,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { EmptyActivity, EmptyActivityFiltered } from "@/components/empty-states";
import { SkeletonTransactionRow } from "@/components/skeleton";
import type {
  UserProfile,
  Transaction,
  DashboardStats,
} from "@/lib/finance";
import { amountToTimeLabel, getTimeMetricSuffix, isInvestment } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";
import { deleteTransaction } from "@/app/actions/transactions";
import { splitCurrency } from "@/lib/utils";
import { NewTransactionModal } from "@/components/new-transaction-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";
type Period = "month" | "30days" | "3months" | "all" | "custom";
type TypeFilter = "all" | "expense" | "income";

const CAT_COLORS: Record<string, string> = {
  Alimentari: "#A88BFA",
  Ristorazione: "#FDA4AF",
  Trasporti: "#FCD34D",
  Abbonamento: "#93C5FD",
  Svago: "#F0ABFC",
  Salute: "#7DD3FC",
  Casa: "#C4B5FD",
  Shopping: "#E879F9",
  Investimenti: "#10B981",
  Altro: "#9CA3AF",
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function donutArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number
): string {
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, endDeg);
  const i1 = polarToCartesian(cx, cy, innerR, endDeg);
  const i2 = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

const CATEGORIES = [
  "Alimentari",
  "Ristorazione",
  "Trasporti",
  "Abbonamento",
  "Svago",
  "Salute",
  "Casa",
  "Shopping",
  "Investimenti",
  "Altro",
];

const PERIOD_LABELS: Record<Period, string> = {
  month: "Mese",
  "30days": "30 giorni",
  "3months": "3 mesi",
  all: "Tutto",
  custom: "Personalizzato",
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [hydrating, setHydrating] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    setHydrating(false);
    getCustomCategories().then(setCustomCategories);
  }, []);

  // Read ?period= query param from URL and apply it on mount
  useEffect(() => {
    const p = searchParams.get("period");
    if (p === "month" || p === "30days" || p === "3months" || p === "all" || p === "custom") {
      setPeriod(p as Period);
    }
  }, [searchParams]);

  const monthlyCount = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions.filter((tx) => new Date(tx.transaction_date) >= cutoff).length;
  }, [transactions]);

  const handleExportCSV = async () => {
    const plan = profile.plan || "free";
    if (plan === "free") {
      router.push("/pricing");
      return;
    }
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "valorem-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id);
    if ("error" in result) {
      alert(result.error || "Errore durante l'eliminazione");
    }
    setDeletingTransactionId(null);
  };

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
      // Filtro data standard
      if (period !== "custom" && cutoff && new Date(tx.transaction_date) < cutoff) return false;

      // Filtro data personalizzato
      if (period === "custom") {
        if (customFrom && tx.transaction_date < customFrom) return false;
        if (customTo && tx.transaction_date > customTo) return false;
      }

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
  }, [transactions, search, period, typeFilter, selectedCategories, customFrom, customTo]);

  // Calcola KPI riassuntivi
  const kpis = useMemo(() => {
    const allExpenses = filtered.filter((t) => t.type === "expense");
    const spendingExpenses = allExpenses.filter((t) => !isInvestment(t.category));
    const investmentExpenses = allExpenses.filter((t) => isInvestment(t.category));
    const incomes = filtered.filter((t) => t.type === "income");
    const totalExpense = spendingExpenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
    const capitalInvested = investmentExpenses.reduce((s, t) => s + Number(t.amount), 0);
    const capitalInvestedCount = investmentExpenses.length;

    const categoryCount: Record<string, number> = {};
    for (const t of spendingExpenses) {
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
      capitalInvested,
      capitalInvestedCount,
      netValue: totalIncome - totalExpense,
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
    setCustomFrom("");
    setCustomTo("");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all" ||
    selectedCategories.size > 0 ||
    customFrom !== "" ||
    customTo !== "";

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="activity" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Attività" showBack />

          {/* HEADER */}
          <header className="mb-6 mt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <ListOrdered
                    className="h-5 w-5 text-iri-pale"
                    strokeWidth={1.6}
                  />
                  <h1 className="m-0 font-serif text-[36px] font-normal italic leading-tight text-ink-primary md:text-[40px]">
                    La tua storia finanziaria
                  </h1>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <p className="max-w-[560px] text-[14px] leading-[1.6] text-ink-secondary">
                    Ogni transazione che hai registrato, in un&apos;unica vista. Filtra,
                    cerca, comprendi.
                  </p>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono-tabular text-[11px] font-medium ${
                      (profile.plan || "free") === "free" && monthlyCount > 12
                        ? "border-red-400/30 bg-red-500/[0.08] text-red-300"
                        : (profile.plan || "free") === "free" && monthlyCount > 10
                        ? "border-amber-400/30 bg-amber-500/[0.08] text-amber-300"
                        : "border-emerald-400/30 bg-emerald-500/[0.08] text-emerald-300"
                    }`}
                  >
                    {monthlyCount} transazioni questo mese
                  </span>
                </div>
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  title={
                    (profile.plan || "free") === "free"
                      ? "Disponibile dal piano Premium"
                      : "Esporta CSV"
                  }
                  className="flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[12px] font-medium text-ink-secondary transition-all hover:border-iri-violet/30 hover:bg-iri-violet/[0.06] hover:text-ink-primary disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {isExporting ? "Esportando…" : "Esporta CSV"}
                  {(profile.plan || "free") === "free" && (
                    <span className="rounded-md border border-iri-violet/25 bg-iri-violet/[0.1] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.08em] text-iri-pale">
                      Premium
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* KPI COMPATTI SOPRA I FILTRI */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel rounded-[12px] px-4 py-3">
              <p className="eyebrow text-[9px]">Spese</p>
              <p className="m-0 mt-1 font-mono-tabular font-medium">
                <span className="text-[20px] text-red-200 [letter-spacing:-0.02em]">
                  {splitCurrency(kpis.totalExpense).int}
                </span>
                <span className="text-[12px] text-red-200/60">
                  ,{splitCurrency(kpis.totalExpense).dec}
                </span>
                <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
              </p>
            </div>
            <div className="glass-panel rounded-[12px] px-4 py-3">
              <p className="eyebrow text-[9px]">Entrate</p>
              <p className="m-0 mt-1 font-mono-tabular font-medium">
                <span className="text-[20px] text-emerald-200 [letter-spacing:-0.02em]">
                  {splitCurrency(kpis.totalIncome).int}
                </span>
                <span className="text-[12px] text-emerald-200/60">
                  ,{splitCurrency(kpis.totalIncome).dec}
                </span>
                <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
              </p>
            </div>
            <div className="glass-panel rounded-[12px] px-4 py-3">
              <p className="eyebrow text-[9px]">Transazioni</p>
              <p className="m-0 mt-1 font-mono-tabular text-[20px] font-medium text-ink-primary [letter-spacing:-0.02em]">
                {kpis.count}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <CategoryDonut filtered={filtered} />
          </div>

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

              <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap">
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
              {period === "custom" && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <label className="eyebrow shrink-0 text-[9px]">Da</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <label className="eyebrow shrink-0 text-[9px]">A</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
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

          {/* PIANO FREE — BANNER LIMITE */}
          {(profile.plan || "free") === "free" && monthlyCount >= 10 && (
            <div
              className={`mb-5 flex items-center justify-between gap-3 rounded-[14px] border px-4 py-3 ${
                monthlyCount >= 12
                  ? "border-red-400/30 bg-red-500/[0.06]"
                  : "border-amber-400/30 bg-amber-500/[0.06]"
              }`}
            >
              <p className={`text-[13px] ${monthlyCount >= 12 ? "text-red-300" : "text-amber-300"}`}>
                Sei a{" "}
                <span className="font-mono-tabular font-medium">
                  {monthlyCount}/15
                </span>{" "}
                transazioni del piano gratuito.{" "}
                {monthlyCount >= 12
                  ? "Stai per raggiungere il limite mensile."
                  : "Passa a Premium per transazioni illimitate."}
              </p>
              <Link
                href="/pricing"
                className="shrink-0 rounded-full border border-iri-violet/40 bg-iri-violet/[0.1] px-3 py-1.5 text-[11px] font-medium text-iri-pale transition-all hover:border-iri-violet/60 hover:bg-iri-violet/[0.18]"
              >
                Upgrade
              </Link>
            </div>
          )}

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
              label="Capitale investito"
              value={splitCurrency(kpis.capitalInvested).int}
              decimal={splitCurrency(kpis.capitalInvested).dec}
              suffix="€"
              tone="invested"
              subLabel={
                kpis.capitalInvestedCount === 0
                  ? "nessuna operazione"
                  : kpis.capitalInvestedCount === 1
                  ? "1 operazione"
                  : `${kpis.capitalInvestedCount} operazioni`
              }
            />
          </div>

          {/* LISTA */}
          {hydrating ? (
            <div className="glass-panel overflow-hidden rounded-[18px]">
              {Array.from({ length: 5 }, (_, i) => (
                <SkeletonTransactionRow key={i} isLast={i === 4} />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            hasActiveFilters ? (
              <EmptyActivityFiltered onReset={clearFilters} />
            ) : (
              <EmptyActivity />
            )
          ) : (
            <div className="flex flex-col gap-5 pb-[96px] md:pb-0">
              {grouped.map(([date, txs]) => (
                <DayGroup
                  key={date}
                  date={date}
                  transactions={txs}
                  stats={stats}
                  onEdit={setEditingTransaction}
                  onDelete={(id) => setDeletingTransactionId(id)}
                />
              ))}
            </div>
          )}
       </div>
      </div>

      <NewTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        editingTransaction={editingTransaction}
        customCategories={customCategories}
      />

      <ConfirmDialog
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={() => deletingTransactionId && handleDelete(deletingTransactionId)}
        title="Elimina transazione?"
        description="Questa azione non può essere annullata. La transazione verrà rimossa definitivamente."
      />

      <FabButton />
      <BottomBar activeRoute="activity" />
    </div>
  );
}

function CategoryDonut({ filtered }: { filtered: Transaction[] }) {
  const expenses = filtered.filter(
    (t) => t.type === "expense" && !isInvestment(t.category)
  );

  const catMap: Record<string, number> = {};
  for (const t of expenses) {
    const c = t.category || "Altro";
    catMap[c] = (catMap[c] || 0) + Number(t.amount);
  }

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  if (sorted.length < 2) return null;

  const total = sorted.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return null;

  const top5 = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const restTotal = rest.reduce((s, [, v]) => s + v, 0);

  const segments = [
    ...top5.map(([name, amount]) => ({ name, amount, pct: amount / total })),
    ...(restTotal > 0
      ? [{ name: "Altro", amount: restTotal, pct: restTotal / total }]
      : []),
  ];

  const cx = 80;
  const cy = 80;
  const outerR = 68;
  const innerR = 46;
  const GAP_DEG = 2;

  let currentDeg = 0;
  const arcs = segments.map((seg) => {
    const start = currentDeg;
    const sweep = seg.pct * 360 - GAP_DEG;
    currentDeg += seg.pct * 360;
    return { ...seg, start, end: start + Math.max(sweep, 0.1) };
  });

  const { int, dec } = splitCurrency(total);

  return (
    <div className="glass-panel mb-4 rounded-[16px] px-5 py-4">
      <p className="eyebrow mb-3 text-[9px]">Distribuzione spese</p>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
        {/* Donut SVG */}
        <div className="w-[120px] shrink-0 md:w-[160px]">
          <svg viewBox="0 0 160 160" className="w-full overflow-visible">
            {arcs.map((arc) => (
              <path
                key={arc.name}
                d={donutArc(cx, cy, outerR, innerR, arc.start, arc.end)}
                fill={CAT_COLORS[arc.name] ?? "#9CA3AF"}
              />
            ))}
            {/* Center label */}
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              style={{
                fontSize: 18,
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic",
                fill: "var(--color-ink-primary)",
              }}
            >
              {int}
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              style={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
            >
              ,{dec}€
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-1.5">
          {segments.map((seg) => (
            <div key={seg.name} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: CAT_COLORS[seg.name] ?? "#9CA3AF" }}
                />
                <span className="truncate text-[11px] text-ink-secondary">
                  {seg.name}
                </span>
              </div>
              <span className="shrink-0 font-mono-tabular text-[11px] text-ink-primary">
                {Math.round(seg.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
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
  subLabel,
}: {
  label: string;
  value: string;
  decimal?: string;
  suffix: string;
  tone?: "expense" | "income" | "invested";
  isText?: boolean;
  subLabel?: string;
}) {
  const color =
    tone === "expense"
      ? "text-red-200"
      : tone === "income"
      ? "text-emerald-200"
      : tone === "invested"
      ? "text-emerald-300"
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
      {subLabel && (
        <p className="m-0 mt-1 text-[10px] text-ink-secondary">{subLabel}</p>
      )}
    </div>
  );
}

function DayGroup({
  date,
  transactions,
  stats,
  onEdit,
  onDelete,
}: {
  date: string;
  transactions: Transaction[];
  stats: DashboardStats;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const dayTotal = transactions.reduce(
    (s, t) => s + (t.type === "expense" ? -Number(t.amount) : Number(t.amount)),
    0
  );
  const { int, dec } = splitCurrency(Math.abs(dayTotal));

  return (
    <div>
      <div
        className="mb-2 flex items-center justify-between"
        style={{
          background: "rgba(168,139,250,0.04)",
          borderBottom: "1px solid rgba(168,139,250,0.08)",
          padding: "8px 20px",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <p
          className="m-0 font-serif text-[14px] italic"
          style={{ color: "#A88BFA" }}
        >
          {formatDayHeader(date)}
        </p>
        <p
          className="m-0 font-mono-tabular text-[13px] font-medium"
          style={{ color: dayTotal >= 0 ? "#86EFAC" : "#FCA5A5" }}
        >
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
            onEdit={() => onEdit(tx)}
            onDelete={() => onDelete(tx.id)}
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
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  stats: DashboardStats;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const amount = Number(tx.amount);
  const timeLabel = amountToTimeLabel(amount, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);
  const { int, dec } = splitCurrency(amount);
  const { Icon, color } = categoryMeta(tx.category, tx.type);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setSwipeOffset(0);
      }
    };
    document.addEventListener("touchstart", handler, { passive: true });
    return () => document.removeEventListener("touchstart", handler);
  }, []);

  function resetSwipe() {
    setSwipeOffset(0);
  }

  return (
    <div
      ref={rowRef}
      className={`group relative overflow-hidden ${!isLast ? "border-b border-white/[0.04]" : ""}`}
      onTouchStart={isTouchDevice ? (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isHorizontalSwipe.current = null;
      } : undefined}
      onTouchMove={isTouchDevice ? (e) => {
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - touchStartY.current;
        if (isHorizontalSwipe.current === null) {
          if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
          isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
        if (!isHorizontalSwipe.current) return;
        if (deltaX < -10) {
          e.preventDefault();
          setSwipeOffset(Math.max(deltaX, -88));
        }
      } : undefined}
      onTouchEnd={isTouchDevice ? () => {
        isHorizontalSwipe.current = null;
        if (swipeOffset < -44) {
          setSwipeOffset(-88);
        } else {
          setSwipeOffset(0);
        }
      } : undefined}
    >
      {/* Layer bottoni — fisso a destra, nascosto dal layer contenuto quando offset=0 */}
      {isTouchDevice && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 88, display: "flex" }}>
          <button
            type="button"
            onClick={() => { onEdit(); resetSwipe(); }}
            style={{ width: 44, height: "100%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            <Pencil style={{ width: 16, height: 16, color: "white" }} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); resetSwipe(); }}
            style={{ width: 44, height: "100%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            <Trash2 style={{ width: 16, height: 16, color: "white" }} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Layer contenuto — copre i bottoni, scorre a sinistra con lo swipe */}
      <div
        style={isTouchDevice ? {
          transform: `translateX(${swipeOffset}px)`,
          transition: "transform 0.2s ease-out",
          position: "relative",
          zIndex: 1,
          width: "100%",
          background: "var(--color-surface-1)",
        } : undefined}
        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
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

        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-all duration-[200ms] group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Modifica"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-ink-faint transition-all duration-[200ms] hover:border-iri-violet/30 hover:bg-iri-violet/[0.08] hover:text-iri-pale"
          >
            <Pencil className="h-3 w-3" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Elimina"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-ink-faint transition-all duration-[200ms] hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.8} />
          </button>
        </div>
      </div>
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
    Investimenti: { Icon: TrendingUp, color: "#10B981" },
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