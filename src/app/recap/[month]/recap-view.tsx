"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Ghost,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trophy,
  Target,
  ArrowRight,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Repeat2,
  Gamepad2,
  HeartPulse,
  Home as HomeIcon,
  ShoppingBag,
  MoreHorizontal,
  BarChart2,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  AlertCircle,
  Play,
  X as XIcon,
} from "lucide-react";
import type { UserProfile, DashboardStats } from "@/lib/finance";
import type { RecapData } from "@/lib/recap";
import { amountToTimeLabel, getTimeMetricSuffix } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { splitCurrency } from "@/lib/utils";

/* ──────────────────────────────────────────────
   PRESENTATION MODE
────────────────────────────────────────────── */
function PresentationMode({
  recap,
  onClose,
}: {
  recap: RecapData;
  onClose: () => void;
}) {
  const TOTAL_SLIDES = 6;
  const AUTO_INTERVAL = 4000;

  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setFading(true);
      setTimeout(() => {
        setSlide(next);
        setFading(false);
      }, 300);
    },
    []
  );

  const next = useCallback(() => goTo((slide + 1) % TOTAL_SLIDES), [slide, goTo]);
  const prev = useCallback(() => goTo((slide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES), [slide, goTo]);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(t);
  }, [next]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, next, prev]);

  const spentSplit = splitCurrency(recap.totalSpent);
  const topCat = recap.categoryBreakdown[0];

  const CAT_EMOJIS: Record<string, string> = {
    Alimentari: "🛒",
    Ristorazione: "🍽️",
    Trasporti: "🚗",
    Abbonamento: "📱",
    Svago: "🎮",
    Salute: "💪",
    Casa: "🏠",
    Shopping: "🛍️",
    Investimenti: "📈",
    Altro: "📦",
  };

  const slides = [
    /* 0 — Titolo narrativo */
    <div key="s0" className="flex flex-col items-center justify-center h-full text-center px-8">
      <p className="eyebrow-accent mb-6 text-[11px] tracking-[0.2em]">{recap.monthYear}</p>
      <h1
        className="m-0 font-serif italic leading-[1.1]"
        style={{
          fontSize: "clamp(48px, 10vw, 80px)",
          background: "linear-gradient(135deg, #F0EEFF 0%, #C4B5FD 50%, #E879F9 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "zoomIn 600ms ease both",
        }}
      >
        {recap.narrativeTitle}
      </h1>
      <p className="mt-6 text-[16px] text-ink-secondary">Il tuo mese in Valorem</p>
    </div>,

    /* 1 — Il numero principale */
    <div key="s1" className="flex flex-col items-center justify-center h-full text-center px-8">
      <p className="eyebrow mb-4 text-[11px]">Questo mese hai speso</p>
      <p
        className="m-0 font-serif font-normal leading-none"
        style={{
          fontSize: "clamp(72px, 14vw, 112px)",
          color: "#F87171",
          letterSpacing: "-0.04em",
          animation: "zoomIn 600ms ease both",
        }}
      >
        €{spentSplit.int}
        <span style={{ fontSize: "0.4em", opacity: 0.6 }}>,{spentSplit.dec}</span>
      </p>
      {recap.prevMonthData && recap.trendVsPrevMonth !== null && (
        <p className="mt-4 text-[16px] text-ink-secondary">
          {recap.trendVsPrevMonth > 0 ? "+" : ""}{recap.trendVsPrevMonth}% rispetto al mese precedente
        </p>
      )}
    </div>,

    /* 2 — Categoria principale */
    <div key="s2" className="flex flex-col items-center justify-center h-full text-center px-8">
      {topCat ? (
        <>
          <span style={{ fontSize: 64, animation: "zoomIn 600ms ease both" }}>
            {CAT_EMOJIS[topCat.name] ?? "📦"}
          </span>
          <p className="mt-4 text-[14px] uppercase tracking-[0.2em] text-ink-muted">La tua categoria principale è</p>
          <p
            className="m-0 font-serif italic"
            style={{ fontSize: "clamp(36px, 7vw, 56px)", color: "#C4B5FD" }}
          >
            {topCat.name}
          </p>
          <p className="mt-3 text-[20px] text-ink-secondary">
            {topCat.percent}% delle spese totali
          </p>
        </>
      ) : (
        <p className="text-ink-muted">Nessuna categoria</p>
      )}
    </div>,

    /* 3 — Impulsi resistiti */
    <div key="s3" className="flex flex-col items-center justify-center h-full text-center px-8">
      <p
        className="m-0 font-serif font-normal leading-none"
        style={{
          fontSize: "clamp(80px, 16vw, 128px)",
          color: "#10B981",
          letterSpacing: "-0.04em",
          animation: "zoomIn 600ms ease both",
        }}
      >
        {recap.savedImpulsesCount}
      </p>
      <p className="text-[20px] text-ink-secondary">acquisti impulsivi evitati</p>
      {recap.savedFromImpulses > 0 && (
        <p className="mt-2 text-[16px]" style={{ color: "#6EE7B7" }}>
          Hai salvato €{Math.round(recap.savedFromImpulses)}
        </p>
      )}
    </div>,

    /* 4 — Citazione Coach */
    <div key="s4" className="flex flex-col items-center justify-center h-full text-center px-8 md:px-20">
      <Sparkles className="mb-6 h-10 w-10 text-iri-pale" strokeWidth={1.4} />
      {recap.coachQuote ? (
        <>
          <p
            className="m-0 font-serif italic leading-[1.5]"
            style={{
              fontSize: "clamp(20px, 4vw, 32px)",
              color: "#F0EEFF",
              animation: "zoomIn 600ms ease both",
            }}
          >
            “{recap.coachQuote}”
          </p>
          <p className="mt-6 text-[13px] uppercase tracking-[0.2em] text-iri-pale">
            — Valorem Coach
          </p>
        </>
      ) : (
        <p className="font-serif italic text-[22px] text-ink-secondary">Il mese parla da solo.</p>
      )}
    </div>,

    /* 5 — Chiusura */
    <div key="s5" className="flex flex-col items-center justify-center h-full text-center px-8">
      <div
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #A88BFA, #E879F9)",
          boxShadow: "0 0 60px rgba(168,139,250,0.5)",
          animation: "zoomIn 600ms ease both",
        }}
      >
        <Sparkles className="h-10 w-10 text-white" strokeWidth={1.4} />
      </div>
      <p className="m-0 font-serif italic text-[32px] text-ink-primary">Fine del mese.</p>
      <p className="mt-3 text-[15px] text-ink-secondary">Il prossimo è una nuova possibilità.</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex items-center gap-2 rounded-[14px] px-8 py-3.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #A88BFA, #E879F9)", boxShadow: "0 8px 32px -8px rgba(168,139,250,0.7)" }}
      >
        Chiudi presentazione
      </button>
    </div>,
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "#0D0A1E" }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(168,139,250,0.12), transparent 70%)",
        }}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <XIcon className="h-5 w-5 text-ink-muted" strokeWidth={1.8} />
      </button>

      {/* Slide content */}
      <div
        className="flex-1 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {slides[slide]}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pb-8">
        <button
          type="button"
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronLeft className="h-5 w-5 text-ink-muted" strokeWidth={2} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                background: i === slide ? "#A88BFA" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronRight className="h-5 w-5 text-ink-muted" strokeWidth={2} />
        </button>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export function RecapView({
  profile,
  recap,
  stats,
  isCurrentMonth,
}: {
  profile: UserProfile;
  recap: RecapData;
  stats: DashboardStats;
  isCurrentMonth?: boolean;
}) {
  const [presenting, setPresenting] = useState(false);

  return (
    <div className="relative min-h-screen">
      {presenting && (
        <PresentationMode recap={recap} onClose={() => setPresenting(false)} />
      )}
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="dashboard" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-8 md:py-7">
          <Topbar
            userName={profile.name || "ospite"}
            section="Recap mensile"
          />

          {/* BANNER DATI PARZIALI */}
          {isCurrentMonth && (
            <div
              className="mt-4 flex items-center gap-3 rounded-[12px] border border-amber-400/25 bg-amber-500/[0.07] px-4 py-2.5"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" strokeWidth={1.8} />
              <p className="text-[13px] leading-snug text-amber-200/90">
                📊 Stai guardando il mese in corso — i dati sono ancora parziali e cambieranno fino alla fine del mese.
              </p>
            </div>
          )}

          {/* PULSANTE PRESENTAZIONE */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setPresenting(true)}
              className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[12px] font-medium text-iri-pale transition-all hover:opacity-80"
              style={{
                background: "rgba(168,139,250,0.08)",
                border: "1px solid rgba(168,139,250,0.25)",
              }}
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
              Presenta il mese
            </button>
          </div>

          {/* HERO NARRATIVO */}
          <HeroRecap recap={recap} />

          {/* ANALISI DETTAGLIATA ESPANDIBILE */}
          <DetailAnalysisCard recap={recap} />

          {/* TOTALE SPESA + NETTO */}
          <Overview recap={recap} />

          {/* VS MESE SCORSO */}
          <ComparisonSection recap={recap} />

          {/* CAPITALE INVESTITO */}
          <InvestedSection recap={recap} />

          {/* BILANCIO GUARDIANO */}
          {recap.savedImpulsesCount > 0 && (
            <GuardianSection recap={recap} stats={stats} />
          )}

          {/* TOP CATEGORIA + DONUT */}
          {recap.categoryBreakdown.length > 0 && (
            <CategoriesSection recap={recap} />
          )}

          {/* GIORNATA PIÙ COSTOSA / VIRTUOSA */}
          {recap.mostExpensiveDay && recap.leastExpensiveDay && (
            <DaysSection recap={recap} />
          )}

          {/* TREND VS MESE SCORSO */}
          {recap.trendVsPrevMonth !== null && (
            <TrendSection recap={recap} />
          )}

          {/* PROGRESSI OBIETTIVI */}
          {recap.goalsProgress.length > 0 && (
            <GoalsSection recap={recap} />
          )}

          {/* CITAZIONE FINALE */}
          <FinalQuote recap={recap} />

          {/* UPSELL STORICO (solo free) */}
          {(profile.plan || "free") === "free" && (
            <div className="relative mb-8 overflow-hidden rounded-[20px] border border-iri-violet/25 bg-gradient-to-br from-iri-violet/[0.08] via-iri-magenta/[0.05] to-transparent p-6">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(168,139,250,0.12), transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <p className="eyebrow-accent mb-2 text-[10px]">Storico completo</p>
                <p className="mb-1 font-serif text-[18px] italic leading-[1.4] text-ink-primary">
                  Vuoi vedere i recap di tutti i mesi?
                </p>
                <p className="mb-4 text-[13px] text-ink-secondary">
                  Passa a Premium per accedere allo storico completo e confrontare ogni mese.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90"
                >
                  <Zap className="h-4 w-4" />
                  Passa a Premium
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 mb-16 flex justify-center">
            <Link
              href="/settings"
              className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-6 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)]"
            >
              Imposta l&apos;ambizione per il prossimo mese
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="dashboard" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SEZIONI
// ═══════════════════════════════════════════════════════════

function DetailAnalysisCard({ recap }: { recap: RecapData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-panel mb-8 overflow-hidden rounded-[18px] animate-slide-up [animation-delay:0.05s]"
      style={{ animationFillMode: "both" }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
            <BarChart2 className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="eyebrow-accent text-[10px]">Analisi dettagliata</p>
            <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
              Categorie, giorni e confronto mensile
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-ink-muted transition-transform duration-[300ms] ${expanded ? "rotate-180" : ""}`}
          strokeWidth={1.8}
        />
      </button>

      {expanded && (
        <div className="border-t border-white/[0.04] px-6 pb-6 pt-5">
          {/* Breakdown categorie */}
          {recap.categoryBreakdown.length > 0 && (
            <div className="mb-6">
              <p className="eyebrow mb-3 text-[9px]">Ripartizione categorie</p>
              <div className="flex flex-col gap-2.5">
                {recap.categoryBreakdown.slice(0, 6).map((cat) => {
                  const catSplit = splitCurrency(cat.amount);
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="w-[88px] flex-shrink-0 truncate text-[11px] text-ink-secondary">
                        {cat.name}
                      </span>
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                      <span className="w-9 flex-shrink-0 text-right font-mono-tabular text-[11px] text-ink-muted">
                        {cat.percent}%
                      </span>
                      <span className="w-16 flex-shrink-0 text-right font-mono-tabular text-[11px] text-ink-primary">
                        {catSplit.int}€
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Giorni più costoso / virtuoso */}
          {recap.mostExpensiveDay && recap.leastExpensiveDay && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-[12px] border border-red-400/15 bg-red-500/[0.04] p-3.5">
                <p className="eyebrow mb-1.5 text-[9px] text-red-300/70">Giorno più costoso</p>
                <p className="m-0 font-mono-tabular text-[20px] font-medium leading-none text-red-300">
                  {splitCurrency(recap.mostExpensiveDay.amount).int}
                  <span className="text-[12px] text-red-300/60">
                    ,{splitCurrency(recap.mostExpensiveDay.amount).dec}€
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-ink-secondary">
                  {new Date(recap.mostExpensiveDay.date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="rounded-[12px] border border-emerald-400/15 bg-emerald-500/[0.04] p-3.5">
                <p className="eyebrow mb-1.5 text-[9px] text-emerald-300/70">Giorno più virtuoso</p>
                <p className="m-0 font-mono-tabular text-[20px] font-medium leading-none text-emerald-300">
                  {splitCurrency(recap.leastExpensiveDay.amount).int}
                  <span className="text-[12px] text-emerald-300/60">
                    ,{splitCurrency(recap.leastExpensiveDay.amount).dec}€
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-ink-secondary">
                  {new Date(recap.leastExpensiveDay.date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Confronto mese precedente */}
          {recap.trendVsPrevMonth !== null && (
            <div className="mb-6 rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="eyebrow mb-3 text-[9px]">Confronto mese precedente</p>
              <div className="flex items-center justify-around gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-ink-muted">Variazione spese</p>
                  <p
                    className={`mt-1 font-mono-tabular text-[18px] font-medium ${
                      recap.trendVsPrevMonth > 0 ? "text-red-300" : "text-emerald-300"
                    }`}
                  >
                    {recap.trendVsPrevMonth > 0 ? "+" : ""}
                    {recap.trendVsPrevMonth}%
                  </p>
                </div>
                <div className="h-10 w-[1px] bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-[10px] text-ink-muted">Spesa totale</p>
                  <p className="mt-1 font-mono-tabular text-[18px] font-medium text-ink-primary">
                    {splitCurrency(recap.totalSpent).int}€
                  </p>
                </div>
                <div className="h-10 w-[1px] bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-[10px] text-ink-muted">Media giornaliera</p>
                  <p className="mt-1 font-mono-tabular text-[18px] font-medium text-ink-primary">
                    {splitCurrency(recap.avgPerDay).int}€
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Media giornaliera */}
          <div className="rounded-[12px] border border-white/[0.04] bg-white/[0.015] p-4">
            <p className="eyebrow mb-2 text-[9px]">Media giornaliera</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tabular text-[26px] font-medium text-ink-primary [letter-spacing:-0.02em]">
                {splitCurrency(recap.avgPerDay).int}
              </span>
              <span className="text-[14px] text-ink-primary/60">
                ,{splitCurrency(recap.avgPerDay).dec}€
              </span>
              <span className="text-[12px] text-ink-muted">/ giorno</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-secondary">
              Su {recap.daysActive}{" "}
              {recap.daysActive === 1 ? "giorno attivo" : "giorni attivi"} nel mese
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroRecap({ recap }: { recap: RecapData }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = `Il mio ${recap.monthLabel} su Valorem: ho speso ${Math.round(recap.totalSpent)}€, resistito a ${recap.savedImpulsesCount} impulsi, e il mio mese si chiama "${recap.narrativeTitle}" 💜 #Valorem`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Gradiente tematico in base al tipo di mese
  const title = recap.narrativeTitle.toLowerCase();
  const themeGrad = title.includes("costruttore")
    ? "linear-gradient(135deg, rgba(168,139,250,0.35) 0%, rgba(96,165,250,0.25) 100%)"
    : title.includes("svolta")
    ? "linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(96,165,250,0.2) 100%)"
    : title.includes("guardiano")
    ? "linear-gradient(135deg, rgba(232,121,249,0.3) 0%, rgba(168,139,250,0.25) 100%)"
    : "linear-gradient(135deg, rgba(168,139,250,0.28) 0%, rgba(232,121,249,0.22) 100%)";

  const titleWords = recap.narrativeTitle.split(" ");

  return (
    <div
      className="relative mt-6 mb-6 overflow-hidden rounded-[28px] animate-slide-up"
      style={{ background: themeGrad, border: "1px solid rgba(168,139,250,0.15)" }}
    >
      {/* Radial overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      <div className="relative z-10 px-6 py-14 text-center md:px-12">
        {/* Eyebrow */}
        <p className="eyebrow-accent mb-5 text-[10px]">
          Recap · {recap.monthYear}
        </p>

        {/* Titolo con stagger per parola */}
        <h1 className="m-0 font-serif font-normal italic leading-[1.08]">
          {titleWords.map((word, i) => (
            <span
              key={i}
              className="inline-block animate-slide-up"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "both",
                marginRight: i < titleWords.length - 1 ? "0.28em" : 0,
                background:
                  "linear-gradient(135deg, #F0EEFF 0%, #C4B5FD 50%, #E879F9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "clamp(40px, 6vw, 72px)",
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Coach quote card */}
        {recap.coachQuote && (
          <div
            className="mx-auto mt-8 max-w-[600px] rounded-[16px] px-6 py-4 text-left"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderLeft: "4px solid #A88BFA",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="m-0 font-serif italic text-[16px] md:text-[18px] leading-[1.7] text-ink-primary/90">
              &ldquo;{recap.coachQuote}&rdquo;
            </p>
            <p className="m-0 mt-2 text-[11px] text-iri-pale/70 uppercase tracking-[0.12em]">
              Dal tuo Coach
            </p>
          </div>
        )}

        {/* Share */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-iri-violet/40 bg-iri-violet/[0.12] px-4 py-2 text-[12px] font-medium text-iri-pale transition-all duration-[200ms] hover:border-iri-violet/60 hover:bg-iri-violet/[0.22]"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            {copied ? "Copiato! ✓" : "Condividi"}
          </button>
        </div>
      </div>

      {/* 4 stat cards — numeri del mese */}
      <div
        className="relative z-10 grid grid-cols-2 gap-3 px-6 pb-6 md:grid-cols-4"
      >
        {[
          {
            label: "Spese",
            value: splitCurrency(recap.totalSpent).int,
            dec: splitCurrency(recap.totalSpent).dec,
            color: "#F87171",
            bg: "rgba(248,113,113,0.08)",
            border: "rgba(248,113,113,0.2)",
            icon: <TrendingDown className="h-4 w-4" strokeWidth={1.8} />,
          },
          {
            label: "Entrate",
            value: splitCurrency(recap.totalIncome).int,
            dec: splitCurrency(recap.totalIncome).dec,
            color: "#10B981",
            bg: "rgba(16,185,129,0.08)",
            border: "rgba(16,185,129,0.2)",
            icon: <TrendingUp className="h-4 w-4" strokeWidth={1.8} />,
          },
          {
            label: "Impulsi salvati",
            value: `${recap.savedImpulsesCount}`,
            dec: "",
            suffix: ` (${splitCurrency(recap.savedFromImpulses).int}€)`,
            color: "#A88BFA",
            bg: "rgba(168,139,250,0.08)",
            border: "rgba(168,139,250,0.2)",
            icon: <Ghost className="h-4 w-4" strokeWidth={1.8} />,
          },
          {
            label: "Investito",
            value: splitCurrency(recap.capitalInvested).int,
            dec: splitCurrency(recap.capitalInvested).dec,
            color: "#60A5FA",
            bg: "rgba(96,165,250,0.08)",
            border: "rgba(96,165,250,0.2)",
            icon: <Trophy className="h-4 w-4" strokeWidth={1.8} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] px-4 py-3"
            style={{
              background: stat.bg,
              border: `1px solid ${stat.border}`,
            }}
          >
            <div className="mb-1.5 flex items-center gap-1.5" style={{ color: stat.color }}>
              {stat.icon}
              <p className="m-0 text-[9px] font-medium uppercase tracking-[0.12em]" style={{ color: stat.color }}>
                {stat.label}
              </p>
            </div>
            <p className="m-0 font-serif font-normal" style={{ color: stat.color }}>
              <span className="text-[22px] [letter-spacing:-0.02em]">{stat.value}</span>
              {stat.dec && <span className="text-[13px] opacity-60">,{stat.dec}</span>}
              {!stat.dec && <span className="text-[12px] opacity-70 ml-1">{(stat as { suffix?: string }).suffix}</span>}
              {stat.dec && <span className="ml-0.5 text-[11px] opacity-50">€</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview({ recap }: { recap: RecapData }) {
  const spentSplit = splitCurrency(recap.totalSpent);
  const incomeSplit = splitCurrency(recap.totalIncome);
  const netSplit = splitCurrency(Math.abs(recap.netValue));
  const avgSplit = splitCurrency(recap.avgPerDay);

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 animate-slide-up [animation-delay:0.1s]"
      style={{ animationFillMode: "both" }}>
      <StatCard
        eyebrow="Spese totali"
        intPart={spentSplit.int}
        decPart={spentSplit.dec}
        suffix="€"
        tone="expense"
      />
      <StatCard
        eyebrow="Entrate totali"
        intPart={incomeSplit.int}
        decPart={incomeSplit.dec}
        suffix="€"
        tone="income"
      />
      <StatCard
        eyebrow={recap.netValue >= 0 ? "Surplus" : "Deficit"}
        intPart={`${recap.netValue >= 0 ? "+" : "−"}${netSplit.int}`}
        decPart={netSplit.dec}
        suffix="€"
        tone={recap.netValue >= 0 ? "income" : "expense"}
      />
      <StatCard
        eyebrow="Media al giorno"
        intPart={avgSplit.int}
        decPart={avgSplit.dec}
        suffix="€"
      />
    </div>
  );
}

function StatCard({
  eyebrow,
  intPart,
  decPart,
  suffix,
  tone,
}: {
  eyebrow: string;
  intPart: string;
  decPart: string;
  suffix: string;
  tone?: "expense" | "income";
}) {
  const color =
    tone === "expense"
      ? "text-red-200"
      : tone === "income"
      ? "text-emerald-200"
      : "text-ink-primary";

  return (
    <div className="glass-panel rounded-[14px] px-4 py-3">
      <p className="eyebrow text-[9px]">{eyebrow}</p>
      <p className="m-0 mt-1.5 font-mono-tabular font-medium">
        <span className={`text-[22px] ${color} [letter-spacing:-0.02em]`}>
          {intPart}
        </span>
        <span className="text-[13px] text-ink-primary/60">,{decPart}</span>
        <span className="ml-0.5 text-[11px] text-ink-muted">{suffix}</span>
      </p>
    </div>
  );
}

function ComparisonSection({ recap }: { recap: RecapData }) {
  if (!recap.prevMonthData) {
    return (
      <div
        className="glass-panel mb-8 rounded-[16px] px-5 py-4 animate-slide-up [animation-delay:0.12s]"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08]">
            <BarChart2 className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />
          </div>
          <div>
            <p className="eyebrow-accent text-[10px]">Confronto mensile</p>
            <p className="m-0 mt-0.5 font-serif text-[14px] italic text-ink-primary">
              Primo mese tracciato — baseline stabilita 🌱
            </p>
          </div>
        </div>
      </div>
    );
  }

  const prev = recap.prevMonthData;
  const spendTrend = recap.trendVsPrevMonth;
  const incomeTrend =
    prev.income > 0
      ? Math.round(((recap.totalIncome - prev.income) / prev.income) * 100)
      : null;
  const txDelta = recap.transactionCount - prev.transactionCount;

  return (
    <div
      className="glass-panel mb-8 rounded-[20px] p-6 animate-slide-up [animation-delay:0.12s]"
      style={{ animationFillMode: "both" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <BarChart2 className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Rispetto al mese scorso</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Come sei andato a confronto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Spese */}
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="eyebrow mb-2 text-[9px]">Spese</p>
          {spendTrend !== null ? (
            <>
              <div className="flex items-center justify-center gap-1">
                {spendTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-300" strokeWidth={2} />
                ) : (
                  <TrendingDown className="h-4 w-4 text-emerald-300" strokeWidth={2} />
                )}
                <span
                  className={`font-mono-tabular text-[20px] font-medium [letter-spacing:-0.02em] ${
                    spendTrend > 0 ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {spendTrend > 0 ? "+" : ""}
                  {spendTrend}%
                </span>
              </div>
              <p className="mt-1 text-[10px] text-ink-muted">
                {spendTrend > 0 ? "di più rispetto a prima" : "in meno — ottimo!"}
              </p>
            </>
          ) : (
            <span className="text-[12px] text-ink-muted">N/D</span>
          )}
        </div>

        {/* Entrate */}
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="eyebrow mb-2 text-[9px]">Entrate</p>
          {incomeTrend !== null ? (
            <>
              <div className="flex items-center justify-center gap-1">
                {incomeTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-300" strokeWidth={2} />
                ) : (
                  <TrendingDown className="h-4 w-4 text-amber-300" strokeWidth={2} />
                )}
                <span
                  className={`font-mono-tabular text-[20px] font-medium [letter-spacing:-0.02em] ${
                    incomeTrend >= 0 ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {incomeTrend > 0 ? "+" : ""}
                  {incomeTrend}%
                </span>
              </div>
              <p className="mt-1 text-[10px] text-ink-muted">
                {incomeTrend >= 0 ? "entrate in crescita" : "entrate calate"}
              </p>
            </>
          ) : (
            <span className="text-[12px] text-ink-muted">N/D</span>
          )}
        </div>

        {/* Transazioni */}
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="eyebrow mb-2 text-[9px]">Transazioni</p>
          <div className="flex items-center justify-center gap-1">
            {txDelta !== 0 && (
              txDelta > 0 ? (
                <TrendingUp className="h-4 w-4 text-ink-muted" strokeWidth={2} />
              ) : (
                <TrendingDown className="h-4 w-4 text-ink-muted" strokeWidth={2} />
              )
            )}
            <span className="font-mono-tabular text-[20px] font-medium text-ink-primary [letter-spacing:-0.02em]">
              {txDelta > 0 ? "+" : ""}
              {txDelta}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-ink-muted">
            {recap.transactionCount} questo mese
          </p>
        </div>
      </div>
    </div>
  );
}

function InvestedSection({ recap }: { recap: RecapData }) {
  const investedSplit = splitCurrency(recap.capitalInvested);
  const count = recap.capitalInvestedCount;
  const hasInvestments = recap.capitalInvested > 0;

  return (
    <div
      className="glass-panel mb-8 overflow-hidden rounded-[20px] p-8 animate-slide-up [animation-delay:0.15s]"
      style={{ animationFillMode: "both" }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-300">
          <BarChart2 className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Capitale investito</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Soldi che restano tuoi, in forma diversa
          </p>
        </div>
      </div>

      {hasInvestments ? (
        <>
          <div className="flex items-baseline gap-2 font-mono-tabular">
            <span className="text-[72px] font-normal leading-[0.9] [letter-spacing:-0.04em] text-emerald-300">
              {investedSplit.int}
            </span>
            <span className="text-[28px] text-ink-primary/60">,{investedSplit.dec}</span>
            <span className="text-[20px] text-ink-muted">€</span>
          </div>
          <p className="mt-2 text-[12px] text-ink-secondary font-mono-tabular">
            {count === 1 ? "1 operazione" : `${count} operazioni`} nel mese
          </p>
          <p className="mt-4 font-serif text-[15px] italic leading-[1.6] text-ink-primary/90">
            Non è una spesa — è capitale che continua a lavorare per te. Escluso dai calcoli di budget perché non è consumo.
          </p>
        </>
      ) : (
        <p className="mt-2 font-serif text-[15px] italic leading-[1.6] text-ink-primary/50">
          Nessun investimento registrato questo mese. Aggiungi una transazione con categoria "Investimenti" per tracciare il tuo capitale.
        </p>
      )}
    </div>
  );
}

function GuardianSection({
  recap,
  stats,
}: {
  recap: RecapData;
  stats: DashboardStats;
}) {
  const savedSplit = splitCurrency(recap.savedFromImpulses);
  const timeSaved = amountToTimeLabel(recap.savedFromImpulses, stats);
  const suffix = getTimeMetricSuffix(stats.timeMetric);

  return (
    <div className="glass-panel-strong mb-8 overflow-hidden rounded-[20px] p-8 animate-slide-up [animation-delay:0.2s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-300">
          <Ghost className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Bilancio del Guardiano</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Ciò che hai scelto di non spendere
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 font-mono-tabular">
        <span className="hero-number-grad text-[72px] font-normal leading-[0.9] [letter-spacing:-0.04em]">
          {savedSplit.int}
        </span>
        <span className="text-[28px] text-ink-primary/60">,{savedSplit.dec}</span>
        <span className="text-[20px] text-ink-muted">€</span>
      </div>

      <p className="mt-4 font-serif text-[15px] italic leading-[1.6] text-ink-primary/90">
        Hai rifiutato <span className="iri-text font-medium">{recap.savedImpulsesCount}</span>{" "}
        {recap.savedImpulsesCount === 1 ? "impulso" : "impulsi"} — equivalente a{" "}
        <span className="iri-text font-medium">{timeSaved}</span> {suffix} che
        non hai dovuto "lavorare" per poi vedere svanire.
      </p>
    </div>
  );
}

function CategoriesSection({ recap }: { recap: RecapData }) {
  const top = recap.categoryBreakdown.slice(0, 5);

  return (
    <div className="glass-panel mb-8 rounded-[18px] p-6 animate-slide-up [animation-delay:0.3s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Trophy className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Categorie</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Dove sono andati i tuoi euro
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {top.map((cat, i) => {
          const { Icon, color } = categoryMeta(cat.name);
          const catSplit = splitCurrency(cat.amount);

          return (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03]"
                style={{ color }}
              >
                <Icon className="h-[16px] w-[16px]" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-ink-primary">
                    {cat.name}
                  </span>
                  <span className="font-mono-tabular text-[13px] text-ink-primary">
                    {catSplit.int},{catSplit.dec}
                    <span className="ml-0.5 text-[11px] text-ink-muted">€</span>
                  </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{
                      width: `${cat.percent}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
              <span className="w-10 text-right font-mono-tabular text-[11px] text-ink-secondary">
                {cat.percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DaysSection({ recap }: { recap: RecapData }) {
  if (!recap.mostExpensiveDay || !recap.leastExpensiveDay) return null;

  const maxSplit = splitCurrency(recap.mostExpensiveDay.amount);
  const minSplit = splitCurrency(recap.leastExpensiveDay.amount);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 animate-slide-up [animation-delay:0.4s]"
      style={{ animationFillMode: "both" }}>
      <div className="glass-panel rounded-[16px] p-5">
        <div className="mb-3 flex items-center gap-2 text-red-300">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="eyebrow text-[9px]" style={{ color: "inherit", opacity: 0.85 }}>
            Giornata più costosa
          </p>
        </div>
        <p className="m-0 font-mono-tabular font-medium text-ink-primary">
          <span className="text-[24px] [letter-spacing:-0.02em]">
            {maxSplit.int}
          </span>
          <span className="text-[14px] text-ink-primary/60">,{maxSplit.dec}</span>
          <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-secondary">
          {formatItalianDate(recap.mostExpensiveDay.date)}
        </p>
      </div>

      <div className="glass-panel rounded-[16px] p-5">
        <div className="mb-3 flex items-center gap-2 text-emerald-300">
          <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="eyebrow text-[9px]" style={{ color: "inherit", opacity: 0.85 }}>
            Giornata più virtuosa
          </p>
        </div>
        <p className="m-0 font-mono-tabular font-medium text-ink-primary">
          <span className="text-[24px] [letter-spacing:-0.02em]">
            {minSplit.int}
          </span>
          <span className="text-[14px] text-ink-primary/60">,{minSplit.dec}</span>
          <span className="ml-0.5 text-[12px] text-ink-muted">€</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-secondary">
          {formatItalianDate(recap.leastExpensiveDay.date)}
        </p>
      </div>
    </div>
  );
}

function TrendSection({ recap }: { recap: RecapData }) {
  if (recap.trendVsPrevMonth === null) return null;
  const up = recap.trendVsPrevMonth > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "text-amber-300" : "text-emerald-300";
  const bg = up ? "bg-amber-400/[0.06] border-amber-400/20" : "bg-emerald-400/[0.06] border-emerald-400/20";

  return (
    <div className={`glass-panel mb-8 rounded-[16px] border p-5 animate-slide-up [animation-delay:0.5s] ${bg}`}
      style={{ animationFillMode: "both" }}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${color}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow text-[9px]">Rispetto al mese scorso</p>
          <p className="m-0 mt-0.5 text-[14px] text-ink-primary">
            Hai speso il{" "}
            <span className={`font-mono-tabular font-medium ${color}`}>
              {up ? "+" : ""}
              {recap.trendVsPrevMonth}%
            </span>{" "}
            {up ? "in più" : "in meno"}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoalsSection({ recap }: { recap: RecapData }) {
  return (
    <div className="glass-panel mb-8 rounded-[18px] p-6 animate-slide-up [animation-delay:0.6s]"
      style={{ animationFillMode: "both" }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] text-iri-pale">
          <Target className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow-accent text-[10px]">Obiettivi</p>
          <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
            Dove stanno arrivando i tuoi sogni
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {recap.goalsProgress.map((gp) => (
          <div key={gp.goal.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-[20px]">
              {gp.goal.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-ink-primary">
                  {gp.goal.title}
                </span>
                <span className="iri-text font-mono-tabular text-[12px] font-medium">
                  {gp.monthProgressPct}%
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue transition-all duration-[600ms]"
                  style={{ width: `${gp.monthProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalQuote({ recap }: { recap: RecapData }) {
  return (
    <div className="relative my-10 overflow-hidden rounded-[20px] animate-slide-up [animation-delay:0.7s]"
      style={{ animationFillMode: "both" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 50%, rgba(125, 211, 252, 0.08), transparent 70%)",
        }}
      />
      <div className="relative z-10 py-10 px-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-iri-violet">
            <Sparkles className="h-4 w-4 text-[#0A0812]" strokeWidth={2} />
          </div>
        </div>
        <p className="eyebrow-accent mb-3 text-[10px]">Dal tuo Coach</p>
        <p className="mx-auto max-w-[600px] font-serif text-[20px] font-normal italic leading-[1.8] text-ink-primary">
          &ldquo;{recap.coachQuote}&rdquo;
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════

function categoryMeta(category: string): {
  Icon: typeof ShoppingCart;
  color: string;
} {
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
  return map[category] || { Icon: MoreHorizontal, color: "#9CA3AF" };
}

function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}