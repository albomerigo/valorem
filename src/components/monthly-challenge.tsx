"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Target, X, Trophy } from "lucide-react";
import type { Transaction } from "@/lib/finance";

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

type Challenge = {
  category: string;
  limit: number;
};

function getCurrentKey() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `valorem_challenge_${now.getFullYear()}-${mm}`;
}

function loadChallenge(): Challenge | null {
  try {
    const raw = localStorage.getItem(getCurrentKey());
    return raw ? (JSON.parse(raw) as Challenge) : null;
  } catch {
    return null;
  }
}

function saveChallenge(ch: Challenge) {
  localStorage.setItem(getCurrentKey(), JSON.stringify(ch));
}

function removeChallenge() {
  localStorage.removeItem(getCurrentKey());
}

export function MonthlyChallengeCard({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState<number>(0);

  useEffect(() => {
    setChallenge(loadChallenge());
    setMounted(true);
  }, []);

  // Calcola spese del mese corrente per la categoria della sfida
  const spent = useMemo(() => {
    if (!challenge) return 0;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          (t.category || "Altro") === challenge.category &&
          t.transaction_date >= firstDay
      )
      .reduce((s, t) => s + Number(t.amount), 0);
  }, [challenge, transactions]);

  if (!mounted) return null;

  const pct = challenge ? Math.min((spent / challenge.limit) * 100, 100) : 0;
  const barColor =
    pct >= 90
      ? "#FCA5A5" // red
      : pct >= 70
        ? "#FCD34D" // yellow
        : "#86EFAC"; // green

  const coachMsg =
    pct >= 100
      ? "Hai superato il limite! Rifletti prima di spendere ancora in questa categoria."
      : pct >= 90
        ? "Attenzione — sei quasi al limite. Ogni euro conta."
        : pct >= 70
          ? "Sei a buon punto, ma rallenta un po' sulla categoria."
          : "Ottimo controllo! Continua così fino a fine mese.";

  function handleSet() {
    if (limit <= 0) return;
    const ch = { category, limit };
    saveChallenge(ch);
    setChallenge(ch);
  }

  function handleRemove() {
    removeChallenge();
    setChallenge(null);
    setLimit(0);
    setCategory(CATEGORIES[0]);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-6 animate-slide-up [animation-delay:0.15s]"
      style={{
        background:
          "linear-gradient(135deg, rgba(168,139,250,0.07) 0%, rgba(232,121,249,0.04) 100%)",
        border: "1px solid rgba(168,139,250,0.25)",
        animationFillMode: "both",
        boxShadow:
          "0 0 0 1px rgba(168,139,250,0.12), 0 8px 32px -8px rgba(168,139,250,0.18)",
      }}
    >
      {/* Animated border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(168,139,250,0.1), transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.1]">
              <Target className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />
            </div>
            <p className="m-0 text-[13px] font-medium text-ink-primary">
              Sfida del mese 🎯
            </p>
          </div>
          {challenge && (
            <button
              type="button"
              onClick={handleRemove}
              title="Rimuovi sfida"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>

        {challenge ? (
          /* Sfida attiva */
          <div>
            <p className="eyebrow mb-3">
              {challenge.category} · limite {challenge.limit}€
            </p>

            {/* Progress bar */}
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-ink-secondary">
                Hai speso{" "}
                <span
                  className="font-mono-tabular font-medium"
                  style={{ color: barColor }}
                >
                  {Math.round(spent)}€
                </span>{" "}
                di{" "}
                <span className="font-mono-tabular text-ink-primary">
                  {challenge.limit}€
                </span>
              </span>
              <span
                className="font-mono-tabular font-medium"
                style={{ color: barColor }}
              >
                {Math.round(pct)}%
              </span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>

            {pct >= 100 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-400/25 bg-red-500/[0.06] px-3 py-2">
                <Trophy className="h-3.5 w-3.5 text-red-300" strokeWidth={1.8} />
                <span className="text-[12px] text-red-300">
                  Limite superato
                </span>
              </div>
            )}

            <p className="m-0 font-serif text-[13px] italic leading-[1.6] text-ink-secondary">
              {coachMsg}
            </p>
          </div>
        ) : (
          /* Imposta sfida */
          <div>
            <p className="mb-4 text-[13px] text-ink-secondary">
              Sfida te stesso: imposta un tetto di spesa per una categoria
              questo mese.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="eyebrow mb-1.5 text-[9px]">Categoria</p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-ink-primary transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none [color-scheme:dark]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="eyebrow mb-1.5 text-[9px]">Limite (€)</p>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={limit || ""}
                    onChange={(e) => setLimit(Number(e.target.value) || 0)}
                    placeholder="100"
                    className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-8 font-mono-tabular text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-muted">
                    €
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={limit <= 0}
                onClick={handleSet}
                className="rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_-6px_rgba(168,139,250,0.5)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Imposta sfida
              </button>
              <p className="text-center text-[10px] text-ink-muted">
                La sfida si azzera automaticamente il mese prossimo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
