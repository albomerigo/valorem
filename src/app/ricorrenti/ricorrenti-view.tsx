"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat2, ArrowRight } from "lucide-react";
import type { UserProfile, Transaction } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { HelpTooltip } from "@/components/help-tooltip";
import { splitCurrency } from "@/lib/utils";

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

/* ──────────────────────────────────────────────
   RECURRING CALENDAR
────────────────────────────────────────────── */
function RecurringCalendar({ recurring }: { recurring: Transaction[] }) {
  const [tooltip, setTooltip] = useState<{ day: number; txs: Transaction[]; x: number; y: number } | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  // Adjust to Mon-based (0=Mon)
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Map day → recurring txs for that day of month
  const dayMap: Record<number, Transaction[]> = {};
  for (const t of recurring) {
    const d = new Date(t.transaction_date);
    const day = d.getDate();
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(t);
  }

  // Build 7xN grid
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - startOffset - daysInMonth).fill(null),
  ];

  const DAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];
  const today = now.getDate();

  return (
    <div
      className="mb-6 rounded-[18px] p-5"
      style={{ background: "rgba(168,139,250,0.04)", border: "1px solid rgba(168,139,250,0.14)" }}
    >
      <p className="eyebrow mb-4 text-[10px] text-iri-pale">
        Calendario del mese ·{" "}
        {now.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
      </p>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[9px] uppercase tracking-widest text-ink-muted py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const hasTx = !!dayMap[day];
          const isToday = day === today;

          return (
            <div
              key={i}
              className="relative flex flex-col items-center py-1 rounded-[8px] cursor-default transition-colors"
              style={{
                background: isToday ? "rgba(168,139,250,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!hasTx) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ day, txs: dayMap[day], x: rect.left, y: rect.bottom + 8 });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <span
                className="text-[11px] leading-tight"
                style={{ color: isToday ? "#C4B5FD" : "rgba(255,255,255,0.5)" }}
              >
                {day}
              </span>
              {hasTx && (
                <span
                  className="mt-0.5 h-1 w-1 rounded-full"
                  style={{ background: "#A88BFA" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: "#A88BFA" }} />
        <span className="text-[10px] text-ink-muted">Pagamento ricorrente</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-[10px] px-3 py-2 text-[12px] shadow-xl"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: "rgba(14,12,28,0.95)",
            border: "1px solid rgba(168,139,250,0.3)",
            backdropFilter: "blur(12px)",
            minWidth: 160,
            pointerEvents: "none",
          }}
        >
          <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A88BFA" }}>
            {tooltip.day} del mese
          </p>
          {tooltip.txs.map((t) => (
            <p key={t.id} className="m-0 text-ink-secondary">
              {t.merchant} — €{Number(t.amount).toFixed(2)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function RicorrentiView({
  profile,
  recurring,
}: {
  profile: UserProfile;
  recurring: Transaction[];
}) {
  // Only expenses for the monthly estimate
  const recurringExpenses = recurring.filter((t) => t.type === "expense");
  const monthlyTotal = recurringExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const { int, dec } = splitCurrency(monthlyTotal);
  const yearlyTotal = monthlyTotal * 12;
  const { int: yInt, dec: yDec } = splitCurrency(yearlyTotal);

  // Group by category
  const byCat: Record<string, Transaction[]> = {};
  for (const t of recurring) {
    const cat = t.category || "Altro";
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(t);
  }
  const groups = Object.entries(byCat).sort((a, b) => {
    const sumA = a[1].reduce((s, t) => s + Number(t.amount), 0);
    const sumB = b[1].reduce((s, t) => s + Number(t.amount), 0);
    return sumB - sumA;
  });

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" userName={profile.name || ""} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Ricorrenti" showBack />

          <header className="relative mt-8 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Repeat2 className="h-5 w-5 text-iri-pale" strokeWidth={1.6} />
              <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
                Spese ricorrenti
              </h1>
            </div>
            <HelpTooltip
              title="Spese Ricorrenti"
              content="Qui trovi tutte le transazioni che hai marcato come ricorrenti. Ti mostrano quanto spendi ogni mese in abbonamenti e spese fisse variabili."
            />
            <p className="text-[14px] leading-[1.6] text-ink-secondary">
              Tutti gli abbonamenti e i pagamenti periodici — quello che esce ogni mese in automatico.
            </p>
          </header>

          {/* KPI cards: monthly + yearly */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Monthly total */}
            <div
              className="rounded-[20px] px-6 py-6"
              style={{
                background: "rgba(168,139,250,0.06)",
                border: "1px solid rgba(168,139,250,0.2)",
              }}
            >
              <p className="eyebrow mb-2">Totale mensile stimato</p>
              <div className="flex items-baseline gap-1 font-mono-tabular">
                <span className="text-[18px] text-ink-secondary">€</span>
                <span className="text-[48px] font-medium leading-none text-ink-primary">
                  {int}
                </span>
                <span className="text-[24px] text-ink-primary/70">,{dec}</span>
              </div>
              <p className="mt-2 text-[12px] text-ink-muted">
                {recurringExpenses.length} spese ricorrenti · solo uscite
              </p>
            </div>

            {/* Yearly total */}
            <div
              className="rounded-[20px] px-6 py-6"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <p className="eyebrow mb-2" style={{ color: "rgba(251,191,36,0.7)" }}>
                Totale annuale stimato
              </p>
              <div className="flex items-baseline gap-1 font-mono-tabular">
                <span className="text-[18px] text-ink-secondary">€</span>
                <span className="text-[48px] font-medium leading-none" style={{ color: "#FCD34D" }}>
                  {yInt}
                </span>
                <span className="text-[24px]" style={{ color: "rgba(252,211,77,0.7)" }}>
                  ,{yDec}
                </span>
              </div>
              <p className="mt-2 text-[12px] text-ink-muted">
                Basato sulle transazioni ricorrenti degli ultimi 3 mesi
              </p>
            </div>
          </div>

          {/* Calendario del mese */}
          {recurring.length > 0 && (
            <RecurringCalendar recurring={recurring} />
          )}

          {/* Groups */}
          {recurring.length === 0 ? (
            <div className="glass-panel rounded-[18px] px-6 py-10 text-center">
              <Repeat2 className="mx-auto mb-3 h-8 w-8 text-ink-muted" strokeWidth={1.4} />
              <p className="text-[14px] text-ink-secondary">
                Nessuna transazione ricorrente trovata.
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                Quando aggiungi una transazione, attiva il flag &quot;Ricorrente&quot; per tracciarla qui.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map(([cat, txs]) => {
                const color = CAT_COLORS[cat] ?? "#9CA3AF";
                const catTotal = txs.reduce((s, t) => s + Number(t.amount), 0);
                const { int: cInt, dec: cDec } = splitCurrency(catTotal);

                return (
                  <div key={cat} className="glass-panel overflow-hidden rounded-[18px]">
                    {/* Category header */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: color }}
                        />
                        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
                          {cat}
                        </span>
                      </div>
                      <span className="font-mono-tabular text-[13px] text-ink-muted">
                        {cInt},{cDec}€
                      </span>
                    </div>

                    {/* Transactions */}
                    {txs.map((t, i) => {
                      const { int: tInt, dec: tDec } = splitCurrency(Number(t.amount));
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center gap-4 px-5 py-3.5 ${
                            i < txs.length - 1 ? "border-b border-white/[0.04]" : ""
                          }`}
                        >
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]"
                            style={{ background: `${color}15`, color }}
                          >
                            <Repeat2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="m-0 text-[13px] font-medium text-ink-primary truncate">
                              {t.merchant}
                            </p>
                            <p className="m-0 text-[11px] text-ink-muted">
                              {t.type === "expense" ? "uscita" : "entrata"} · {t.transaction_date}
                            </p>
                          </div>
                          <span
                            className={`font-mono-tabular text-[14px] font-medium ${
                              t.type === "expense" ? "text-red-300" : "text-emerald-300"
                            }`}
                          >
                            {t.type === "expense" ? "−" : "+"}
                            {tInt},{tDec}€
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA to attivita */}
          <Link
            href="/attivita"
            className="mt-5 flex items-center justify-between gap-3 rounded-[14px] border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-all hover:border-iri-violet/25 hover:bg-white/[0.04]"
          >
            <p className="m-0 text-[13px] text-ink-secondary">
              Vedi tutte le transazioni in Attività
            </p>
            <ArrowRight className="h-4 w-4 text-ink-muted" strokeWidth={1.6} />
          </Link>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
