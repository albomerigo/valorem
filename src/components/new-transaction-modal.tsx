"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { createTransaction, updateTransaction } from "@/app/actions";
import { Transaction } from "@/lib/finance";
import {
  Home as HomeIcon,
  ShoppingCart,
  Utensils,
  Gamepad2,
  HeartPulse,
  ShoppingBag,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

const CATEGORIES = [
  { value: "Alimentari", icon: ShoppingCart },
  { value: "Ristorazione", icon: Utensils },
  { value: "Svago", icon: Gamepad2 },
  { value: "Salute", icon: HeartPulse },
  { value: "Casa", icon: HomeIcon },
  { value: "Shopping", icon: ShoppingBag },
  { value: "Investimenti", icon: TrendingUp },
  { value: "Altro", icon: MoreHorizontal },
];

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  editingTransaction,
}: NewTransactionModalProps) {
  const isEditing = !!editingTransaction;
  const router = useRouter();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Alimentari");
  const [date, setDate] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Precompila i campi se in modalità editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(Math.abs(Number(editingTransaction.amount)).toString());
      setMerchant(editingTransaction.merchant || "");
      setCategory(editingTransaction.category || "Alimentari");
      setDate(editingTransaction.transaction_date || "");
      setRecurring(editingTransaction.recurring || false);
      setNotes(editingTransaction.notes || "");
    } else {
      // Reset per nuova transazione
      setType("expense");
      setAmount("");
      setMerchant("");
      setCategory("Alimentari");
      setDate(new Date().toISOString().split("T")[0]);
      setRecurring(false);
      setNotes("");
    }
  }, [editingTransaction, isOpen]);

  // Reset al primo caricamento se non in editing
  useEffect(() => {
    if (isOpen && !isEditing) {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("merchant", merchant);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("transaction_date", date);
    formData.append("recurring", recurring.toString());
    formData.append("notes", notes);

    try {
      let result;
      if (isEditing && editingTransaction) {
        result = await updateTransaction(editingTransaction.id, formData);
      } else {
        result = await createTransaction(formData);
      }

      if (result.success) {
        onClose();
        router.refresh();
        // Reset form
        setAmount("");
        setMerchant("");
        setCategory("Alimentari");
        setDate(new Date().toISOString().split("T")[0]);
        setRecurring(false);
        setNotes("");
        setLimitReached(false);
      } else if (result.error === "LIMIT_REACHED") {
        setLimitReached(true);
      } else {
        alert(result.error || "Errore durante il salvataggio");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore durante il salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="glass-panel-strong relative w-full max-w-md rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl italic text-ink-primary">
            {isEditing ? "Modifica Transazione" : "Nuova Transazione"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-white/5 hover:text-ink-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  type === "expense"
                    ? "border-red-400/50 bg-red-500/10 text-red-300"
                    : "border-white/[0.08] text-ink-secondary hover:border-white/20"
                }`}
              >
                Uscita
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  type === "income"
                    ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                    : "border-white/[0.08] text-ink-secondary hover:border-white/20"
                }`}
              >
                Entrata
              </button>
            </div>
          </div>

          {/* Importo */}
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary"
            >
              Importo
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-ink-primary placeholder-ink-muted/50 transition-colors focus:border-iri-violet/50 focus:outline-none focus:ring-2 focus:ring-iri-violet/20"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                €
              </span>
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label
              htmlFor="merchant"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary"
            >
              Descrizione
            </label>
            <input
              id="merchant"
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-ink-primary placeholder-ink-muted/50 transition-colors focus:border-iri-violet/50 focus:outline-none focus:ring-2 focus:ring-iri-violet/20"
              placeholder="Es. Spesa supermercato"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary">
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-all ${
                      category === cat.value
                        ? "border-iri-violet bg-iri-violet/10 text-iri-pale"
                        : "border-white/[0.08] text-ink-secondary hover:border-iri-violet/30"
                    }`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={1.7} />
                    {cat.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data */}
          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary"
            >
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-ink-primary transition-colors focus:border-iri-violet/50 focus:outline-none focus:ring-2 focus:ring-iri-violet/20"
            />
          </div>

          {/* Ricorrente */}
          <div className="flex items-center gap-3">
            <input
              id="recurring"
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.08] bg-white/[0.03] text-iri-violet focus:ring-2 focus:ring-iri-violet/20"
            />
            <label
              htmlFor="recurring"
              className="text-sm text-ink-secondary hover:cursor-pointer"
            >
              Transazione ricorrente
            </label>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-secondary"
            >
              Note (opzionale)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted/50 transition-colors focus:border-iri-violet/50 focus:outline-none focus:ring-2 focus:ring-iri-violet/20"
              placeholder="Aggiungi dettagli..."
            />
          </div>

          {/* Limit reached banner */}
          {limitReached && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] p-4">
              <p className="mb-3 text-[13px] text-amber-200">
                Hai raggiunto il limite di 50 transazioni del piano gratuito.
              </p>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Passa a Premium
              </Link>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || limitReached}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Salvataggio..."
            ) : (
              <>
                {isEditing ? (
                  "Salva Modifiche"
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Aggiungi
                  </>
                )}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}