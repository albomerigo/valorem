"use client";

import {
  ChevronRight,
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
} from "lucide-react";
import { EmptyTransactionsList } from "./empty-states";
import type { Transaction, DashboardStats } from "@/lib/finance";
import { amountToTimeLabel } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";

export function TransactionsList({
  transactions,
  stats,
}: {
  transactions: Transaction[];
  stats: DashboardStats;
}) {
  return (
    <div
      className="animate-slide-up [animation-delay:0.4s]"
      style={{ animationFillMode: "both" }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="eyebrow">Movimenti recenti</p>
        <span className="cursor-pointer text-[11px] font-medium text-ink-secondary transition-colors hover:text-iri-pale">
          Vedi tutti →
        </span>
      </div>

      {transactions.length === 0 ? (
        <EmptyTransactionsList />
      ) : (
        <div className="glass-panel overflow-hidden rounded-[18px]">
          {transactions.slice(0, 6).map((tx, i) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              stats={stats}
              isLast={i === Math.min(transactions.length, 6) - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}



function TransactionRow({
  tx,
  stats,
  isLast,
}: {
  tx: Transaction;
  stats: DashboardStats;
  isLast: boolean;
}) {
  const amount = Number(tx.amount);
  const timeLabel = amountToTimeLabel(amount, stats);
  const { int: eurosInt, dec: eurosDec } = splitCurrency(amount);
  const { Icon, color } = categoryMeta(tx.category, tx.type);

  return (
    <div
      className={`group relative flex cursor-pointer items-center gap-4 px-5 py-4 transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:bg-white/[0.025] ${
        !isLast ? "border-b border-white/[0.04]" : ""
      }`}
    >
      {/* Icona categoria */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03]"
        style={{ color }}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="m-0 text-[14px] font-medium text-ink-primary">
              {tx.merchant}
            </p>
            {tx.recurring && (
              <span className="flex items-center gap-1 rounded-md border border-iri-violet/25 bg-iri-violet/[0.1] px-2 py-px text-[9px] font-medium uppercase tracking-[0.08em] text-iri-pale">
                <Repeat2 className="h-2.5 w-2.5" strokeWidth={2} />
                Ricorrente
              </span>
            )}
          </div>
          <p className="m-0 font-mono-tabular text-[14px] font-medium text-ink-primary [letter-spacing:-0.01em]">
            {tx.type === "expense" ? "−" : "+"}
            {eurosInt}
            <span className="text-[11px] text-ink-primary/65">,{eurosDec}</span>
            <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
          </p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-[11px] text-ink-secondary">
            {tx.category || "Altro"} · {formatRelativeDate(tx.transaction_date)}
          </span>
          <p className="m-0 font-mono-tabular text-[11px] text-ink-muted">
            {timeLabel}
          </p>
        </div>
      </div>

      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint opacity-0 transition-all duration-[250ms] group-hover:translate-x-0.5 group-hover:text-iri-pale group-hover:opacity-100" />
    </div>
  );
}

/**
 * Mappa categoria → icona + colore.
 * Centralizzare qui rende facile aggiungere nuove categorie domani.
 */
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

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return "oggi";
  if (sameDay(date, yesterday)) return "ieri";
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}