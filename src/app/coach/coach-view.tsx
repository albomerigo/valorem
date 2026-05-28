"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Lock, Send } from "lucide-react";
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
}

const CARDS: {
  id: PromptType;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  { id: "analyze_month", emoji: "📊", title: "Analizza questo mese", desc: "Cosa dicono i tuoi numeri" },
  { id: "save_more", emoji: "💰", title: "Come risparmio di più?", desc: "Consigli pratici sui tuoi dati" },
  { id: "top_category", emoji: "🏆", title: "La mia categoria principale", desc: "Dove va il tuo denaro" },
  { id: "goals_check", emoji: "🎯", title: "Sono in linea?", desc: "Verifica i tuoi obiettivi" },
  { id: "monthly_trend", emoji: "📈", title: "Il mio andamento", desc: "Trend rispetto al mese scorso" },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInput, setCustomInput] = useState("");
  const MAX_CHARS = 150;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPro = plan === "pro";

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function fetchCoach(promptType: PromptType, userLabel: string, customQuestion?: string) {
    if (!isPro) return;

    const context = buildContext(promptType, stats, profile, transactions, customQuestion);

    // Add user message
    setMessages((prev) => {
      const next = [...prev, { type: "user" as const, text: userLabel, promptId: promptType }];
      return next.slice(-10);
    });

    setActivePrompt(promptType);
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

      // Add coach message
      setMessages((prev) => {
        const next = [...prev, { type: "coach" as const, text: coachText }];
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

  async function handlePrompt(card: typeof CARDS[0]) {
    await fetchCoach(card.id, card.title);
  }

  async function handleCustomSend() {
    const q = customInput.trim();
    if (!q || !isPro) return;
    await fetchCoach("custom", `"${q}"`, q);
    setCustomInput("");
  }

  function handleNewConversation() {
    setMessages([]);
    setResponse(null);
    setActivePrompt(null);
  }

  const charCount = customInput.length;
  const charOverLimit = charCount > 120;

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="coach" userName={profile.name || ""} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="AI Coach" showBack />

          {/* Page header */}
          <div className="mt-8 mb-8 flex flex-col items-center text-center gap-4">
            {/* Badge + New Conversation button */}
            <div className="flex items-center justify-between w-full">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{
                  background: "linear-gradient(135deg, rgba(168,139,250,0.15), rgba(96,165,250,0.1))",
                  border: "1px solid rgba(168,139,250,0.4)",
                  color: "#C4B5FD",
                }}
              >
                <span>✦</span> Esclusivo Pro
              </span>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="text-[12px] text-ink-muted transition-colors hover:text-iri-pale"
                  style={{
                    border: "1px solid rgba(168,139,250,0.25)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    background: "rgba(168,139,250,0.06)",
                  }}
                >
                  + Nuova conversazione
                </button>
              )}
            </div>

            {/* Avatar coach */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full shadow-[0_8px_32px_-8px_rgba(168,139,250,0.7)]"
              style={{
                background: "linear-gradient(135deg, #A88BFA 0%, #E879F9 50%, #60A5FA 100%)",
              }}
            >
              <Sparkles className="h-7 w-7 text-white animate-pulse" strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary md:text-[40px]">
                Il tuo Coach personale
              </h1>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
                Analisi basata sui tuoi dati reali — nessun consiglio generico.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Pro overlay */}
            {!isPro && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px] px-6 text-center"
                style={{ background: "rgba(10,8,18,0.88)", backdropFilter: "blur(8px)" }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] border border-iri-violet/30 bg-gradient-to-br from-iri-violet/20 to-iri-magenta/10">
                  <Lock className="h-6 w-6 text-iri-pale" strokeWidth={1.6} />
                </div>
                <p className="m-0 text-[16px] font-medium text-ink-primary">
                  Funzione disponibile con Piano Pro
                </p>
                <p className="m-0 mt-2 max-w-[320px] text-[13px] leading-[1.6] text-ink-secondary">
                  Ottieni analisi AI personalizzate basate sui tuoi dati di spesa reali.
                </p>
                <Link
                  href="/pricing"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-6 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-6px_rgba(168,139,250,0.6)] transition-all [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
                >
                  Scopri Pro →
                </Link>
              </div>
            )}

            {/* 5 Cards grid: 1 col on mobile, 2+2+1 on sm+ */}
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              style={{ opacity: isPro ? 1 : 0.3 }}
            >
              {CARDS.map((card) => {
                const isActive = activePrompt === card.id && (loading || !!response);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handlePrompt(card)}
                    disabled={loading || !isPro}
                    className={`group relative flex flex-col gap-2 rounded-[16px] text-left transition-all duration-[300ms] ${
                      card.id === "monthly_trend" ? "sm:col-span-2 sm:max-w-sm sm:mx-auto sm:w-full" : ""
                    }`}
                    style={{
                      padding: "14px",
                      background: isActive
                        ? "rgba(168,139,250,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: isActive
                        ? "1px solid rgba(168,139,250,0.5)"
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.border = "1px solid rgba(168,139,250,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                    }}
                  >
                    <span className="text-[20px] leading-none sm:text-[28px]">{card.emoji}</span>
                    <div>
                      <p className="m-0 text-[13px] font-medium text-ink-primary sm:text-[14px]">
                        {card.title}
                      </p>
                      <p className="m-0 mt-1 hidden text-[12px] text-ink-secondary sm:block">
                        {card.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Free-text input */}
            <div className="mt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value.slice(0, MAX_CHARS))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCustomSend(); }}
                    placeholder="Chiedi qualcosa al tuo Coach... (max 150 caratteri)"
                    disabled={loading || !isPro}
                    className="w-full rounded-[14px] px-4 py-3 text-[13px] text-ink-primary placeholder:text-ink-muted outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(168,139,250,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,139,250,0.6)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(168,139,250,0.2)"; }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono"
                    style={{ color: charOverLimit ? "#FCA5A5" : "rgba(255,255,255,0.3)" }}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCustomSend}
                  disabled={loading || !isPro || !customInput.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-[12px] px-5 py-3 text-[13px] font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto w-full"
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

            {/* Conversation history */}
            {messages.length > 0 && (
              <div
                className="mt-5 flex flex-col gap-3 max-h-[320px] overflow-y-auto rounded-[18px] p-4"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="m-0 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
                  Cronologia sessione
                </p>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.type === "user" ? (
                      <div
                        className="max-w-[80%] rounded-[12px] px-3 py-2"
                        style={{ background: "rgba(168,139,250,0.12)" }}
                      >
                        <p className="m-0 text-[13px] text-ink-primary">{msg.text}</p>
                      </div>
                    ) : (
                      <div
                        className="max-w-[85%] flex items-start gap-2 rounded-[12px] px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <Sparkles className="h-3 w-3 text-iri-pale mt-1 flex-shrink-0" strokeWidth={1.8} />
                        <p className="m-0 font-serif text-[13px] italic leading-[1.7] text-ink-secondary">
                          {msg.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Current response area */}
            {(loading || response) && (
              <div
                className="mt-5 rounded-[18px] px-6 py-6"
                style={{
                  background: "rgba(168,139,250,0.05)",
                  border: "1px solid rgba(168,139,250,0.2)",
                }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />
                    <p className="m-0 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                      Coach dice:
                    </p>
                  </div>
                  {!loading && response && (
                    <button
                      type="button"
                      onClick={() => {
                        setResponse(null);
                        setActivePrompt(null);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col gap-3">
                    <div
                      className="h-4 w-3/4 rounded-full animate-pulse"
                      style={{ background: "rgba(168,139,250,0.12)" }}
                    />
                    <div
                      className="h-4 w-full rounded-full animate-pulse"
                      style={{ background: "rgba(168,139,250,0.09)", animationDelay: "150ms" }}
                    />
                    <div
                      className="h-4 w-5/6 rounded-full animate-pulse"
                      style={{ background: "rgba(168,139,250,0.07)", animationDelay: "300ms" }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="m-0 font-serif text-[14px] italic leading-[1.8] text-ink-primary md:text-[16px]">
                      {response}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResponse(null);
                        setActivePrompt(null);
                      }}
                      className="mt-4 text-[12px] text-ink-muted transition-colors hover:text-iri-pale"
                    >
                      ← Chiedi altro
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomBar activeRoute="coach" />
    </div>
  );
}
