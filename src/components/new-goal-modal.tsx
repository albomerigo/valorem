"use client";

import { useState, useTransition } from "react";
import { Modal } from "./modal";
import { createGoal } from "@/app/actions/goals";

const EMOJI_OPTIONS = [
  { emoji: "✈️", label: "Viaggio" },
  { emoji: "🏠", label: "Casa" },
  { emoji: "🚗", label: "Auto" },
  { emoji: "💍", label: "Anello" },
  { emoji: "💻", label: "Tech" },
  { emoji: "🎓", label: "Studi" },
  { emoji: "💰", label: "Fondo" },
  { emoji: "🎯", label: "Altro" },
];

export function NewGoalModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [emoji, setEmoji] = useState("✈️");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setTitle("");
    setTargetAmount(0);
    setEmoji("✈️");
    setDeadline("");
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createGoal({
        title,
        targetAmount,
        emoji,
        deadline: deadline || null,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      onClose();
      onSuccess?.();
    });
  }

  const canSubmit = title.trim().length > 0 && targetAmount > 0;

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Nuovo obiettivo"
      subtitle="Dai un nome al tuo desiderio e Valorem calcola il viaggio"
    >
      <div className="flex flex-col gap-4">
        {/* Emoji picker */}
        <div>
          <FieldLabel>Simbolo</FieldLabel>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJI_OPTIONS.map((opt) => (
              <button
                key={opt.emoji}
                type="button"
                onClick={() => setEmoji(opt.emoji)}
                title={opt.label}
                className={`flex aspect-square items-center justify-center rounded-lg border text-[20px] transition-all duration-[200ms] ${
                  emoji === opt.emoji
                    ? "border-iri-violet/50 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.08] scale-105"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-iri-violet/25 hover:bg-white/[0.04]"
                }`}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Titolo */}
        <div>
          <FieldLabel>Come lo chiami</FieldLabel>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Viaggio in Giappone"
            className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
          />
        </div>

        {/* Importo */}
        <div>
          <FieldLabel>Quanto costa</FieldLabel>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetAmount || ""}
              onChange={(e) => setTargetAmount(Number(e.target.value) || 0)}
              placeholder="2000"
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-8 font-mono-tabular text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
              €
            </span>
          </div>
        </div>

        {/* Deadline opzionale */}
        <div>
          <FieldLabel>Entro quando (opzionale)</FieldLabel>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none [color-scheme:dark]"
          />
          <p className="mt-1.5 text-[11px] text-ink-secondary">
            Se imposti una scadenza, Valorem ti dirà quanto risparmiare al mese
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
          className="mt-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? "Creazione…" : "Crea obiettivo"}
        </button>
      </div>
    </Modal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
      {children}
    </p>
  );
}