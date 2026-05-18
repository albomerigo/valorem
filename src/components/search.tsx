"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import type { Transaction, Goal } from "@/lib/finance";

interface SearchProps {
  transactions: Transaction[];
  goals: Goal[];
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

function splitAmount(amount: number) {
  const abs = Math.abs(amount);
  const [intPart, decPart = "00"] = abs.toFixed(2).split(".");
  return { int: intPart, dec: decPart };
}

export function Search({ transactions, goals }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.toLowerCase().trim();

  const filteredTransactions = q
    ? transactions
        .filter(
          (tx) =>
            tx.merchant?.toLowerCase().includes(q) ||
            tx.category?.toLowerCase().includes(q) ||
            tx.notes?.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : transactions.slice(0, 5);

  const filteredGoals = q
    ? goals.filter((g) => g.title?.toLowerCase().includes(q)).slice(0, 5)
    : goals.slice(0, 5);

  const totalResults = filteredTransactions.length + filteredGoals.length;

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  // ⌘K / Ctrl+K + Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) closeSearch();
        else openSearch();
      }
      if (e.key === "Escape" && open) closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, openSearch, closeSearch]);

  // Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalResults - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < filteredTransactions.length) {
        router.push(`/attivita?search=${encodeURIComponent(query)}`);
      } else {
        router.push("/obiettivi");
      }
      closeSearch();
    }
  };

  const hasQuery = query.length > 0;
  const noResults =
    hasQuery &&
    filteredTransactions.length === 0 &&
    filteredGoals.length === 0;

  return (
    <div className="relative hidden md:block">
      {/* Trigger / input bar */}
      <div
        onClick={!open ? openSearch : undefined}
        className={`glass-panel-subtle flex w-[280px] cursor-text items-center gap-2.5 rounded-[12px] px-3.5 py-[9px] text-xs transition-all duration-300 ${
          open
            ? "border-iri-violet/40 text-ink-primary"
            : "text-ink-secondary hover:border-iri-violet/30 hover:text-ink-primary"
        }`}
      >
        <SearchIcon className="h-3.5 w-3.5 flex-shrink-0" />
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cerca movimenti, categorie…"
            className="flex-1 bg-transparent text-xs text-ink-primary outline-none placeholder:text-ink-muted"
          />
        ) : (
          <span className="flex-1 truncate text-ink-secondary">
            Cerca movimenti, categorie…
          </span>
        )}
        {open && query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex-shrink-0 text-ink-muted hover:text-ink-primary"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-[2px] font-mono text-[10px] text-ink-muted">
            ⌘K
          </span>
        )}
      </div>

      {open && (
        <>
          {/* Overlay — blocca click sottostanti */}
          <div className="fixed inset-0 z-40" onClick={closeSearch} />

          {/* Pannello risultati */}
          <div
            className="absolute left-0 top-full z-50 mt-2 w-[400px] overflow-hidden rounded-[16px]"
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid rgba(168,139,250,0.5)",
              boxShadow:
                "0 24px 48px -12px rgba(0,0,0,0.6), 0 8px 16px -4px rgba(168,139,250,0.3)",
              animation: "searchFadeIn 150ms ease-out both",
            }}
          >
            <style>{`
              @keyframes searchFadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {noResults ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[12px] text-ink-secondary">
                  Nessun risultato per{" "}
                  <span className="text-ink-primary">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Sezione Transazioni */}
                {filteredTransactions.length > 0 && (
                  <div>
                    <p
                      className="eyebrow px-4 py-2"
                      style={{ fontSize: 10, color: "rgba(168,139,250,0.6)" }}
                    >
                      Transazioni
                    </p>
                    {filteredTransactions.map((tx, i) => {
                      const isActive = i === activeIndex;
                      const { int, dec } = splitAmount(Number(tx.amount));
                      return (
                        <button
                          key={tx.id}
                          type="button"
                          onClick={() => {
                            router.push(
                              `/attivita?search=${encodeURIComponent(query || tx.merchant)}`
                            );
                            closeSearch();
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive
                              ? "bg-iri-violet/[0.12]"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border border-white/[0.06] bg-white/[0.03] text-[14px]">
                            {categoryEmoji(tx.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-ink-primary">
                              {tx.merchant}
                            </p>
                            <p className="text-[11px] text-ink-secondary">
                              {tx.category || "Altro"} ·{" "}
                              {formatDate(tx.transaction_date)}
                            </p>
                          </div>
                          <p
                            className={`flex-shrink-0 font-mono text-[13px] font-medium ${
                              tx.type === "income"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "−"}
                            {int}
                            <span className="text-[10px] opacity-70">,{dec}</span>
                            <span className="ml-0.5 text-[10px] text-ink-muted">
                              €
                            </span>
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sezione Obiettivi */}
                {filteredGoals.length > 0 && (
                  <div>
                    {filteredTransactions.length > 0 && (
                      <div
                        style={{
                          height: 1,
                          background: "rgba(168,139,250,0.08)",
                          margin: "4px 0",
                        }}
                      />
                    )}
                    <p
                      className="eyebrow px-4 py-2"
                      style={{ fontSize: 10, color: "rgba(168,139,250,0.6)" }}
                    >
                      Obiettivi
                    </p>
                    {filteredGoals.map((g, i) => {
                      const idx = filteredTransactions.length + i;
                      const isActive = idx === activeIndex;
                      const progress = Math.round(
                        (Number(g.current_amount) / Number(g.target_amount)) *
                          100
                      );
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            router.push("/obiettivi");
                            closeSearch();
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive
                              ? "bg-iri-violet/[0.12]"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border border-white/[0.06] bg-white/[0.03] text-[16px]">
                            {g.emoji || "🎯"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-ink-primary">
                              {g.title}
                            </p>
                            <p className="text-[11px] text-ink-secondary">
                              {Number(g.current_amount).toFixed(0)}€ /{" "}
                              {Number(g.target_amount).toFixed(0)}€ · {progress}
                              %
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-iri-violet to-iri-magenta"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!hasQuery && (
                  <div className="border-t border-white/[0.04] px-4 py-2.5">
                    <p className="text-[10px] text-ink-muted">
                      Digita per cercare · frecce per navigare · Invio per aprire
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function categoryEmoji(category: string | null): string {
  const map: Record<string, string> = {
    Alimentari: "🛒",
    Ristorazione: "🍽️",
    Trasporti: "🚗",
    Abbonamento: "🔁",
    Svago: "🎮",
    Salute: "❤️",
    Casa: "🏠",
    Shopping: "🛍️",
    Investimenti: "📈",
  };
  return (category && map[category]) || "•";
}
