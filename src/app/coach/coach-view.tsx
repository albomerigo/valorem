"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  X,
  Lock,
  Send,
  BarChart2,
  TrendingDown,
  PieChart,
  Target,
  LineChart,
  Crown,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { DashboardStats, UserProfile, Transaction } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";

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
  bgGrad: string;
  border: string;
  hoverGlow: string;
}

const CARDS: CardDef[] = [
  {
    id: "analyze_month",
    title: "Analizza questo mese",
    desc: "Cosa dicono i tuoi numeri",
    Icon: BarChart2,
    iconColor: "#A88BFA",
    bgGrad: "linear-gradient(135deg, rgba(168,139,250,0.08) 0%, rgba(168,139,250,0.04) 100%)",
    border: "rgba(168,139,250,0.25)",
    hoverGlow: "0 16px 40px -12px rgba(168,139,250,0.3)",
  },
  {
    id: "save_more",
    title: "Come risparmio di più?",
    desc: "Consigli pratici sui tuoi dati",
    Icon: TrendingDown,
    iconColor: "#10B981",
    bgGrad: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)",
    border: "rgba(16,185,129,0.25)",
    hoverGlow: "0 16px 40px -12px rgba(16,185,129,0.3)",
  },
  {
    id: "top_category",
    title: "La mia categoria principale",
    desc: "Dove va il tuo denaro",
    Icon: PieChart,
    iconColor: "#F59E0B",
    bgGrad: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)",
    border: "rgba(245,158,11,0.25)",
    hoverGlow: "0 16px 40px -12px rgba(245,158,11,0.3)",
  },
  {
    id: "goals_check",
    title: "Sono in linea?",
    desc: "Verifica i tuoi obiettivi",
    Icon: Target,
    iconColor: "#E879F9",
    bgGrad: "linear-gradient(135deg, rgba(232,121,249,0.08) 0%, rgba(232,121,249,0.04) 100%)",
    border: "rgba(232,121,249,0.25)",
    hoverGlow: "0 16px 40px -12px rgba(232,121,249,0.3)",
  },
  {
    id: "monthly_trend",
    title: "Il mio andamento",
    desc: "Trend rispetto al mese scorso",
    Icon: LineChart,
    iconColor: "#60A5FA",
    bgGrad: "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(96,165,250,0.04) 100%)",
    border: "rgba(96,165,250,0.25)",
    hoverGlow: "0 16px 40px -12px rgba(96,165,250,0.3)",
  },
];

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
  const [activePromptLabel, setActivePromptLabel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const MAX_CHARS = 150;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPro = plan === "pro";

  // Mini-stats
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const monthTxCount = transactions.filter(
    (t) => t.transaction_date.startsWith(currentMonth)
  ).length;
  const monthSpent = Math.round(
    transactions
      .filter((t) => t.type === "expense" && t.transaction_date.startsWith(currentMonth))
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  async function fetchCoach(
    promptType: PromptType,
    userLabel: string,
    customQuestion?: string
  ) {
    if (!isPro) return;

    const context = buildContext(promptType, stats, profile, transactions, customQuestion);

    setMessages((prev) => {
      const next = [...prev, { type: "user" as const, text: userLabel, promptId: promptType }];
      return next.slice(-10);
    });

    setActivePrompt(promptType);
    setActivePromptLabel(userLabel);
    setLoading(true);
    setResponse(null);

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
        return next.slice(-10);
      });
    } catch {
      const errText = "Errore nella comunicazione con il Coach. Riprova.";
      setResponse(errText);
      setMessages((prev) => {
        const next = [...prev, { type: "coach" as const, text: errText }];
        return next.slice(-10);
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomSend() {
    const q = customInput.trim();
    if (!q || !isPro) return;
    await fetchCoach("custom", `"${q}"`, q);
    setCustomInput("");
  }

  function handleNewQuestion() {
    setResponse(null);
    setActivePrompt(null);
    setActivePromptLabel(null);
  }

  function handleNewConversation() {
    setMessages([]);
    setResponse(null);
    setActivePrompt(null);
    setActivePromptLabel(null);
  }

  const charCount = customInput.length;
  const charOverLimit = charCount > 120;

  // Messages shown in history = everything except the current exchange (last user+coach pair)
  const prevMessages = response ? messages.slice(0, -2) : messages;
  const historyExchanges = Math.floor(prevMessages.length / 2);

  return (
    <div className="relative min-h-screen">
      {/* ─── ANIMATED BACKGROUND ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* LED line top */}
        <div
          className="absolute left-0 right-0 top-0 h-[2px] animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, #A88BFA, #E879F9, #60A5FA, transparent)",
            backgroundSize: "200% 100%",
          }}
        />
        {/* Orb 1 — violet */}
        <div
          className="absolute animate-breathe"
          style={{
            left: "8%",
            top: "15%",
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,139,250,0.18) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        {/* Orb 2 — magenta */}
        <div
          className="absolute animate-rotate-slow"
          style={{
            right: "2%",
            top: "25%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,121,249,0.13) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        {/* Orb 3 — blue */}
        <div
          className="absolute animate-float-y"
          style={{
            left: "50%",
            bottom: "5%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(96,165,250,0.12) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* ─── SIDEBAR ─── */}
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="coach" userName={profile.name || ""} />
      </div>

      <div className="relative z-10 md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[860px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="AI Coach" showBack />

          {/* ─── HEADER ─── */}
          <div className="mt-12 mb-10 flex flex-col items-center text-center gap-5">
            {/* Animated avatar */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full animate-gradient-shift"
              style={{
                background:
                  "linear-gradient(135deg, #A88BFA 0%, #E879F9 50%, #60A5FA 100%)",
                backgroundSize: "200% 200%",
                boxShadow:
                  "0 0 40px rgba(168,139,250,0.6), 0 0 80px rgba(168,139,250,0.2)",
              }}
            >
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.8} />
            </div>

            {/* Title + subtitle */}
            <div className="flex flex-col items-center gap-2">
              <h1
                className="m-0 font-serif text-[40px] font-normal italic leading-[1.1] md:text-[48px]"
                style={{
                  background:
                    "linear-gradient(135deg, #F0EEFF 0%, #A88BFA 50%, #E879F9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Il tuo Coach personale
              </h1>
              <p
                className="m-0 font-serif italic text-[16px]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Analisi basata sui tuoi dati reali — nessun consiglio generico.
              </p>
            </div>

            {/* Mini-stats pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: "📊", label: `${monthTxCount} transazioni questo mese` },
                { icon: "💰", label: `€${monthSpent.toLocaleString("it-IT")} spesi` },
                { icon: "🎯", label: `${stats.savingsPercent}% risparmio` },
              ].map((stat, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
              ))}
            </div>
          </div>

          {/* ─── MAIN AREA ─── */}
          <div className="relative">
            {/* Pro overlay */}
            {!isPro && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[24px] px-8 py-16 text-center"
                style={{
                  background: "rgba(6,5,12,0.92)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-[20px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168,139,250,0.2), rgba(232,121,249,0.15))",
                    border: "1px solid rgba(168,139,250,0.4)",
                    boxShadow: "0 0 40px rgba(168,139,250,0.2)",
                  }}
                >
                  <Crown className="h-9 w-9 text-iri-pale" strokeWidth={1.4} />
                </div>
                <p className="m-0 font-serif text-[24px] italic text-ink-primary">
                  Il Coach aspetta solo te
                </p>
                <p className="m-0 mt-3 max-w-[380px] text-[14px] leading-[1.7] text-ink-secondary">
                  Con il Piano Pro accedi ad analisi AI personalizzate basate sui tuoi dati
                  di spesa reali. Niente consigli generici — solo insight su di te.
                </p>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex items-center gap-2 rounded-[14px] px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 animate-gradient-shift"
                  style={{
                    background:
                      "linear-gradient(135deg, #A88BFA, #E879F9, #60A5FA)",
                    backgroundSize: "200% 200%",
                    boxShadow: "0 8px 32px -8px rgba(168,139,250,0.7)",
                  }}
                >
                  <Crown className="h-4 w-4" strokeWidth={2} />
                  Sblocca Piano Pro
                </Link>
              </div>
            )}

            {/* ─── CONVERSATION HISTORY (collapsible) ─── */}
            {prevMessages.length > 0 && (
              <div
                className="mb-5 overflow-hidden rounded-[16px]"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <p className="m-0 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                    Conversazione precedente{" "}
                    {historyExchanges > 0 && `(${historyExchanges} scamb${historyExchanges === 1 ? "io" : "i"})`}
                  </p>
                  <ChevronDown
                    className="h-4 w-4 text-ink-muted transition-transform duration-200"
                    style={{
                      transform: historyOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    strokeWidth={1.8}
                  />
                </button>
                {historyOpen && (
                  <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto px-4 pb-4">
                    {prevMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.type === "user" ? (
                          <div
                            className="max-w-[80%] rounded-[12px] px-3 py-2"
                            style={{ background: "rgba(168,139,250,0.12)" }}
                          >
                            <p className="m-0 text-[13px] text-ink-primary">
                              {msg.text}
                            </p>
                          </div>
                        ) : (
                          <div
                            className="max-w-[85%] flex items-start gap-2 rounded-[12px] px-3 py-2"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                          >
                            <Sparkles
                              className="h-3 w-3 text-iri-pale mt-1 flex-shrink-0"
                              strokeWidth={1.8}
                            />
                            <p className="m-0 font-serif text-[13px] italic leading-[1.7] text-ink-secondary">
                              {msg.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── 5 PROMPT CARDS ─── */}
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              style={{ opacity: isPro ? 1 : 0.25 }}
            >
              {CARDS.slice(0, 4).map((card) => (
                <PromptCard
                  key={card.id}
                  card={card}
                  active={activePrompt === card.id}
                  isLoading={loading && activePrompt === card.id}
                  disabled={loading || !isPro}
                  onClick={() => fetchCoach(card.id, card.title)}
                />
              ))}
              {/* 5th card — centered */}
              <div className="sm:col-span-2 flex justify-center">
                <div className="w-full max-w-[500px]">
                  <PromptCard
                    card={CARDS[4]}
                    active={activePrompt === CARDS[4].id}
                    isLoading={loading && activePrompt === CARDS[4].id}
                    disabled={loading || !isPro}
                    onClick={() => fetchCoach(CARDS[4].id, CARDS[4].title)}
                  />
                </div>
              </div>
            </div>

            {/* ─── RESPONSE AREA ─── */}
            {(loading || response) && (
              <div
                className="mt-6 rounded-[20px] px-8 py-8 animate-slide-up"
                style={{
                  background: "rgba(168,139,250,0.06)",
                  border: "1px solid rgba(168,139,250,0.2)",
                  animationFillMode: "both",
                }}
              >
                {/* Header row */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles
                      className="h-5 w-5 text-iri-pale animate-pulse"
                      strokeWidth={1.6}
                    />
                    <p className="m-0 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      Coach risponde
                    </p>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={handleNewQuestion}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Loading skeleton */}
                {loading ? (
                  <div className="flex flex-col gap-3.5">
                    {([75, 100, 83, 66] as number[]).map((w, i) => (
                      <div
                        key={i}
                        className="h-4 rounded-full animate-pulse"
                        style={{
                          width: `${w}%`,
                          background: `rgba(168,139,250,${0.12 - i * 0.02})`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <p
                      className="m-0 font-serif italic text-[18px] leading-[1.8]"
                      style={{ color: "#F0EEFF" }}
                    >
                      {response}
                    </p>

                    {/* Source pill */}
                    {activePromptLabel && (
                      <div className="mt-4">
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{
                            background: "rgba(168,139,250,0.1)",
                            border: "1px solid rgba(168,139,250,0.25)",
                            borderRadius: 999,
                            padding: "4px 12px",
                            fontSize: 11,
                            color: "#C4B5FD",
                          }}
                        >
                          <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                          {activePromptLabel}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleNewQuestion}
                        className="text-[12px] text-ink-muted transition-colors hover:text-iri-pale"
                      >
                        ← Chiudi
                      </button>
                      <button
                        type="button"
                        onClick={handleNewConversation}
                        className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[12px] font-medium text-ink-secondary transition-all hover:text-ink-primary hover:bg-white/[0.04]"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        + Nuova domanda
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── FREE-TEXT INPUT ─── */}
            <div
              className="mt-6 rounded-[16px] p-4 transition-all duration-200"
              style={{
                background: "rgba(168,139,250,0.06)",
                border: inputFocused
                  ? "1px solid rgba(168,139,250,0.5)"
                  : "1px solid rgba(168,139,250,0.2)",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) =>
                      setCustomInput(e.target.value.slice(0, MAX_CHARS))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomSend();
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Fai una domanda personalizzata al tuo Coach..."
                    disabled={loading || !isPro}
                    className="w-full rounded-[12px] bg-transparent px-4 py-3 text-[14px] text-ink-primary placeholder:text-ink-muted outline-none"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono-tabular"
                    style={{
                      color: charOverLimit
                        ? "#FCA5A5"
                        : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCustomSend}
                  disabled={loading || !isPro || !customInput.trim()}
                  className="flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[13px] font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto w-full"
                  style={{
                    background: "linear-gradient(135deg, #A88BFA, #E879F9)",
                    boxShadow: "0 4px 16px -4px rgba(168,139,250,0.5)",
                  }}
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  Invia
                </button>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <BottomBar activeRoute="coach" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROMPT CARD COMPONENT
───────────────────────────────────────────────────────────── */
function PromptCard({
  card,
  active,
  isLoading,
  disabled,
  onClick,
}: {
  card: CardDef;
  active: boolean;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { Icon } = card;

  const borderColor =
    active || hovered
      ? card.border.replace("0.25)", "0.55)")
      : card.border;

  const shadow = hovered || active ? card.hoverGlow : "none";
  const translateY = hovered && !disabled ? "-4px" : "0px";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col gap-4 rounded-[18px] text-left w-full overflow-hidden"
      style={{
        minHeight: 140,
        padding: 20,
        background: card.bgGrad,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        transform: `translateY(${translateY})`,
        transition: "all 300ms cubic-bezier(0.2,0.8,0.2,1)",
        opacity: isLoading && !active ? 0.5 : 1,
      }}
    >
      {/* Shimmer overlay when loading */}
      {isLoading && active && (
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${card.iconColor}25, transparent)`,
            backgroundSize: "200% 100%",
          }}
        />
      )}

      {/* Icon */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[12px]"
        style={{
          background: `${card.iconColor}18`,
          border: `1px solid ${card.iconColor}30`,
        }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: card.iconColor }}
          strokeWidth={1.6}
        />
      </div>

      {/* Text */}
      <div>
        <p className="m-0 font-serif italic text-[18px] md:text-[20px] leading-tight text-ink-primary">
          {card.title}
        </p>
        <p className="m-0 mt-1.5 text-[13px] text-ink-secondary">
          {card.desc}
        </p>
      </div>
    </button>
  );
}
