"use client";

import { useState, useTransition } from "react";
import { TrendingDown, TrendingUp, Repeat } from "lucide-react";
import {
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Repeat2,
  Gamepad2,
  HeartPulse,
  Home as HomeIcon,
  ShoppingBag,    
  MoreHorizontal,
} from "lucide-react";
import { Modal } from "./modal";
import { createTransaction } from "@/app/actions/transactions";

const CATEGORIES = [
  { value: "Alimentari", icon: ShoppingCart },
  { value: "Ristorazione", icon: UtensilsCrossed },
  { value: "Trasporti", icon: Car },
  { value: "Abbonamento", icon: Repeat2 },
  { value: "Svago", icon: Gamepad2 },
  { value: "Salute", icon: HeartPulse },
  { value: "Casa", icon: HomeIcon },
  { value: "Shopping", icon: ShoppingBag },
  { value: "Investimenti", icon: TrendingUp },
  { value: "Altro", icon: MoreHorizontal },
];

export function NewTransactionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>("Alimentari");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setMerchant("");
    setAmount(0);
    setCategory("Alimentari");
    setRecurring(false);
    setDate(new Date().toISOString().split("T")[0]);
    setError(null);
    setType("expense");
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createTransaction({
        merchant,
        amount,
        category: type === "expense" ? category : null,
        type,
        transactionDate: date,
        recurring,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      onClose();
    });
  }

  const canSubmit = merchant.trim().length > 0 && amount > 0;

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Nuova transazione"
      subtitle="Ogni movimento che registri nutre il tuo Coach"
    >
      <div className="flex flex-col gap-4">
        {/* Selettore entrata/uscita */}
        <div className="grid grid-cols-2 gap-2">
          <TypeToggle
            active={type === "expense"}
            onClick={() => setType("expense")}
            icon={<TrendingDown className="h-3.5 w-3.5" strokeWidth={1.8} />}
            label="Spesa"
            color="red"
          />
          <TypeToggle
            active={type === "income"}
            onClick={() => setType("income")}
            icon={<TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />}
            label="Entrata"
            color="green"
          />
        </div>

        {/* Merchant + Importo */}
        <div className="flex gap-2">
          <div className="flex-1">
            <FieldLabel>Nome</FieldLabel>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={type === "expense" ? "Esselunga" : "Stipendio"}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
            />
          </div>
          <div className="w-[130px]">
            <FieldLabel>Importo</FieldLabel>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-8 font-mono-tabular text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
                €
              </span>
            </div>
          </div>
        </div>

        {/* Categoria (solo per spese) */}
        {type === "expense" && (
          <div>
            <FieldLabel>Categoria</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
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
        )}

        {/* Data */}
        <div>
          <FieldLabel>Data</FieldLabel>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none [color-scheme:dark]"
          />
        </div>

        {/* Ricorrente */}
        <button
          type="button"
          onClick={() => setRecurring(!recurring)}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
            recurring
              ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.1] to-iri-magenta/[0.05]"
              : "border-white/[0.08] bg-white/[0.02] hover:border-iri-violet/25"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Repeat
              className={`h-3.5 w-3.5 ${
                recurring ? "text-iri-violet" : "text-ink-secondary"
              }`}
              strokeWidth={1.8}
            />
            <div className="text-left">
              <p className="m-0 text-[12px] font-medium text-ink-primary">
                Ricorrente
              </p>
              <p className="m-0 text-[10px] text-ink-secondary">
                Marca come abbonamento o pagamento fisso
              </p>
            </div>
          </div>
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${
              recurring ? "bg-iri-violet" : "bg-white/[0.12]"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${
                recurring ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {/* Errore */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
          className="relative mt-1 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? "Salvataggio…" : "Salva transazione"}
        </button>
      </div>
    </Modal>
  );
}

function TypeToggle({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "red" | "green";
}) {
  const activeColors =
    color === "red"
      ? "border-red-500/40 bg-red-500/[0.08] text-red-300"
      : "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] transition-colors ${
        active
          ? activeColors
          : "border-white/[0.08] bg-white/[0.02] text-ink-secondary hover:border-white/[0.16]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
      {children}
    </p>
  );
}