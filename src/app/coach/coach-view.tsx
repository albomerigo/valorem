"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  BarChart2,
  TrendingDown,
  PieChart,
  Target,
  LineChart,
  Crown,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Compass,
  X,
} from "lucide-react";
import Link from "next/link";
import type { DashboardStats, UserProfile, Transaction } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type PromptType =
  | "analyze_month"
  | "save_more"
  | "top_category"
  | "goals_check"
  | "monthly_trend"
  | "custom";

interface Message {
  type: "user" | "coach";
  text: string;
  promptId?: string;
  promptLabel?: string;
}

interface CardDef {
  id: PromptType;
  title: string;
  desc: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

/* ─────────────────────────────────────────────────────────────
   PROMPT DEFINITIONS
───────────────────────────────────────────────────────────── */

const CARDS: CardDef[] = [
  {
    id: "analyze_month",
    title: "Analizza questo mese",
    desc: "Cosa dicono i tuoi numeri",
    Icon: BarChart2,
    iconColor: "#A88BFA",
    iconBg: "rgba(168,139,250,0.15)",
  },
  {
    id: "save_more",
    title: "Come risparmio di più?",
    desc: "Consigli basati sui tuoi dati",
    Icon: TrendingDown,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.15)",
  },
  {
    id: "top_category",
    title: "La mia categoria principale",
    desc: "Dove va davvero il tuo denaro",
    Icon: PieChart,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.15)",
  },
  {
    id: "goals_check",
    title: "Sono in linea con gli obiettivi?",
    desc: "Verifica il tuo progresso",
    Icon: Target,
    iconColor: "#E879F9",
    iconBg: "rgba(232,121,249,0.15)",
  },
  {
    id: "monthly_trend",
    title: "Il mio andamento",
    desc: "Trend rispetto al mese scorso",
    Icon: LineChart,
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.15)",
  },
];

const LOADING_PHRASES = [
  "Analizzo le tue transazioni...",
  "Elaboro i tuoi dati...",
  "Costruisco la risposta...",
  "Quasi pronto...",
];

const QUICK_PROMPTS = [
  { label: "Il mio mese in breve", promptId: "analyze_month" as PromptType },
  { label: "Dove risparmio?", promptId: "save_more" as PromptType },
  { label: "Come sto andando?", promptId: "monthly_trend" as PromptType },
];

/* ─────────────────────────────────────────────────────────────
   CONTEXT BUILDER (unchanged logic)
───────────────────────────────────────────────────────────── */

function buildContext(
  promptType: PromptType,
  stats: DashboardStats,
  profile: UserProfile,
  transactions: Transaction[],
  customQuestion?: string
) {
  const name = profile.name || "amico";
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const monthTx = transactions.filter(
    (t) => t.type === "expense" && t.transaction_date.startsWith(currentMonth)
  );
  const totalSpent = monthTx.reduce((s, t) => s + Number(t.amount), 0);

  const byCat: Record<string, number> = {};
  for (const t of monthTx) {
    const c = t.category || "Altro";
    byCat[c] = (byCat[c] || 0) + Number(t.amount);
  }
  const topCatEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCatEntry?.[0] ?? "—";
  const topCategoryAmount = Math.round(topCatEntry?.[1] ?? 0);
  const topCategoryPercent =
    totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  const categories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => `${cat} €${Math.round(amt)}`)
    .join(", ");

  const trendPercent = Math.round(stats.trendVsLastMonth ?? 0);
  const prevMonthSpent =
    trendPercent !== 0
      ? Math.round(totalSpent / (1 + trendPercent / 100))
      : Math.round(totalSpent);

  return {
    name,
    totalSpent: Math.round(totalSpent),
    transactionCount: monthTx.length,
    topCategory,
    topCategoryAmount,
    topCategoryPercent,
    categories,
    monthlyFree: Math.round(stats.monthlyFree),
    safeToSpend: Math.round(stats.safeToSpendToday),
    daysLeft: stats.remainingDays,
    goalsCount: 0,
    prevMonthSpent,
    trendPercent,
    customQuestion: customQuestion ?? "",
  };
}

/* ─────────────────────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────────────────────── */

function useTypewriter(text: string | null, speed = 15) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export function CoachView({
  profile,
  stats,
  transactions,
  plan,
}: {
  profile: UserProfile;
  stats: DashboardStats;
  transactions: Transaction[];
  plan: string;
}) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<PromptType | null>(null);
  const [activeCard, setActiveCard] = useState<CardDef | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 150;
  const isPro = plan === "pro";

  const { displayed: typewriterText } = useTypewriter(response);

  // Mount animation trigger
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Rotating loading phrase
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingPhrase((p) => (p + 1) % LOADING_PHRASES.length);
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  // Mini-stats
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const monthTxCount = transactions.filter(
    (t) => t.transaction_date.startsWith(currentMonth)
  ).length;
  const monthSpent = Math.round(
    transactions
      .filter(
        (t) => t.type === "expense" && t.transaction_date.startsWith(currentMonth)
      )
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  // Scroll to bottom after response
  useEffect(() => {
    if (response) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  const fetchCoach = useCallback(
    async (promptType: PromptType, card: CardDef | null, customQuestion?: string) => {
      if (!isPro) return;
      const userLabel = customQuestion ? `"${customQuestion}"` : (card?.title ?? "Domanda");

      const context = buildContext(promptType, stats, profile, transactions, customQuestion);

      setMessages((prev) => {
        const next = [...prev, { type: "user" as const, text: userLabel, promptId: promptType }];
        return next.slice(-20);
      });

      setActivePrompt(promptType);
      setActiveCard(card);
      setLoading(true);
      setResponse(null);
      setLoadingPhrase(0);

      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptType, context }),
        });
        const data = await res.json();
        const coachText = data.message || "Il Coach non è disponibile al momento.";
        setResponse(coachText);
        setMessages((prev) => {
          const next = [
            ...prev,
            { type: "coach" as const, text: coachText, promptLabel: userLabel },
          ];
          return next.slice(-20);
        });
      } catch {
        const errText = "Errore nella comunicazione con il Coach. Riprova.";
        setResponse(errText);
        setMessages((prev) => {
          const next = [...prev, { type: "coach" as const, text: errText }];
          return next.slice(-20);
        });
      } finally {
        setLoading(false);
      }
    },
    [isPro, stats, profile, transactions]
  );

  async function handleCustomSend() {
    const q = customInput.trim();
    if (!q || !isPro) return;
    await fetchCoach("custom", null, q);
    setCustomInput("");
  }

  function handleNewQuestion() {
    setResponse(null);
    setActivePrompt(null);
    setActiveCard(null);
  }

  function handleNewConversation() {
    setMessages([]);
    setResponse(null);
    setActivePrompt(null);
    setActiveCard(null);
  }

  function handleCopy() {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const charCount = customInput.length;

  // History = all messages except current exchange
  const prevMessages = response ? messages.slice(0, -2) : messages;
  const historyExchanges = Math.floor(prevMessages.length / 2);

  // Active card border color
  const activeBorderColor = activeCard?.iconColor ?? "#A88BFA";

  return (
    <div className="relative min-h-screen">
      {/* ── ANIMATED BACKGROUND ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute left-0 right-0 top-0 h-[1px] animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, #A88BFA, #E879F9, #60A5FA, transparent)",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          className="absolute animate-breathe"
          style={{
            left: "5%", top: "10%",
            width: 600, height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,139,250,0.14) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute animate-rotate-slow"
          style={{
            right: "0%", top: "20%",
            width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,121,249,0.1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute animate-float-y"
          style={{
            left: "45%", bottom: "0%",
            transform: "translateX(-50%)",
            width: 600, height: 350,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(96,165,250,0.09) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* ── SIDEBAR ── */}
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="coach" userName={profile.name || ""} />
      </div>

      <div className="relative z-10 md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
          <Topbar userName={profile.name || "ospite"} section="AI Coach" showBack />

          {/* ── TWO-COLUMN GRID ── */}
          <div
            className="mt-5 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 min-h-[calc(100vh-120px)]"
            style={{ alignItems: "start" }}
          >
            {/* ════════════════════════════════════
                LEFT PANEL — Coach Identity + Prompts
                ════════════════════════════════════ */}
            <aside
              className="lg:sticky lg:top-6 overflow-y-auto"
              style={{
                background: "rgba(168,139,250,0.03)",
                borderRight: "1px solid rgba(168,139,250,0.08)",
                borderRadius: "20px 0 0 20px",
                padding: "28px 20px",
                maxHeight: "calc(100vh - 100px)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(-20px)",
                transition: "opacity 400ms ease, transform 400ms ease",
              }}
            >
              {/* Coach Identity */}
              <div className="flex items-center gap-3 mb-5">
                {/* Animated avatar */}
                <div
                  className="relative flex-shrink-0"
                  style={{ width: 52, height: 52 }}
                >
                  <div
                    className="absolute inset-0 rounded-full animate-gradient-shift"
                    style={{
                      background: "linear-gradient(135deg, #A88BFA 0%, #E879F9 50%, #60A5FA 100%)",
                      backgroundSize: "200% 200%",
                      boxShadow: "0 0 24px rgba(168,139,250,0.5), 0 0 48px rgba(168,139,250,0.2)",
                      animation: "gradientShift 4s ease infinite, breathe 3s ease-in-out infinite",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full">
                    <Sparkles className="h-6 w-6 text-white" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Name + status */}
                <div className="min-w-0">
                  <p className="m-0 font-serif italic text-[17px] text-ink-primary leading-tight">
                    Valorem Coach
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="h-[6px] w-[6px] rounded-full animate-pulse"
                      style={{ background: "#10B981" }}
                    />
                    <span
                      className="text-[10px] tracking-[0.05em]"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Powered by Claude AI
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div
                className="mb-4"
                style={{ height: 1, background: "rgba(168,139,250,0.1)" }}
              />

              {/* Mini-stats pills */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {[
                  { emoji: "📊", label: `${monthTxCount} tx questo mese` },
                  { emoji: "💰", label: `€${monthSpent.toLocaleString("it-IT")} spesi` },
                  { emoji: "⭐", label: `Score ${stats.savingsPercent}%` },
                ].map((s, i) => (
                  <span
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {s.emoji} {s.label}
                  </span>
                ))}
              </div>

              {/* Separator */}
              <div
                className="mb-4"
                style={{ height: 1, background: "rgba(168,139,250,0.1)" }}
              />

              {/* Section title */}
              <div className="mb-3 flex items-center gap-1.5">
                <Compass className="h-3 w-3" style={{ color: "#A88BFA" }} strokeWidth={2} />
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Cosa vuoi scoprire?
                </span>
              </div>

              {/* Prompt cards */}
              <div className="flex flex-col gap-2">
                {CARDS.map((card, i) => (
                  <SidebarPromptCard
                    key={card.id}
                    card={card}
                    active={activePrompt === card.id}
                    isLoading={loading && activePrompt === card.id}
                    disabled={loading || !isPro}
                    delay={i * 60}
                    mounted={mounted}
                    onClick={() => fetchCoach(card.id, card)}
                  />
                ))}
              </div>

              {/* Separator */}
              <div
                className="mt-5 mb-4"
                style={{ height: 1, background: "rgba(168,139,250,0.1)" }}
              />

              {/* Free-text input */}
              <div className="relative">
                <p
                  className="mb-2 text-[9px] uppercase tracking-[0.12em]"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Oppure scrivi tu
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value.slice(0, MAX_CHARS))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCustomSend(); }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Fai una domanda..."
                    disabled={loading || !isPro}
                    maxLength={MAX_CHARS}
                    className="w-full bg-transparent pr-8 py-2 text-[13px] text-ink-primary placeholder:text-ink-muted outline-none"
                    style={{
                      borderBottom: inputFocused
                        ? "1px solid rgba(168,139,250,0.8)"
                        : "1px solid rgba(168,139,250,0.3)",
                      transition: "border-color 200ms ease",
                    }}
                  />
                  {customInput.trim() && (
                    <button
                      type="button"
                      onClick={handleCustomSend}
                      disabled={loading || !isPro}
                      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
                    >
                      <ArrowRight
                        className="h-4 w-4"
                        style={{ color: "#A88BFA" }}
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex justify-end">
                  <span
                    className="text-[10px] font-mono-tabular"
                    style={{
                      color: charCount > 120 ? "#FCA5A5" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>
            </aside>

            {/* ════════════════════════════════════
                RIGHT PANEL — Conversation Area
                ════════════════════════════════════ */}
            <main
              className="relative flex flex-col min-h-[calc(100vh-120px)] px-0 lg:px-8 pt-0 lg:pt-4 pb-8"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(20px)",
                transition: "opacity 400ms ease 100ms, transform 400ms ease 100ms",
              }}
            >
              {/* PRO OVERLAY */}
              {!isPro && (
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[20px] px-8 py-16 text-center"
                  style={{
                    background: "rgba(6,5,12,0.88)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                  }}
                >
                  <div
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-[20px]"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))",
                      border: "1px solid rgba(245,158,11,0.35)",
                      boxShadow: "0 0 40px rgba(245,158,11,0.15)",
                    }}
                  >
                    <Crown
                      className="h-9 w-9"
                      style={{
                        color: "#F59E0B",
                        filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))",
                      }}
                      strokeWidth={1.4}
                    />
                  </div>

                  <p className="m-0 font-serif text-[26px] italic text-ink-primary">
                    AI Coach è esclusivo Pro
                  </p>
                  <p className="m-0 mt-3 max-w-[380px] text-[14px] leading-[1.7] text-ink-secondary">
                    Analisi personalizzate basate sui tuoi dati reali.
                  </p>

                  <div className="mt-5 flex flex-col gap-2 text-left">
                    {[
                      "Risposte basate sui tuoi dati reali",
                      "5 analisi predefinite + domande libere",
                      "Powered by Claude AI",
                    ].map((point) => (
                      <div key={point} className="flex items-center gap-2">
                        <span style={{ color: "#A88BFA", fontSize: 14 }}>✦</span>
                        <span className="text-[13px] text-ink-secondary">{point}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/pricing"
                    className="mt-7 inline-flex items-center gap-2 rounded-[14px] px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 animate-gradient-shift"
                    style={{
                      background: "linear-gradient(135deg, #A88BFA, #E879F9, #60A5FA)",
                      backgroundSize: "200% 200%",
                      boxShadow: "0 8px 32px -8px rgba(168,139,250,0.7)",
                    }}
                  >
                    Scopri Piano Pro →
                  </Link>
                </div>
              )}

              {/* ── EMPTY STATE ── */}
              {!loading && !response && (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  {/* Animated concentric circles SVG */}
                  <div className="relative mb-8" style={{ width: 180, height: 180 }}>
                    <svg
                      width="180"
                      height="180"
                      viewBox="0 0 180 180"
                      fill="none"
                      className="absolute inset-0"
                    >
                      <circle
                        cx="90" cy="90" r="70"
                        stroke="rgba(168,139,250,0.15)"
                        strokeWidth="1"
                        className="animate-breathe"
                        style={{ animationDelay: "0s" }}
                      />
                      <circle
                        cx="90" cy="90" r="50"
                        stroke="rgba(232,121,249,0.18)"
                        strokeWidth="1"
                        className="animate-breathe"
                        style={{ animationDelay: "0.8s" }}
                      />
                      <circle
                        cx="90" cy="90" r="30"
                        stroke="rgba(96,165,250,0.2)"
                        strokeWidth="1"
                        className="animate-breathe"
                        style={{ animationDelay: "1.6s" }}
                      />
                    </svg>
                    {/* Center sparkle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full animate-gradient-shift"
                        style={{
                          background: "linear-gradient(135deg, rgba(168,139,250,0.3), rgba(232,121,249,0.2))",
                          backgroundSize: "200% 200%",
                          border: "1px solid rgba(168,139,250,0.3)",
                        }}
                      >
                        <Sparkles className="h-6 w-6 text-iri-pale" strokeWidth={1.6} />
                      </div>
                    </div>
                  </div>

                  <h2
                    className="m-0 font-serif italic text-[22px] leading-tight"
                    style={{ color: "rgba(240,238,255,0.9)" }}
                  >
                    Cosa vuoi scoprire oggi?
                  </h2>
                  <p className="mt-2 mb-8 text-[14px] text-ink-secondary max-w-[340px]">
                    Scegli un argomento o scrivi una domanda personalizzata
                  </p>

                  {/* Quick prompt pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {QUICK_PROMPTS.map((qp) => {
                      const card = CARDS.find((c) => c.id === qp.promptId)!;
                      return (
                        <button
                          key={qp.promptId}
                          type="button"
                          disabled={!isPro || loading}
                          onClick={() => fetchCoach(qp.promptId, card)}
                          className="inline-flex items-center gap-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30"
                          style={{
                            background: "rgba(168,139,250,0.07)",
                            border: "1px solid rgba(168,139,250,0.2)",
                            padding: "7px 16px",
                            fontSize: 13,
                            color: "#C4B5FD",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,139,250,0.14)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,139,250,0.45)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,139,250,0.07)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,139,250,0.2)";
                          }}
                        >
                          {qp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── LOADING STATE ── */}
              {loading && (
                <div
                  className="rounded-[20px] p-7 animate-slide-up"
                  style={{
                    background: "rgba(168,139,250,0.05)",
                    border: "1px solid rgba(168,139,250,0.15)",
                    animationFillMode: "both",
                  }}
                >
                  {/* Header */}
                  <div className="mb-6 flex items-center gap-3">
                    {activeCard && (
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]"
                        style={{
                          background: activeCard.iconBg,
                          border: `1px solid ${activeCard.iconColor}35`,
                        }}
                      >
                        <activeCard.Icon
                          className="h-4 w-4"
                          style={{ color: activeCard.iconColor }}
                          strokeWidth={1.6}
                        />
                      </div>
                    )}
                    <p className="m-0 font-serif italic text-[16px] text-ink-primary">
                      {activeCard?.title ?? "Il tuo Coach"}
                    </p>
                  </div>

                  {/* Skeleton lines */}
                  <div className="flex flex-col gap-3.5 mb-5">
                    {([85, 100, 70, 55] as number[]).map((w, i) => (
                      <div
                        key={i}
                        className="h-3.5 rounded-full"
                        style={{
                          width: `${w}%`,
                          background: `rgba(168,139,250,${0.14 - i * 0.025})`,
                          animation: `pulse 1.5s ease-in-out ${i * 150}ms infinite`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Rotating loading phrase */}
                  <p
                    className="m-0 font-serif italic text-[13px]"
                    style={{ color: "rgba(168,139,250,0.6)" }}
                  >
                    {LOADING_PHRASES[loadingPhrase]}
                  </p>
                </div>
              )}

              {/* ── CONVERSATION HISTORY (collapsible) ── */}
              {!loading && prevMessages.length > 0 && (
                <div
                  className="mb-5 overflow-hidden rounded-[14px]"
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHistoryOpen((v) => !v)}
                    className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <p className="m-0 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      Conversazione precedente{" "}
                      {historyExchanges > 0 &&
                        `(${historyExchanges} scamb${historyExchanges === 1 ? "io" : "i"})`}
                    </p>
                    <ChevronDown
                      className="h-4 w-4 text-ink-muted transition-transform duration-200"
                      style={{ transform: historyOpen ? "rotate(180deg)" : "rotate(0)" }}
                      strokeWidth={1.8}
                    />
                  </button>
                  {historyOpen && (
                    <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto px-4 pb-4">
                      {/* Show compact pairs */}
                      {Array.from({ length: Math.floor(prevMessages.length / 2) }).map((_, pi) => {
                        const uMsg = prevMessages[pi * 2];
                        const cMsg = prevMessages[pi * 2 + 1];
                        if (!uMsg || !cMsg) return null;
                        return (
                          <div key={pi} className="rounded-[10px] p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <p className="m-0 text-[11px] font-medium text-iri-pale mb-1">{uMsg.text}</p>
                            <p className="m-0 font-serif italic text-[12px] text-ink-secondary leading-relaxed">
                              {cMsg.text.slice(0, 80)}{cMsg.text.length > 80 ? "…" : ""}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── RESPONSE CARD ── */}
              {!loading && response && (
                <div
                  className="animate-slide-up"
                  style={{
                    borderLeft: `3px solid ${activeBorderColor}`,
                    borderRadius: "0 16px 16px 0",
                    background: "rgba(168,139,250,0.04)",
                    border: `1px solid ${activeBorderColor}30`,
                    borderLeftWidth: 3,
                    borderLeftColor: activeBorderColor,
                    padding: "24px 28px",
                    animationFillMode: "both",
                  }}
                >
                  {/* Card header */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {activeCard && (
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]"
                          style={{
                            background: activeCard.iconBg,
                            border: `1px solid ${activeCard.iconColor}35`,
                          }}
                        >
                          <activeCard.Icon
                            className="h-4 w-4"
                            style={{ color: activeCard.iconColor }}
                            strokeWidth={1.6}
                          />
                        </div>
                      )}
                      <p className="m-0 font-serif italic text-[16px] text-ink-primary">
                        {activeCard?.title ?? "Risposta personalizzata"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[10px] uppercase tracking-[0.08em]"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        Adesso
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]"
                        title="Copia risposta"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleNewQuestion}
                        className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]"
                      >
                        <X className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  {/* Typewriter text */}
                  <p
                    className="m-0 font-serif italic leading-[1.85]"
                    style={{ fontSize: 17, color: "#F0EEFF" }}
                  >
                    {typewriterText}
                    <span
                      className="inline-block ml-0.5 animate-pulse"
                      style={{
                        width: 2,
                        height: "1em",
                        background: activeBorderColor,
                        verticalAlign: "text-bottom",
                        opacity: typewriterText.length === response.length ? 0 : 1,
                      }}
                    />
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background: "rgba(168,139,250,0.1)",
                        border: "1px solid rgba(168,139,250,0.22)",
                        borderRadius: 999,
                        padding: "4px 12px",
                        fontSize: 11,
                        color: "#C4B5FD",
                      }}
                    >
                      <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                      {activeCard?.title ?? "Risposta AI"}
                    </span>
                    <button
                      type="button"
                      onClick={handleNewConversation}
                      className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[12px] font-medium text-ink-secondary transition-all hover:text-ink-primary hover:bg-white/[0.04]"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <RefreshCw className="h-3 w-3" strokeWidth={2} />
                      Nuova domanda
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </main>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="coach" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR PROMPT CARD
───────────────────────────────────────────────────────────── */

function SidebarPromptCard({
  card,
  active,
  isLoading,
  disabled,
  delay,
  mounted,
  onClick,
}: {
  card: CardDef;
  active: boolean;
  isLoading: boolean;
  disabled: boolean;
  delay: number;
  mounted: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { Icon } = card;

  const borderColor = active
    ? `${card.iconColor}80`
    : hovered
    ? `${card.iconColor}50`
    : "rgba(255,255,255,0.06)";

  const bg = active
    ? `${card.iconColor}18`
    : hovered
    ? `${card.iconColor}0C`
    : "transparent";

  const translateX = active ? "4px" : hovered && !disabled ? "2px" : "0px";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-start gap-3 rounded-[12px] text-left w-full overflow-hidden"
      style={{
        minHeight: 72,
        padding: "14px 16px",
        background: bg,
        border: `1px solid ${borderColor}`,
        transform: `translateX(${translateX})`,
        transition: "all 200ms cubic-bezier(0.2,0.8,0.2,1)",
        opacity: isLoading && !active ? 0.6 : disabled && !active ? 0.5 : 1,
        animationDelay: `${delay + 200}ms`,
        // Stagger entry
        ...(mounted
          ? {}
          : { opacity: 0, transform: "translateX(-10px)" }),
      }}
    >
      {/* Loading pulse border */}
      {isLoading && active && (
        <div
          className="absolute inset-0 rounded-[12px] animate-pulse"
          style={{ border: `1px solid ${card.iconColor}60` }}
        />
      )}

      {/* Icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[8px]"
        style={{
          width: 32,
          height: 32,
          background: card.iconBg,
          border: `1px solid ${card.iconColor}30`,
          opacity: active ? 1 : 0.85,
        }}
      >
        <Icon
          style={{ width: 18, height: 18, color: card.iconColor }}
          strokeWidth={1.6}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 pt-0.5">
        <p className="m-0 text-[13px] font-medium text-ink-primary leading-tight">
          {card.title}
        </p>
        <p className="m-0 mt-0.5 text-[11px] text-ink-muted leading-snug truncate">
          {card.desc}
        </p>
      </div>
    </button>
  );
}
