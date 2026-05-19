"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Pencil,
  Trash2,
} from "lucide-react";
import { EmptyTransactionsList } from "./empty-states";
import { SkeletonTransactionRow } from "./skeleton";
import type { Transaction, DashboardStats } from "@/lib/finance";
import { amountToTimeLabel } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";
import { NewTransactionModal } from "./new-transaction-modal";
import { ConfirmDialog } from "./confirm-dialog";
import { deleteTransaction } from "@/app/actions";
export function TransactionsList({
  transactions,
  stats,
  onAddTransaction,
}: {
  transactions: Transaction[];
  stats: DashboardStats;
  onAddTransaction?: () => void;
}) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id);
    if (!result.success) {
      alert(result.error || "Errore durante l'eliminazione");
    } else {
      router.refresh();
    }
    setDeletingTransactionId(null);
  };

  return (
    <>
      <div
        className="animate-slide-up [animation-delay:0.4s]"
        style={{ animationFillMode: "both" }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="eyebrow">Movimenti recenti</p>
          <Link href="/attivita" className="text-[11px] font-medium text-ink-secondary transition-colors hover:text-iri-pale">
            Vedi tutti →
          </Link>
        </div>

        {isLoading ? (
          <div className="glass-panel overflow-hidden rounded-[18px]">
            <SkeletonTransactionRow />
            <SkeletonTransactionRow />
            <SkeletonTransactionRow isLast />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyTransactionsList onAddTransaction={onAddTransaction} />
        ) : (
          <div className="glass-panel overflow-hidden rounded-[18px]">
            {transactions.slice(0, 6).map((tx, i) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                stats={stats}
                isLast={i === Math.min(transactions.length, 6) - 1}
                onEdit={() => setEditingTransaction(tx)}
                onDelete={() => setDeletingTransactionId(tx.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal modifica */}
      <NewTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        editingTransaction={editingTransaction}
      />

      {/* Dialog conferma eliminazione */}
      <ConfirmDialog
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={() => deletingTransactionId && handleDelete(deletingTransactionId)}
        title="Elimina transazione?"
        description="Questa azione non può essere annullata. La transazione verrà rimossa definitivamente."
      />
    </>
  );
}

function TransactionRow({
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
  const { int: eurosInt, dec: eurosDec } = splitCurrency(amount);
  const { Icon, color } = categoryMeta(tx.category, tx.type);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Rileva touch device al mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Reset swipe quando l'utente tocca altrove
  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setSwipeOffset(0);
        setIsSwiped(false);
      }
    };
    document.addEventListener("touchstart", handler, { passive: true });
    return () => document.removeEventListener("touchstart", handler);
  }, []);

  function resetSwipe() {
    setSwipeOffset(0);
    setIsSwiped(false);
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
        // Determina direzione al primo movimento significativo
        if (isHorizontalSwipe.current === null) {
          if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
          isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
        if (!isHorizontalSwipe.current) return; // scroll verticale — ignora
        if (deltaX < -10) {
          e.preventDefault();
          setSwipeOffset(Math.max(deltaX, -88));
        }
      } : undefined}
      onTouchEnd={isTouchDevice ? () => {
        isHorizontalSwipe.current = null;
        if (swipeOffset < -44) {
          setIsSwiped(true);
          setSwipeOffset(-88);
        } else {
          setIsSwiped(false);
          setSwipeOffset(0);
        }
      } : undefined}
    >
      {/* Layer bottoni — fisso a destra, nascosto dal layer contenuto quando offset=0 */}
      {isTouchDevice && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 88,
            display: "flex",
          }}
        >
          <button
            type="button"
            onClick={() => { onEdit(); resetSwipe(); }}
            style={{
              width: 44,
              height: "100%",
              background: "#7C3AED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Pencil style={{ width: 18, height: 18, color: "white" }} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); resetSwipe(); }}
            style={{
              width: 44,
              height: "100%",
              background: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Trash2 style={{ width: 18, height: 18, color: "white" }} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Layer contenuto — copre i bottoni (width 100%, background opaco), scorre a sinistra con lo swipe */}
      <div
        style={isTouchDevice ? {
          transform: `translateX(${swipeOffset}px)`,
          transition: "transform 0.2s ease-out",
          position: "relative",
          zIndex: 1,
          width: "100%",
          background: "var(--color-surface-1)",
        } : undefined}
        className="flex items-center gap-4 px-5 py-4 transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:bg-white/[0.025]"
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

        {/* Pulsanti modifica/elimina (visibili al hover su desktop) */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-all duration-[250ms] group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-iri-violet/10 hover:text-iri-pale"
            title="Modifica"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Elimina"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
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