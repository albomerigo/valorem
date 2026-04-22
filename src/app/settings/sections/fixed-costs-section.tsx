"use client";

import { useState, useTransition } from "react";
import { Home, Plus, Trash2, Check, Pencil, X } from "lucide-react";
import type { FixedCost } from "@/lib/finance";
import {
  addFixedCost,
  updateFixedCost,
  deleteFixedCost,
} from "../actions";
import { SectionCard, FeedbackLine } from "./section-primitives";
import { splitCurrency } from "@/lib/utils";

export function FixedCostsSection({ fixedCosts }: { fixedCosts: FixedCost[] }) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const total = fixedCosts.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalSplit = splitCurrency(total);

  function flashStatus(type: "saved" | "error", msg: string) {
    setStatus(type);
    setMessage(msg);
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <SectionCard
      icon={<Home className="h-4 w-4" strokeWidth={1.8} />}
      title="Costi fissi"
      subtitle="Affitto, bollette, abbonamenti ricorrenti"
    >
      <div className="flex flex-col gap-3">
        {/* Totale */}
        <div className="flex items-center justify-between rounded-[10px] border border-iri-violet/20 bg-iri-violet/[0.06] px-4 py-3">
          <p className="eyebrow m-0">Totale mensile</p>
          <p className="m-0 font-mono-tabular text-[18px] font-medium">
            <span className="text-ink-primary">{totalSplit.int}</span>
            <span className="text-[13px] text-ink-primary/65">,{totalSplit.dec}</span>
            <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
          </p>
        </div>

        {/* Lista costi */}
        <div className="flex flex-col gap-1.5">
          {fixedCosts.length === 0 && (
            <p className="py-3 text-center text-[12px] text-ink-secondary">
              Nessun costo fisso
            </p>
          )}
          {fixedCosts.map((cost) => (
            <CostRow key={cost.id} cost={cost} onFlash={flashStatus} />
          ))}
        </div>

        {/* Aggiungi */}
        <AddCostRow onFlash={flashStatus} />

        <FeedbackLine status={status} message={message} />
      </div>
    </SectionCard>
  );
}

function CostRow({
  cost,
  onFlash,
}: {
  cost: FixedCost;
  onFlash: (type: "saved" | "error", msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cost.name);
  const [amount, setAmount] = useState(Number(cost.amount));
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateFixedCost({ id: cost.id, name, amount });
      if (res?.error) {
        onFlash("error", res.error);
        return;
      }
      onFlash("saved", `${name} aggiornato`);
      setEditing(false);
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteFixedCost(cost.id);
      if (res?.error) onFlash("error", res.error);
      else onFlash("saved", `${cost.name} rimosso`);
    });
  }

  function cancel() {
    setName(cost.name);
    setAmount(Number(cost.amount));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-iri-violet/30 bg-white/[0.02] px-3 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-ink-primary focus:outline-none"
          autoFocus
        />
        <div className="relative w-[100px]">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-transparent pr-5 text-right font-mono-tabular text-[13px] text-ink-primary focus:outline-none"
          />
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-ink-muted">
            €
          </span>
        </div>
        <div className="flex gap-1">
          <IconButton onClick={save} disabled={isPending} variant="confirm">
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </IconButton>
          <IconButton onClick={cancel} variant="neutral">
            <X className="h-3 w-3" strokeWidth={2.5} />
          </IconButton>
        </div>
      </div>
    );
  }

  const amountSplit = splitCurrency(Number(cost.amount));

  return (
    <div className="group flex items-center gap-2 rounded-[10px] border border-white/[0.04] bg-white/[0.01] px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
      <span className="flex-1 text-[13px] text-ink-primary">{cost.name}</span>
      <span className="font-mono-tabular text-[13px] text-ink-primary">
        {amountSplit.int}
        <span className="text-[11px] text-ink-primary/65">,{amountSplit.dec}</span>
        <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
      </span>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton onClick={() => setEditing(true)} variant="neutral">
          <Pencil className="h-3 w-3" strokeWidth={2} />
        </IconButton>
        <IconButton onClick={remove} disabled={isPending} variant="danger">
          <Trash2 className="h-3 w-3" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );
}

function AddCostRow({
  onFlash,
}: {
  onFlash: (type: "saved" | "error", msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim() || amount <= 0) return;
    startTransition(async () => {
      const res = await addFixedCost({ name, amount });
      if (res?.error) {
        onFlash("error", res.error);
        return;
      }
      onFlash("saved", `${name} aggiunto`);
      setName("");
      setAmount(0);
    });
  }

  const canAdd = name.trim().length > 0 && amount > 0;

  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-dashed border-white/[0.1] px-3 py-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome (es. Netflix)"
        className="flex-1 bg-transparent text-[13px] text-ink-primary placeholder:text-ink-muted focus:outline-none"
      />
      <div className="relative w-[100px]">
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          placeholder="0"
          className="w-full bg-transparent pr-5 text-right font-mono-tabular text-[13px] text-ink-primary placeholder:text-ink-muted focus:outline-none"
        />
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-ink-muted">
          €
        </span>
      </div>
      <IconButton onClick={handleAdd} disabled={!canAdd || isPending} variant="confirm">
        <Plus className="h-3 w-3" strokeWidth={2.5} />
      </IconButton>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  variant = "neutral",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "neutral" | "confirm" | "danger";
}) {
  const base =
    "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-[200ms] disabled:opacity-40";
  const variants = {
    neutral: "border-white/[0.08] text-ink-secondary hover:border-white/[0.16] hover:text-ink-primary",
    confirm:
      "border-iri-violet/40 bg-iri-violet/[0.1] text-iri-pale hover:bg-iri-violet/[0.2]",
    danger:
      "border-red-500/25 text-red-300/80 hover:border-red-500/50 hover:bg-red-500/[0.1] hover:text-red-300",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}